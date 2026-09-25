"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { listMissions, listDocuments, getProfile } from "@/lib/services";
import { useAuthStore } from "@/store/auth";
import type { FinancialMission, Document, FinancialProfile } from "@/types";
import { GOAL_CATEGORY_ICONS, GOAL_CATEGORY_LABELS } from "@/types";
import { formatAmount, isAuthenticated } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const { user, initialize } = useAuthStore();

  const [missions, setMissions] = useState<FinancialMission[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initialize();
    if (!isAuthenticated()) {
      router.push("/login");
      return;
    }
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [m, d, p] = await Promise.all([
        listMissions().catch(() => []),
        listDocuments().catch(() => []),
        getProfile().catch(() => null),
      ]);
      setMissions(m);
      setDocuments(d);
      setProfile(p);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const activeMission = missions.find((m) => m.status === "ACTIVE") || missions[0];

  // Dynamic calculations
  const confirmedDocs = documents.filter((d) => d.processing_status === "confirmed").length;
  const docTotalTarget = Math.max(documents.length, 4);
  const docCompletionPct = Math.min(100, Math.round((confirmedDocs / docTotalTarget) * 100));
  const profileCompletionPct = profile?.completion_percentage || 0;
  const goalCompletionPct = activeMission ? 100 : 0;
  const overallReadiness = Math.round((goalCompletionPct * 0.3) + (profileCompletionPct * 0.35) + (docCompletionPct * 0.35));

  // Determine Next Best Action dynamically
  const unverifiedDoc = documents.find((d) => d.processing_status === "review_required" || d.processing_status === "extracted");
  
  let nba = {
    title: "Verify your salary slip",
    why: "We found a salary document, but some extracted information needs confirmation to become trusted data.",
    btnText: "Review Document",
    href: "/documents",
    tag: "Priority Action",
  };

  if (unverifiedDoc) {
    nba = {
      title: `Verify your ${unverifiedDoc.document_type ? unverifiedDoc.document_type.replace(/_/g, " ") : "document"}`,
      why: "We extracted fields from this document, but your confirmation is required before proceeding to assessment.",
      btnText: "Review Document",
      href: `/documents/${unverifiedDoc.id}`,
      tag: "Verification Needed",
    };
  } else if (!activeMission) {
    nba = {
      title: "Create your Financial Mission",
      why: "A Financial Mission is where your journey begins. Tell FinPath what you're trying to achieve.",
      btnText: "Start Goal Wizard",
      href: "/mission/new",
      tag: "First Step",
    };
  } else if (profileCompletionPct < 80) {
    nba = {
      title: "Complete your Financial Profile",
      why: `Your profile is at ${Math.round(profileCompletionPct)}%. Adding income and expense details enables accurate readiness assessment.`,
      btnText: "Update Profile",
      href: "/profile",
      tag: "Profile Gap",
    };
  } else if (documents.length < 3) {
    nba = {
      title: "Upload Bank Statement",
      why: "Lenders require 6 months of verified banking history to issue approval in principle.",
      btnText: "Upload Document",
      href: "/documents",
      tag: "Documentation",
    };
  }

  // Greeting
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? "Good morning" : currentHour < 18 ? "Good afternoon" : "Good evening";
  const firstName = user?.full_name ? user.full_name.split(" ")[0] : "there";

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f4f6fb" }}>
        <AppNav />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <div className="spinner" style={{ width: 36, height: 36 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", paddingBottom: 80 }}>
      <AppNav />

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome Header */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#002e6e", margin: "0 0 6px", letterSpacing: "-0.02em" }}>
              {greeting}, {firstName}
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              {activeMission
                ? "Here is the real-time status of your active financial journey."
                : "Create a Financial Mission to turn your goal into a structured journey."}
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/mission/new" id="create-mission-btn" className="btn-primary" style={{ padding: "10px 20px" }}>
              + New Mission
            </Link>
          </div>
        </div>

        {/* SECTION 6: PROMINENT NEXT BEST ACTION CARD */}
        <div className="nba-card" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="badge badge-amber" style={{ fontSize: 11 }}>
                  ⚡ {nba.tag}
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Your Next Best Action
                </span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#002e6e", margin: "0 0 6px" }}>
                {nba.title}
              </h2>
              <p style={{ fontSize: 13.5, color: "#334155", margin: 0, lineHeight: 1.5 }}>
                {nba.why}
              </p>
            </div>
            <Link
              href={nba.href}
              className="btn-primary"
              style={{
                alignSelf: "center",
                padding: "11px 24px",
                borderRadius: 10,
                background: "#0052cc",
                whiteSpace: "nowrap",
              }}
            >
              {nba.btnText} →
            </Link>
          </div>
        </div>

        {/* SECTION 5: YOUR FINANCIAL MISSION HERO CARD */}
        {activeMission ? (
          <div
            className="card"
            style={{
              marginBottom: 28,
              border: "1.5px solid #d9e2ec",
              borderRadius: 20,
              padding: "28px 32px",
              background: "#ffffff",
              boxShadow: "0 4px 20px rgba(0, 46, 110, 0.05)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: "#ebf4ff",
                    borderRadius: 14,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 26,
                  }}
                >
                  {GOAL_CATEGORY_ICONS[activeMission.goal_category] || "🎯"}
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase" }}>
                      Active Financial Mission
                    </span>
                    <span className="badge badge-green">ACTIVE</span>
                  </div>
                  <h2 style={{ fontSize: 22, fontWeight: 800, color: "#002e6e", margin: 0 }}>
                    {activeMission.goal_title}
                  </h2>
                </div>
              </div>

              <Link
                href={`/mission/${activeMission.id}`}
                className="btn-secondary"
                style={{ fontSize: 13, padding: "8px 16px" }}
              >
                View Full Mission →
              </Link>
            </div>

            {/* Financial Numbers Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: 16,
                padding: "20px 24px",
                background: "#f8fafc",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                marginBottom: 24,
              }}
            >
              <div>
                <span className="stat-label">Target Amount</span>
                <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#002e6e" }}>
                  {activeMission.target_amount ? formatAmount(activeMission.target_amount, activeMission.currency) : "—"}
                </p>
              </div>
              <div>
                <span className="stat-label">Target Timeline</span>
                <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#002e6e" }}>
                  {activeMission.timeline_text || "1 Year"}
                </p>
              </div>
              <div>
                <span className="stat-label">Destination</span>
                <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: "#002e6e" }}>
                  {activeMission.destination || "General"}
                </p>
              </div>
              <div>
                <span className="stat-label">Journey Readiness</span>
                <p style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 800, color: overallReadiness >= 70 ? "#00875a" : "#0052cc" }}>
                  {overallReadiness}%
                </p>
              </div>
            </div>

            {/* Overall Progress Bar */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
                <span style={{ color: "#334155" }}>Overall Readiness Progress</span>
                <span style={{ color: "#0052cc", fontWeight: 700 }}>{overallReadiness}% Complete</span>
              </div>
              <div className="progress-track" style={{ height: 10 }}>
                <div className="progress-fill" style={{ width: `${overallReadiness}%` }} />
              </div>
            </div>

            {/* MISSION PROGRESS BREAKDOWN */}
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 800, color: "#002e6e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
                Mission Progress Breakdown
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: 12 }}>
                <div style={{ padding: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Goal Definition</span>
                    <span style={{ color: "#00875a", fontWeight: 800, fontSize: 16 }}>✓</span>
                  </div>
                  <span className="badge badge-green" style={{ fontSize: 11 }}>Confirmed</span>
                </div>

                <div style={{ padding: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Financial Profile</span>
                    <span style={{ color: profileCompletionPct >= 80 ? "#00875a" : "#b45309", fontWeight: 800, fontSize: 14 }}>
                      {profileCompletionPct >= 80 ? "✓" : `${Math.round(profileCompletionPct)}%`}
                    </span>
                  </div>
                  <span className={profileCompletionPct >= 80 ? "badge badge-green" : "badge badge-amber"} style={{ fontSize: 11 }}>
                    {profileCompletionPct >= 80 ? "Verified" : "In Progress"}
                  </span>
                </div>

                <div style={{ padding: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Documents</span>
                    <span style={{ color: "#0052cc", fontWeight: 800, fontSize: 14 }}>
                      {confirmedDocs}/{docTotalTarget}
                    </span>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>
                    {confirmedDocs} Verified
                  </span>
                </div>

                <div style={{ padding: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Assessment</span>
                    <span style={{ color: "#0052cc", fontWeight: 800, fontSize: 14 }}>70%</span>
                  </div>
                  <span className="badge badge-blue" style={{ fontSize: 11 }}>Calculating</span>
                </div>

                <div style={{ padding: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#64748b" }}>Financial Options</span>
                    <span style={{ color: "#94a3b8", fontSize: 14 }}>○</span>
                  </div>
                  <span className="badge badge-gray" style={{ fontSize: 11 }}>Pending</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Empty Mission Card */
          <div className="card" style={{ textAlign: "center", padding: "50px 24px", marginBottom: 28 }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#002e6e", marginBottom: 8 }}>
              No Active Financial Mission Yet
            </h2>
            <p style={{ color: "#64748b", maxWidth: 440, margin: "0 auto 24px", fontSize: 14 }}>
              FinPath journeys are built around your life goals. Tell us what you want to achieve to get started.
            </p>
            <Link href="/mission/new" className="btn-primary" style={{ padding: "12px 28px", borderRadius: 10 }}>
              Create Your First Mission →
            </Link>
          </div>
        )}

        {/* 2-Column Section: Documents Overview & Profile Snapshot */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {/* Documents Snapshot */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>📁</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#002e6e", margin: 0 }}>
                  Recent Documents
                </h3>
              </div>
              <Link href="/documents" style={{ fontSize: 13, fontWeight: 700, color: "#0052cc", textDecoration: "none" }}>
                View All ({documents.length}) →
              </Link>
            </div>

            {documents.length === 0 ? (
              <div style={{ padding: "24px 0", textAlign: "center", color: "#94a3b8" }}>
                <p style={{ fontSize: 13.5, margin: "0 0 12px" }}>No documents uploaded yet.</p>
                <Link href="/documents" className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>
                  + Upload Document
                </Link>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {documents.slice(0, 3).map((d) => (
                  <div
                    key={d.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 10 }}>
                      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#1e293b" }}>
                        {d.document_type ? d.document_type.replace(/_/g, " ").toUpperCase() : d.original_filename}
                      </p>
                      <span style={{ fontSize: 11.5, color: "#64748b" }}>{d.original_filename}</span>
                    </div>
                    <span
                      className={
                        d.processing_status === "confirmed"
                          ? "badge badge-green"
                          : d.processing_status === "review_required"
                          ? "badge badge-amber"
                          : "badge badge-blue"
                      }
                      style={{ fontSize: 11 }}
                    >
                      {d.processing_status === "confirmed" ? "Verified" : d.processing_status === "review_required" ? "Review" : d.processing_status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Financial Profile Snapshot */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18 }}>👤</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: "#002e6e", margin: 0 }}>
                  Financial Snapshot
                </h3>
              </div>
              <Link href="/profile" style={{ fontSize: 13, fontWeight: 700, color: "#0052cc", textDecoration: "none" }}>
                Update Profile →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 16 }}>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span className="stat-label">Monthly Income</span>
                <p style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 800, color: "#002e6e" }}>
                  {profile?.monthly_income ? formatAmount(profile.monthly_income, profile.currency) : "—"}
                </p>
              </div>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span className="stat-label">Current Savings</span>
                <p style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 800, color: "#002e6e" }}>
                  {profile?.savings ? formatAmount(profile.savings, profile.currency) : "—"}
                </p>
              </div>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span className="stat-label">Monthly Expenses</span>
                <p style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 800, color: "#002e6e" }}>
                  {profile?.monthly_expenses ? formatAmount(profile.monthly_expenses, profile.currency) : "—"}
                </p>
              </div>
              <div style={{ padding: "12px", background: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0" }}>
                <span className="stat-label">Existing EMIs</span>
                <p style={{ margin: "2px 0 0", fontSize: 17, fontWeight: 800, color: "#002e6e" }}>
                  {profile?.existing_emi ? formatAmount(profile.existing_emi, profile.currency) : "—"}
                </p>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 12, fontWeight: 600 }}>
                <span style={{ color: "#475569" }}>Profile Completeness</span>
                <span style={{ color: "#0052cc", fontWeight: 700 }}>{Math.round(profileCompletionPct)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill-green" style={{ width: `${profileCompletionPct}%` }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
