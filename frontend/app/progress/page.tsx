"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated, formatAmount } from "@/lib/utils";
import { listMissions, getProfile, listDocuments, getGlobalReadiness, getGlobalNBA } from "@/lib/services";
import type { FinancialMission, FinancialProfile, Document, ReadinessReport, NBAAction } from "@/types";
import { MISSION_STAGES } from "@/types";

export default function ProgressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [mission, setMission] = useState<FinancialMission | null>(null);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [nba, setNba] = useState<NBAAction | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }
    loadAll();
  }, []);

  async function loadAll() {
    try {
      const [missions, p, docs, r, n] = await Promise.all([
        listMissions(),
        getProfile(),
        listDocuments(),
        getGlobalReadiness().catch(() => null),
        getGlobalNBA().catch(() => null),
      ]);
      const active = missions.find((m) => m.status === "ACTIVE") || missions[0] || null;
      setMission(active);
      setProfile(p);
      setDocuments(docs);
      setReadiness(r);
      setNba(n);
    } catch {
      // silently handled
    } finally {
      setLoading(false);
    }
  }

  const confirmedDocs = documents.filter((d) => d.processing_status === "confirmed");
  const pendingDocs = documents.filter((d) => ["review_required", "extracted"].includes(d.processing_status));
  const uploadedDocs = documents.filter((d) => ["uploaded", "processing"].includes(d.processing_status));

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F8FC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#52606D" }}>Loading progress…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F8FC" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #D9E2EC",
        padding: "20px 32px",
      }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: "#102A43" }}>Progress Dashboard</h1>
        <p style={{ fontSize: 13, color: "#52606D" }}>Your complete financial journey status</p>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 24px" }}>
        {/* Overall readiness ring */}
        <div style={{
          background: "#fff", borderRadius: 14, padding: "28px",
          border: "1px solid #D9E2EC", marginBottom: 24,
          display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
        }}>
          {/* Score display */}
          <div style={{ textAlign: "center", minWidth: 140 }}>
            <div style={{
              width: 120, height: 120, margin: "0 auto 12px",
              borderRadius: "50%",
              background: `conic-gradient(#0057D9 ${(readiness?.overall_score || 0) * 3.6}deg, #E8F0FE 0deg)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative",
            }}>
              <div style={{
                width: 90, height: 90, borderRadius: "50%",
                background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column",
              }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: "#0057D9" }}>
                  {(readiness?.overall_score || 0).toFixed(0)}%
                </span>
              </div>
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#102A43" }}>Financial Readiness</p>
            <p style={{ fontSize: 12, color: "#52606D" }}>Deterministic score</p>
          </div>

          <div style={{ flex: 1 }}>
            {readiness ? (
              <>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#102A43", marginBottom: 14 }}>Score Breakdown</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {readiness.components.map((c) => (
                    <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ fontSize: 12, color: "#52606D", width: 160, flexShrink: 0 }}>{c.name}</span>
                      <div style={{ flex: 1, background: "#E8F0FE", borderRadius: 4, height: 8, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 4, width: `${c.score}%`,
                          background: c.score >= 80 ? "#16803C" : c.score >= 50 ? "#D9822B" : "#D64545",
                          transition: "width 0.6s ease",
                        }} />
                      </div>
                      <span style={{
                        fontSize: 12, fontWeight: 700, width: 36, textAlign: "right",
                        color: c.score >= 80 ? "#16803C" : c.score >= 50 ? "#D9822B" : "#D64545",
                      }}>{c.score.toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
                {readiness.what_is_affecting.length > 0 && (
                  <div style={{ marginTop: 16, padding: "12px", background: "#FFF8ED", borderRadius: 8, border: "1px solid #F5D9A8" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#D9822B", marginBottom: 6 }}>What is affecting your score:</p>
                    {readiness.what_is_affecting.map((issue, i) => (
                      <p key={i} style={{ fontSize: 12, color: "#52606D" }}>• {issue}</p>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: "#52606D", fontSize: 14 }}>
                <p>Create a mission and complete your profile to see your readiness breakdown.</p>
                <Link href="/mission/new" style={{ color: "#0057D9", fontWeight: 600, textDecoration: "none" }}>
                  Create Mission →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* NBA */}
        {nba && (
          <div style={{
            background: "#EEF4FF", border: "1.5px solid #0057D9",
            borderRadius: 14, padding: "20px 24px", marginBottom: 24,
            display: "flex", alignItems: "center", gap: 16,
          }}>
            <span style={{ fontSize: 28 }}>{nba.icon}</span>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#0057D9", textTransform: "uppercase", letterSpacing: "0.06em" }}>Next Best Action</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#102A43" }}>{nba.action}</p>
              <p style={{ fontSize: 13, color: "#52606D" }}>{nba.reason}</p>
            </div>
            <Link href={nba.target_route} style={{
              padding: "10px 20px", background: "#0057D9", color: "#fff",
              borderRadius: 8, fontWeight: 600, fontSize: 13, textDecoration: "none",
            }}>
              Take Action
            </Link>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
          {/* Mission stage */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #D9E2EC" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#52606D", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Mission Stage
            </h3>
            {mission ? (
              <>
                <p style={{ fontSize: 24, fontWeight: 800, color: "#0057D9" }}>{mission.stage}/7</p>
                <p style={{ fontSize: 13, color: "#102A43", fontWeight: 600 }}>
                  {MISSION_STAGES[mission.stage - 1]?.name}
                </p>
                <div style={{ display: "flex", gap: 3, marginTop: 12 }}>
                  {MISSION_STAGES.map((s, i) => (
                    <div key={s.id} style={{
                      flex: 1, height: 5, borderRadius: 3,
                      background: i + 1 < mission.stage ? "#0057D9" : i + 1 === mission.stage ? "#00AEEF" : "#E8F0FE",
                    }} />
                  ))}
                </div>
              </>
            ) : (
              <p style={{ color: "#52606D", fontSize: 13 }}>No active mission</p>
            )}
          </div>

          {/* Profile */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #D9E2EC" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#52606D", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Financial Profile
            </h3>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#00AEEF" }}>
              {profile ? `${profile.completion_percentage.toFixed(0)}%` : "0%"}
            </p>
            <p style={{ fontSize: 13, color: "#52606D" }}>
              {profile?.monthly_income ? `₹${formatAmount(profile.monthly_income)}/mo` : "No income added"}
            </p>
            <Link href="/profile" style={{ display: "block", marginTop: 12, fontSize: 12, color: "#0057D9", fontWeight: 600, textDecoration: "none" }}>
              Update profile →
            </Link>
          </div>

          {/* Documents */}
          <div style={{ background: "#fff", borderRadius: 14, padding: "20px", border: "1px solid #D9E2EC" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "#52606D", marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Documents
            </h3>
            <p style={{ fontSize: 24, fontWeight: 800, color: "#16803C" }}>{confirmedDocs.length}/{documents.length}</p>
            <p style={{ fontSize: 13, color: "#52606D" }}>Verified</p>
            {pendingDocs.length > 0 && (
              <p style={{ fontSize: 12, color: "#D9822B", fontWeight: 600, marginTop: 6 }}>
                {pendingDocs.length} needs review
              </p>
            )}
            <Link href="/documents" style={{ display: "block", marginTop: 8, fontSize: 12, color: "#0057D9", fontWeight: 600, textDecoration: "none" }}>
              Manage documents →
            </Link>
          </div>
        </div>

        {/* Completed checklist */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #D9E2EC" }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, color: "#102A43", marginBottom: 16 }}>Journey Checklist</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Mission created", done: !!mission, link: "/mission/new" },
              { label: "Financial profile started", done: !!profile && profile.completion_percentage > 0, link: "/profile" },
              { label: "Financial profile 80%+", done: !!profile && profile.completion_percentage >= 80, link: "/profile" },
              { label: "First document uploaded", done: documents.length > 0, link: "/documents" },
              { label: "First document verified", done: confirmedDocs.length > 0, link: "/documents" },
              { label: "Readiness score 60%+", done: (readiness?.overall_score || 0) >= 60, link: "/progress" },
              { label: "Readiness score 80%+", done: (readiness?.overall_score || 0) >= 80, link: "/progress" },
              { label: "Mission stage 4+ reached", done: !!mission && mission.stage >= 4, link: "/missions" },
            ].map((item) => (
              <div key={item.label} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", borderRadius: 8,
                background: item.done ? "#F0FFF4" : "#F5F8FC",
                border: `1px solid ${item.done ? "#B7E4C7" : "#E8F0FE"}`,
              }}>
                <span style={{ fontSize: 18 }}>{item.done ? "✅" : "⬜"}</span>
                <span style={{ flex: 1, fontSize: 13, color: item.done ? "#16803C" : "#52606D", fontWeight: item.done ? 600 : 400 }}>
                  {item.label}
                </span>
                {!item.done && (
                  <Link href={item.link} style={{ fontSize: 12, color: "#0057D9", fontWeight: 600, textDecoration: "none" }}>
                    Complete →
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
