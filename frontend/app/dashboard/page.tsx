"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { listMissions, listDocuments, getProfile } from "@/lib/services";
import { useAuthStore } from "@/store/auth";
import type { FinancialMission, Document, FinancialProfile } from "@/types";
import { GOAL_CATEGORY_ICONS, GOAL_CATEGORY_LABELS, DOCUMENT_TYPE_LABELS } from "@/types";
import { formatAmount, getDocumentStatusLabel, getDocumentStatusIcon, getDocumentStatusColor } from "@/lib/utils";
import { isAuthenticated } from "@/lib/utils";

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
        listMissions(),
        listDocuments(),
        getProfile(),
      ]);
      setMissions(m);
      setDocuments(d);
      setProfile(p);
    } catch {
      // Handle silently — auth interceptor handles 401
    } finally {
      setLoading(false);
    }
  };

  const activeMission = missions.find((m) => m.status === "ACTIVE") || missions[0];

  // Calculate mission progress
  const documentCompletion = Math.min(100, (documents.filter(d => d.processing_status === "confirmed").length / 4) * 100);
  const profileCompletion = profile?.completion_percentage || 0;
  const goalCompletion = activeMission ? 100 : 0;
  const overallCompletion = Math.round((documentCompletion + profileCompletion + goalCompletion) / 3);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
        <AppNav />
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "60vh" }}>
          <div className="spinner" style={{ width: 32, height: 32 }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      <AppNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
              {user ? `Welcome back, ${user.full_name.split(" ")[0]}` : "Dashboard"}
            </h1>
            <p style={{ color: "#6b7280", fontSize: 14 }}>
              {activeMission ? "Your financial journey is in progress." : "Create a Financial Mission to get started."}
            </p>
          </div>
          <Link href="/mission/new" id="create-mission-btn" className="btn-primary" style={{ flexShrink: 0 }}>
            + New Mission
          </Link>
        </div>

        {/* No missions empty state */}
        {missions.length === 0 && (
          <div className="card" style={{ textAlign: "center", padding: 64 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              You haven&apos;t created a Financial Mission yet.
            </h2>
            <p style={{ color: "#6b7280", marginBottom: 28, maxWidth: 420, margin: "0 auto 28px" }}>
              A Financial Mission is where your journey begins. Tell FinPath what you&apos;re trying to achieve.
            </p>
            <Link href="/mission/new" id="empty-create-mission-btn" className="btn-primary" style={{ padding: "12px 28px" }}>
              Create My First Mission
            </Link>
          </div>
        )}

        {/* Active Mission Card */}
        {activeMission && (
          <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid #1d4ed8" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 28 }}>{GOAL_CATEGORY_ICONS[activeMission.goal_category] || "⭐"}</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
                        {activeMission.goal_title}
                      </h2>
                      <span className={`badge ${activeMission.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>
                        {activeMission.status}
                      </span>
                    </div>
                    <p style={{ fontSize: 13, color: "#6b7280" }}>
                      {GOAL_CATEGORY_LABELS[activeMission.goal_category]}
                      {activeMission.destination && ` · ${activeMission.destination}`}
                    </p>
                  </div>
                </div>
              </div>
              <Link href={`/mission/${activeMission.id}`} className="btn-secondary" style={{ fontSize: 13 }}>
                View Mission →
              </Link>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
              <div style={{ textAlign: "center" }}>
                <p className="label">Target Amount</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                  {activeMission.target_amount ? formatAmount(activeMission.target_amount) : "—"}
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p className="label">Timeline</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>
                  {activeMission.timeline_text || "—"}
                </p>
              </div>
              <div style={{ textAlign: "center" }}>
                <p className="label">Overall Progress</p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "#1d4ed8" }}>
                  {overallCompletion}%
                </p>
              </div>
            </div>

            {/* Progress bars */}
            <div style={{ display: "grid", gap: 12 }}>
              {[
                { label: "Goal Information", value: goalCompletion },
                { label: "Documents", value: documentCompletion },
                { label: "Financial Profile", value: profileCompletion },
              ].map((item) => (
                <div key={item.label}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: "#374151" }}>{item.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: item.value === 100 ? "#059669" : "#374151" }}>
                      {Math.round(item.value)}%
                    </span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2-column grid: Profile + Documents */}
        {activeMission && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
            {/* Financial Profile */}
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Financial Profile</h3>
                <Link href="/profile" id="view-profile-btn" style={{ fontSize: 13, color: "#1d4ed8", textDecoration: "none", fontWeight: 500 }}>
                  Edit →
                </Link>
              </div>

              <div style={{ display: "grid", gap: 14 }}>
                {[
                  { label: "Monthly Income", value: profile?.monthly_income ? formatAmount(profile.monthly_income) + "/month" : null },
                  { label: "Savings", value: profile?.savings ? formatAmount(profile.savings) : null },
                  { label: "Monthly Expenses", value: profile?.monthly_expenses ? formatAmount(profile.monthly_expenses) : null },
                  { label: "Existing EMI", value: profile?.existing_emi ? formatAmount(profile.existing_emi) + "/month" : null },
                  { label: "Employment", value: profile?.employment_status || null },
                ].map((item) => (
                  <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#6b7280" }}>{item.label}</span>
                    <span style={{ fontSize: 14, fontWeight: item.value ? 500 : 400, color: item.value ? "#111827" : "#d1d5db" }}>
                      {item.value || "Not provided"}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>Profile Completeness</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151" }}>{profileCompletion}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${profileCompletion}%` }} />
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="card" id="documents">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Documents</h3>
                <Link href={`/mission/${activeMission?.id}#upload`} id="upload-doc-btn" style={{ fontSize: 13, color: "#1d4ed8", textDecoration: "none", fontWeight: 500 }}>
                  + Upload
                </Link>
              </div>

              {documents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "24px 0" }}>
                  <p style={{ fontSize: 14, color: "#9ca3af", marginBottom: 16 }}>
                    Add your financial documents to build your profile.
                  </p>
                  <Link href={`/mission/${activeMission?.id}#upload`} className="btn-secondary" style={{ fontSize: 13 }}>
                    Upload Document
                  </Link>
                </div>
              ) : (
                <div style={{ display: "grid", gap: 12 }}>
                  {documents.slice(0, 5).map((doc) => (
                    <Link
                      key={doc.id}
                      href={`/documents/${doc.id}`}
                      id={`doc-item-${doc.id}`}
                      style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "10px 14px", background: "#f8f9fc", borderRadius: 8,
                        border: "1px solid #e5e7eb", textDecoration: "none",
                        transition: "background 0.1s",
                      }}
                    >
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>
                          {doc.original_filename}
                        </p>
                        <p style={{ fontSize: 12, color: "#6b7280" }}>
                          {doc.document_type ? DOCUMENT_TYPE_LABELS[doc.document_type] : "Classifying…"}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={`${getDocumentStatusColor(doc.processing_status)}`} style={{ fontSize: 12, fontWeight: 500 }}>
                          {getDocumentStatusIcon(doc.processing_status)} {getDocumentStatusLabel(doc.processing_status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                  {documents.length > 5 && (
                    <p style={{ fontSize: 13, color: "#6b7280", textAlign: "center" }}>
                      +{documents.length - 5} more documents
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Step */}
        {activeMission && (
          <div className="card" style={{ borderTop: "3px solid #1d4ed8", background: "#fafbff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                  Next Step
                </p>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                  {profileCompletion < 40 ? "Upload a salary slip or bank statement" :
                    profileCompletion < 80 ? "Complete your financial profile" :
                      documents.filter(d => d.processing_status === "review_required").length > 0 ? "Review extracted document data" :
                        "Your profile is looking good!"}
                </h3>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  {profileCompletion < 40
                    ? "Add your salary slip to automatically populate your income information."
                    : profileCompletion < 80
                      ? "Fill in any missing financial information to complete your profile."
                      : documents.filter(d => d.processing_status === "review_required").length > 0
                        ? "Some documents have extracted data waiting for your review."
                        : "Upload more documents or continue your financial journey."}
                </p>
              </div>
              {profileCompletion < 40 ? (
                <Link href={`/mission/${activeMission.id}#upload`} className="btn-primary" id="next-step-btn">
                  Upload Document
                </Link>
              ) : documents.filter(d => d.processing_status === "review_required").length > 0 ? (
                <Link href={`/documents/${documents.find(d => d.processing_status === "review_required")?.id}`} className="btn-primary" id="next-step-btn">
                  Review Data
                </Link>
              ) : (
                <Link href="/profile" className="btn-primary" id="next-step-btn">
                  Edit Profile
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Other missions */}
        {missions.length > 1 && (
          <div style={{ marginTop: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 16 }}>Other Missions</h3>
            <div style={{ display: "grid", gap: 12 }}>
              {missions.slice(1).map((m) => (
                <Link
                  key={m.id}
                  href={`/mission/${m.id}`}
                  id={`mission-item-${m.id}`}
                  className="card"
                  style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    textDecoration: "none", padding: "16px 20px"
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 20 }}>{GOAL_CATEGORY_ICONS[m.goal_category]}</span>
                    <div>
                      <p style={{ fontWeight: 600, color: "#111827" }}>{m.goal_title}</p>
                      <p style={{ fontSize: 13, color: "#6b7280" }}>{m.target_amount ? formatAmount(m.target_amount) : "Amount not set"}</p>
                    </div>
                  </div>
                  <span className={`badge ${m.status === "ACTIVE" ? "badge-green" : "badge-gray"}`}>{m.status}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
