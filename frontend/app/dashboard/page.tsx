"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated, formatAmount } from "@/lib/utils";
import {
  listMissions, getProfile, listDocuments,
  getGlobalNBA, getGlobalReadiness,
} from "@/lib/services";
import type { FinancialMission, FinancialProfile, Document, NBAAction, ReadinessReport } from "@/types";
import { GOAL_CATEGORY_ICONS, GOAL_CATEGORY_LABELS, MISSION_STAGES } from "@/types";

const PRIORITY_COLORS: Record<string, string> = {
  critical: "#D64545", high: "#D9822B", medium: "#0057D9", low: "#16803C",
};
const PRIORITY_BG: Record<string, string> = {
  critical: "#FFF5F5", high: "#FFF8ED", medium: "#EEF4FF", low: "#F0FFF4",
};

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [missions, setMissions] = useState<FinancialMission[]>([]);
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [nba, setNba] = useState<NBAAction | null>(null);
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const [m, p, d] = await Promise.all([
        listMissions(),
        getProfile(),
        listDocuments(),
      ]);
      setMissions(m);
      setProfile(p);
      setDocuments(d);

      // Load NBA and readiness (these depend on having a mission)
      const [nbaData, readinessData] = await Promise.all([
        getGlobalNBA().catch(() => null),
        getGlobalReadiness().catch(() => null),
      ]);
      setNba(nbaData);
      setReadiness(readinessData);
    } catch {
      setError("Failed to load dashboard. Please refresh.");
    } finally {
      setLoading(false);
    }
  }

  const activeMission = missions.find((m) => m.status === "ACTIVE") || missions[0];
  const confirmedDocs = documents.filter((d) => d.processing_status === "confirmed");
  const pendingDocs = documents.filter((d) =>
    ["review_required", "extracted", "uploaded", "processing"].includes(d.processing_status)
  );

  if (loading) return <PageSkeleton />;
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "#D64545" }}>{error}</div>;

  return (
    <div style={{ minHeight: "100vh", background: "#F5F8FC" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #D9E2EC",
        padding: "20px 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#102A43" }}>Dashboard</h1>
          <p style={{ fontSize: 13, color: "#52606D" }}>Your financial journey overview</p>
        </div>
        <Link href="/mission/new" style={{
          padding: "10px 20px", background: "#0057D9", color: "#fff",
          borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none",
        }}>
          + New Mission
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {/* No Mission State */}
        {!activeMission && (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "40px",
            textAlign: "center", border: "2px dashed #D9E2EC", marginBottom: 24,
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#102A43", marginBottom: 8 }}>
              No mission yet
            </h2>
            <p style={{ color: "#52606D", marginBottom: 20 }}>
              Start by telling FinPath AI what financial goal you want to achieve.
            </p>
            <Link href="/mission/new" style={{
              display: "inline-block", padding: "12px 28px", background: "#0057D9",
              color: "#fff", borderRadius: 10, fontWeight: 700, textDecoration: "none",
            }}>
              Create Your First Mission
            </Link>
          </div>
        )}

        {/* NBA Card */}
        {nba && (
          <div style={{
            background: PRIORITY_BG[nba.priority] || "#EEF4FF",
            border: `1.5px solid ${PRIORITY_COLORS[nba.priority] || "#0057D9"}`,
            borderRadius: 14, padding: "20px 24px", marginBottom: 24,
            display: "flex", alignItems: "flex-start", gap: 16,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%",
              background: PRIORITY_COLORS[nba.priority] + "18",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 20, flexShrink: 0,
            }}>
              {nba.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#52606D", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  Next Best Action
                </span>
                <span style={{
                  padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700,
                  background: PRIORITY_COLORS[nba.priority], color: "#fff",
                }}>
                  {nba.priority}
                </span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "#102A43", marginBottom: 4 }}>{nba.action}</p>
              <p style={{ fontSize: 13, color: "#52606D" }}>{nba.reason}</p>
            </div>
            <Link href={nba.target_route} style={{
              padding: "10px 20px", background: PRIORITY_COLORS[nba.priority] || "#0057D9",
              color: "#fff", borderRadius: 8, fontWeight: 600, fontSize: 13,
              textDecoration: "none", whiteSpace: "nowrap", flexShrink: 0,
            }}>
              Take Action
            </Link>
          </div>
        )}

        {/* Metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 24 }}>
          <MetricCard
            title="Readiness Score"
            value={readiness ? `${readiness.overall_score.toFixed(0)}%` : "—"}
            subtitle="Overall financial readiness"
            color="#0057D9"
            icon="📊"
          />
          <MetricCard
            title="Profile Complete"
            value={profile ? `${profile.completion_percentage.toFixed(0)}%` : "0%"}
            subtitle={profile?.monthly_income ? `₹${formatAmount(profile.monthly_income)}/mo income` : "Add income details"}
            color="#00AEEF"
            icon="👤"
          />
          <MetricCard
            title="Documents"
            value={`${confirmedDocs.length}/${documents.length}`}
            subtitle={`${pendingDocs.length} pending review`}
            color={pendingDocs.length > 0 ? "#D9822B" : "#16803C"}
            icon="📄"
          />
          <MetricCard
            title="Mission Stage"
            value={activeMission ? `${activeMission.stage}/7` : "—"}
            subtitle={activeMission ? MISSION_STAGES[activeMission.stage - 1]?.name : "No active mission"}
            color="#16803C"
            icon="🚀"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          {/* Left: Mission + Readiness */}
          <div>
            {/* Active Mission */}
            {activeMission && (
              <div style={{
                background: "#fff", borderRadius: 14, padding: "24px",
                border: "1px solid #D9E2EC", marginBottom: 20,
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#102A43" }}>Active Mission</h2>
                  <Link href="/missions" style={{ fontSize: 13, color: "#0057D9", textDecoration: "none", fontWeight: 600 }}>
                    View roadmap →
                  </Link>
                </div>

                <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 24 }}>
                  <div style={{
                    width: 48, height: 48, background: "#EEF4FF", borderRadius: 12,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24,
                  }}>
                    {GOAL_CATEGORY_ICONS[activeMission.goal_category] || "⭐"}
                  </div>
                  <div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "#102A43", marginBottom: 4 }}>
                      {activeMission.goal_title}
                    </h3>
                    <p style={{ fontSize: 13, color: "#52606D" }}>
                      {GOAL_CATEGORY_LABELS[activeMission.goal_category]} •{" "}
                      {activeMission.target_amount ? `₹${formatAmount(activeMission.target_amount)}` : "Amount TBD"} •{" "}
                      {activeMission.timeline_text || "Timeline TBD"}
                    </p>
                  </div>
                </div>

                {/* 7-stage progress */}
                <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                  {MISSION_STAGES.map((stage, idx) => {
                    const stageNum = idx + 1;
                    const current = activeMission.stage;
                    const isDone = stageNum < current;
                    const isActive = stageNum === current;
                    return (
                      <div key={stage.id} style={{ flex: 1, position: "relative" }}>
                        <div style={{
                          height: 6, borderRadius: 3,
                          background: isDone ? "#0057D9" : isActive ? "#00AEEF" : "#E8F0FE",
                          transition: "background 0.3s",
                        }} />
                        {isActive && (
                          <div style={{
                            position: "absolute", top: 10, left: "50%", transform: "translateX(-50%)",
                            fontSize: 10, color: "#0057D9", fontWeight: 700, whiteSpace: "nowrap",
                          }}>
                            Stage {stageNum}: {stage.name}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Readiness breakdown */}
            {readiness && (
              <div style={{
                background: "#fff", borderRadius: 14, padding: "24px",
                border: "1px solid #D9E2EC",
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#102A43" }}>Readiness Breakdown</h2>
                  <span style={{ fontSize: 24, fontWeight: 800, color: "#0057D9" }}>
                    {readiness.overall_score.toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {readiness.components.map((comp) => (
                    <div key={comp.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                        <span style={{ fontSize: 13, color: "#52606D", fontWeight: 500 }}>{comp.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: comp.score >= 80 ? "#16803C" : comp.score >= 50 ? "#D9822B" : "#D64545" }}>
                          {comp.score.toFixed(0)}%
                        </span>
                      </div>
                      <div style={{ background: "#E8F0FE", borderRadius: 4, height: 6, overflow: "hidden" }}>
                        <div style={{
                          height: "100%", borderRadius: 4, transition: "width 0.6s ease",
                          width: `${comp.score}%`,
                          background: comp.score >= 80 ? "#16803C" : comp.score >= 50 ? "#D9822B" : "#D64545",
                        }} />
                      </div>
                    </div>
                  ))}
                </div>
                {readiness.what_is_affecting.length > 0 && (
                  <div style={{ marginTop: 16, padding: "12px", background: "#FFF8ED", borderRadius: 8, border: "1px solid #F5D9A8" }}>
                    <p style={{ fontSize: 12, fontWeight: 700, color: "#D9822B", marginBottom: 6 }}>
                      What is affecting your score:
                    </p>
                    {readiness.what_is_affecting.slice(0, 3).map((issue, i) => (
                      <p key={i} style={{ fontSize: 12, color: "#52606D" }}>• {issue}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Documents + Quick links */}
          <div>
            <div style={{
              background: "#fff", borderRadius: 14, padding: "24px",
              border: "1px solid #D9E2EC", marginBottom: 16,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: "#102A43" }}>Documents</h2>
                <Link href="/documents" style={{ fontSize: 12, color: "#0057D9", textDecoration: "none" }}>
                  Manage →
                </Link>
              </div>
              {documents.length === 0 ? (
                <div style={{ textAlign: "center", padding: "20px 0" }}>
                  <p style={{ fontSize: 13, color: "#52606D" }}>No documents uploaded yet</p>
                  <Link href="/documents" style={{ fontSize: 13, color: "#0057D9", textDecoration: "none", fontWeight: 600 }}>
                    Upload first document →
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {documents.slice(0, 5).map((doc) => (
                    <div key={doc.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ fontSize: 16 }}>📄</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: "#102A43", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {doc.original_filename}
                        </p>
                        <StatusBadge status={doc.processing_status} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div style={{
              background: "#fff", borderRadius: 14, padding: "24px",
              border: "1px solid #D9E2EC",
            }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: "#102A43", marginBottom: 14 }}>Quick Actions</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[
                  { label: "Update Profile", href: "/profile", icon: "👤" },
                  { label: "Upload Document", href: "/documents", icon: "📤" },
                  { label: "AI Assistant", href: "/ai", icon: "🤖" },
                  { label: "View Progress", href: "/progress", icon: "📈" },
                ].map((action) => (
                  <Link key={action.label} href={action.href} style={{
                    display: "flex", alignItems: "center", gap: 10,
                    padding: "10px 14px", borderRadius: 8, border: "1px solid #E8F0FE",
                    textDecoration: "none", color: "#102A43", fontWeight: 500, fontSize: 13,
                    background: "#F5F8FC",
                  }}>
                    <span>{action.icon}</span>
                    {action.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, subtitle, color, icon }: {
  title: string; value: string; subtitle: string; color: string; icon: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 14, padding: "20px",
      border: "1px solid #D9E2EC", boxShadow: "0 2px 8px rgba(0,87,217,0.04)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "#52606D", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {title}
        </span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <p style={{ fontSize: 28, fontWeight: 800, color, marginBottom: 4 }}>{value}</p>
      <p style={{ fontSize: 12, color: "#52606D" }}>{subtitle}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; color: string; bg: string }> = {
    confirmed: { label: "Verified", color: "#16803C", bg: "#F0FFF4" },
    review_required: { label: "Needs Review", color: "#D9822B", bg: "#FFF8ED" },
    extracted: { label: "Needs Review", color: "#D9822B", bg: "#FFF8ED" },
    processing: { label: "Processing", color: "#0057D9", bg: "#EEF4FF" },
    uploaded: { label: "Uploaded", color: "#52606D", bg: "#F5F8FC" },
    failed: { label: "Failed", color: "#D64545", bg: "#FFF5F5" },
  };
  const s = config[status] || { label: status, color: "#52606D", bg: "#F5F8FC" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: s.color,
      background: s.bg, padding: "1px 6px", borderRadius: 10,
    }}>
      {s.label}
    </span>
  );
}

function PageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "#F5F8FC" }}>
      <div style={{ background: "#fff", height: 68, borderBottom: "1px solid #D9E2EC" }} />
      <div style={{ maxWidth: 1100, margin: "28px auto", padding: "0 24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
          {[...Array(4)].map((_, i) => (
            <div key={i} style={{ background: "#fff", borderRadius: 14, padding: 20, border: "1px solid #D9E2EC", height: 100 }} />
          ))}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>
          <div style={{ background: "#fff", borderRadius: 14, height: 400, border: "1px solid #D9E2EC" }} />
          <div>
            <div style={{ background: "#fff", borderRadius: 14, height: 200, border: "1px solid #D9E2EC", marginBottom: 16 }} />
            <div style={{ background: "#fff", borderRadius: 14, height: 180, border: "1px solid #D9E2EC" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
