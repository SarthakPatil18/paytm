"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { listMissions } from "@/lib/services";
import type { FinancialMission } from "@/types";
import { GOAL_CATEGORY_ICONS, GOAL_CATEGORY_LABELS } from "@/types";
import { formatAmount } from "@/lib/utils";

const JOURNEY_STAGES = [
  { id: "goal", label: "Goal Definition", icon: "🎯", status: "completed", desc: "Goal set and validated" },
  { id: "profile", label: "Profile", icon: "👤", status: "completed", desc: "Financial profile verified" },
  { id: "documents", label: "Documents", icon: "📁", status: "active", desc: "Document verification in progress" },
  { id: "assessment", label: "Assessment", icon: "📊", status: "upcoming", desc: "Financial readiness calculation" },
  { id: "options", label: "Financial Options", icon: "💳", status: "upcoming", desc: "Personalized funding & loan options" },
  { id: "application", label: "Application", icon: "📝", status: "upcoming", desc: "Direct partner institution apply" },
  { id: "completion", label: "Completion", icon: "🎓", status: "upcoming", desc: "Funding disbursed & journey complete" },
];

export default function MissionsPage() {
  const [missions, setMissions] = useState<FinancialMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStage, setSelectedStage] = useState<string>("documents");

  useEffect(() => {
    loadMissions();
  }, []);

  const loadMissions = async () => {
    try {
      const data = await listMissions();
      setMissions(data);
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const activeMission = missions.find((m) => m.status === "ACTIVE") || missions[0];

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", paddingBottom: 80 }}>
      <AppNav />

      <div style={{ maxWidth: 1080, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Journey Tracking
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#002e6e", margin: "4px 0 0", letterSpacing: "-0.02em" }}>
              Financial Missions
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: "4px 0 0" }}>
              Every major financial milestone lives here as an adaptive, milestone-driven mission.
            </p>
          </div>
          <Link href="/mission/new" className="btn-primary" style={{ padding: "10px 20px" }}>
            + Create New Mission
          </Link>
        </div>

        {/* Active Mission Detail Card */}
        {activeMission ? (
          <div className="card" style={{ marginBottom: 32, border: "1.5px solid #d9e2ec", borderRadius: 20, padding: "28px 32px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
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
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase" }}>
                      Active Mission
                    </span>
                    <span className="badge badge-green">ACTIVE</span>
                  </div>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: "#002e6e", margin: 0 }}>
                    {activeMission.goal_title}
                  </h2>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/documents" className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>
                  Upload Documents →
                </Link>
                <Link href="/ai" className="btn-primary" style={{ fontSize: 13, padding: "8px 16px" }}>
                  Ask AI About Mission 🤖
                </Link>
              </div>
            </div>

            {/* Target Numbers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
                gap: 16,
                padding: "18px 22px",
                background: "#f8fafc",
                borderRadius: 14,
                border: "1px solid #e2e8f0",
                marginBottom: 28,
              }}
            >
              <div>
                <span className="stat-label">Target Amount</span>
                <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#002e6e" }}>
                  {activeMission.target_amount ? formatAmount(activeMission.target_amount, activeMission.currency) : "—"}
                </p>
              </div>
              <div>
                <span className="stat-label">Target Timeline</span>
                <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#002e6e" }}>
                  {activeMission.timeline_text || "1 Year"}
                </p>
              </div>
              <div>
                <span className="stat-label">Destination</span>
                <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#002e6e" }}>
                  {activeMission.destination || "Germany"}
                </p>
              </div>
              <div>
                <span className="stat-label">Mission Status</span>
                <p style={{ margin: "2px 0 0", fontSize: 20, fontWeight: 800, color: "#00875a" }}>
                  {activeMission.status}
                </p>
              </div>
            </div>

            {/* SECTION 7: 7 JOURNEY STAGES STEPPER */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: "#002e6e", textTransform: "uppercase", letterSpacing: "0.05em", margin: 0 }}>
                  Journey Stages Roadmap
                </h3>
                <span style={{ fontSize: 12.5, color: "#64748b" }}>
                  Click a stage to inspect details
                </span>
              </div>

              {/* Horizontal Stepper */}
              <div className="journey-stepper">
                {JOURNEY_STAGES.map((st, i) => (
                  <div key={st.id} className="stage-item">
                    <button
                      onClick={() => setSelectedStage(st.id)}
                      className={`stage-pill ${st.status === "active" ? "active" : st.status === "completed" ? "completed" : ""}`}
                      style={{
                        outline: selectedStage === st.id ? "2px solid #0052cc" : "none",
                        outlineOffset: 2,
                      }}
                    >
                      <span>{st.status === "completed" ? "✓" : st.icon}</span>
                      <span>{st.label}</span>
                    </button>
                    {i < JOURNEY_STAGES.length - 1 && <span className="stage-divider">→</span>}
                  </div>
                ))}
              </div>

              {/* Interactive Stage Detail View */}
              {selectedStage && (
                <div
                  style={{
                    marginTop: 18,
                    padding: "18px 22px",
                    background: "#f0f7ff",
                    border: "1.5px solid #b9d9ff",
                    borderRadius: 14,
                  }}
                >
                  {selectedStage === "goal" && (
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#002e6e" }}>Stage 1: Goal Definition (Completed ✓)</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        Goal "{activeMission.goal_title}" created with ₹12,00,000 target and Germany destination. Extracted by Gemini AI.
                      </p>
                    </div>
                  )}
                  {selectedStage === "profile" && (
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#002e6e" }}>Stage 2: Financial Profile (Completed ✓)</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        Monthly income, existing EMIs, and liquid savings reported. Completeness is currently at 82%.
                      </p>
                    </div>
                  )}
                  {selectedStage === "documents" && (
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#0052cc" }}>Stage 3: Document Verification (Current Stage 📍)</h4>
                        <Link href="/documents" className="btn-primary" style={{ fontSize: 12, padding: "5px 12px" }}>
                          Review Documents →
                        </Link>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        Passport and bank statement verified. Salary slip and offer letter pending user review to become trusted financial data.
                      </p>
                    </div>
                  )}
                  {selectedStage === "assessment" && (
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#002e6e" }}>Stage 4: Readiness Assessment (In Calculation)</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        Calculates debt-to-income ratio, funding gap analysis, and currency fluctuation risk against Germany study costs.
                      </p>
                    </div>
                  )}
                  {selectedStage === "options" && (
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#002e6e" }}>Stage 5: Financial Options (Upcoming)</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        FinPath matches you with pre-screened education loans, blocked account partners, and scholarship grants.
                      </p>
                    </div>
                  )}
                  {selectedStage === "application" && (
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#002e6e" }}>Stage 6: Application & Pre-Approval (Upcoming)</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        1-click submission of verified documents directly to selected banking partners with no duplicate paperwork.
                      </p>
                    </div>
                  )}
                  {selectedStage === "completion" && (
                    <div>
                      <h4 style={{ margin: "0 0 6px", fontSize: 15, fontWeight: 700, color: "#002e6e" }}>Stage 7: Mission Completion & Disbursement</h4>
                      <p style={{ margin: 0, fontSize: 13, color: "#334155" }}>
                        Funding disbursed, blocked account funded, and pre-departure financial checklist completed.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: "center", padding: "48px 24px" }}>
            <div style={{ fontSize: 40, marginBottom: 12 }}>🎯</div>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#002e6e" }}>No missions created yet</h2>
            <p style={{ color: "#64748b", fontSize: 13.5, margin: "0 0 20px" }}>
              Start your journey by defining what you want to achieve.
            </p>
            <Link href="/mission/new" className="btn-primary">
              Create Your First Mission →
            </Link>
          </div>
        )}

        {/* All Missions List */}
        {missions.length > 1 && (
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: "#002e6e", marginBottom: 14 }}>
              All Financial Missions ({missions.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
              {missions.map((m) => (
                <div key={m.id} className="card card-hover" style={{ padding: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                    <span style={{ fontSize: 24 }}>{GOAL_CATEGORY_ICONS[m.goal_category] || "🎯"}</span>
                    <span className={m.status === "ACTIVE" ? "badge badge-green" : "badge badge-gray"}>{m.status}</span>
                  </div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, color: "#002e6e", margin: "0 0 4px" }}>{m.goal_title}</h4>
                  <p style={{ fontSize: 13, color: "#475569", margin: "0 0 12px" }}>
                    Target: {m.target_amount ? formatAmount(m.target_amount, m.currency) : "—"} · {m.timeline_text || "1 Year"}
                  </p>
                  <Link href={`/mission/${m.id}`} className="btn-ghost" style={{ padding: "4px 8px", fontSize: 12.5, color: "#0052cc" }}>
                    View Journey →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
