"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { isAuthenticated, formatAmount } from "@/lib/utils";
import { listMissions, getMissionReadiness, getMissionNBA, updateMission } from "@/lib/services";
import type { FinancialMission, ReadinessReport, NBAAction } from "@/types";
import { GOAL_CATEGORY_ICONS, GOAL_CATEGORY_LABELS, MISSION_STAGES } from "@/types";

type StageStatus = "completed" | "current" | "upcoming" | "blocked";

function getStageStatus(stageNum: number, missionStage: number): StageStatus {
  if (stageNum < missionStage) return "completed";
  if (stageNum === missionStage) return "current";
  return "upcoming";
}

const STATUS_STYLE: Record<StageStatus, { border: string; bg: string; dotBg: string; labelColor: string }> = {
  completed: { border: "#16803C", bg: "#F0FFF4", dotBg: "#16803C", labelColor: "#16803C" },
  current: { border: "#0057D9", bg: "#EEF4FF", dotBg: "#0057D9", labelColor: "#0057D9" },
  upcoming: { border: "#D9E2EC", bg: "#fff", dotBg: "#D9E2EC", labelColor: "#52606D" },
  blocked: { border: "#D64545", bg: "#FFF5F5", dotBg: "#D64545", labelColor: "#D64545" },
};

export default function MissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState<FinancialMission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMission, setSelectedMission] = useState<FinancialMission | null>(null);
  const [readiness, setReadiness] = useState<ReadinessReport | null>(null);
  const [nba, setNba] = useState<NBAAction | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [advancing, setAdvancing] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) { router.replace("/login"); return; }
    loadMissions();
  }, []);

  async function loadMissions() {
    try {
      const data = await listMissions();
      setMissions(data);
      const active = data.find((m) => m.status === "ACTIVE") || data[0];
      if (active) {
        setSelectedMission(active);
        setSelectedStageId(active.stage);
        const [r, n] = await Promise.allSettled([
          getMissionReadiness(active.id),
          getMissionNBA(active.id),
        ]);
        if (r.status === "fulfilled") setReadiness(r.value);
        if (n.status === "fulfilled") setNba(n.value);
      }
    } catch {
      // silently handled
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectMission(m: FinancialMission) {
    setSelectedMission(m);
    setSelectedStageId(m.stage);
    setReadiness(null);
    setNba(null);
    try {
      const [r, n] = await Promise.allSettled([
        getMissionReadiness(m.id),
        getMissionNBA(m.id),
      ]);
      if (r.status === "fulfilled") setReadiness(r.value);
      if (n.status === "fulfilled") setNba(n.value);
    } catch {}
  }

  async function handleAdvanceStage() {
    if (!selectedMission) return;
    const nextStage = Math.min(selectedMission.stage + 1, 7);
    setAdvancing(true);
    try {
      const updated = await updateMission(selectedMission.id, { stage: nextStage });
      setSelectedMission(updated);
      setMissions((prev) => prev.map((m) => m.id === updated.id ? updated : m));
    } catch {}
    finally { setAdvancing(false); }
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F5F8FC", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#52606D" }}>Loading missions…</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F5F8FC" }}>
      {/* Header */}
      <div style={{
        background: "#fff", borderBottom: "1px solid #D9E2EC",
        padding: "20px 32px", display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#102A43" }}>Mission Roadmap</h1>
          <p style={{ fontSize: 13, color: "#52606D" }}>Your 7-stage financial journey</p>
        </div>
        <Link href="/mission/new" style={{
          padding: "10px 20px", background: "#0057D9", color: "#fff",
          borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none",
        }}>
          + New Mission
        </Link>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>
        {missions.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 16, padding: "48px", textAlign: "center",
            border: "2px dashed #D9E2EC",
          }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎯</div>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: "#102A43", marginBottom: 8 }}>No missions yet</h2>
            <p style={{ color: "#52606D", marginBottom: 20 }}>Create your first financial mission to start your journey.</p>
            <Link href="/mission/new" style={{
              display: "inline-block", padding: "12px 28px", background: "#0057D9",
              color: "#fff", borderRadius: 10, fontWeight: 700, textDecoration: "none",
            }}>
              Create First Mission
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24 }}>
            {/* Mission list */}
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#52606D", marginBottom: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                Your Missions
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {missions.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => handleSelectMission(m)}
                    style={{
                      background: selectedMission?.id === m.id ? "#EEF4FF" : "#fff",
                      border: `1.5px solid ${selectedMission?.id === m.id ? "#0057D9" : "#D9E2EC"}`,
                      borderRadius: 12, padding: "16px", cursor: "pointer", textAlign: "left",
                      fontFamily: "inherit", width: "100%",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 20 }}>{GOAL_CATEGORY_ICONS[m.goal_category] || "⭐"}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 700, color: "#102A43" }}>{m.goal_title}</p>
                        <p style={{ fontSize: 11, color: "#52606D" }}>
                          Stage {m.stage}/7 • {m.status}
                        </p>
                      </div>
                    </div>
                    {/* Mini progress */}
                    <div style={{ display: "flex", gap: 2 }}>
                      {MISSION_STAGES.map((s, i) => (
                        <div key={s.id} style={{
                          flex: 1, height: 4, borderRadius: 2,
                          background: i + 1 < m.stage ? "#0057D9" : i + 1 === m.stage ? "#00AEEF" : "#E8F0FE",
                        }} />
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mission detail */}
            {selectedMission && (
              <div>
                {/* Mission header */}
                <div style={{
                  background: "#fff", borderRadius: 14, padding: "24px",
                  border: "1px solid #D9E2EC", marginBottom: 20,
                }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 16, marginBottom: 20 }}>
                    <div style={{
                      width: 52, height: 52, background: "#EEF4FF", borderRadius: 14,
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26,
                    }}>
                      {GOAL_CATEGORY_ICONS[selectedMission.goal_category] || "⭐"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#102A43" }}>{selectedMission.goal_title}</h2>
                      <p style={{ fontSize: 13, color: "#52606D" }}>
                        {GOAL_CATEGORY_LABELS[selectedMission.goal_category]} •{" "}
                        {selectedMission.target_amount ? `₹${formatAmount(selectedMission.target_amount)}` : "Amount TBD"} •{" "}
                        {selectedMission.timeline_text || "Timeline TBD"}
                      </p>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      {readiness && (
                        <div>
                          <p style={{ fontSize: 28, fontWeight: 800, color: "#0057D9" }}>{readiness.overall_score.toFixed(0)}%</p>
                          <p style={{ fontSize: 11, color: "#52606D" }}>Readiness</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* NBA */}
                  {nba && (
                    <div style={{
                      padding: "14px 16px", borderRadius: 10,
                      background: "#EEF4FF", border: "1px solid #C7D7F5",
                      display: "flex", alignItems: "center", gap: 12,
                    }}>
                      <span style={{ fontSize: 20 }}>{nba.icon}</span>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 13, fontWeight: 700, color: "#102A43" }}>{nba.action}</p>
                        <p style={{ fontSize: 12, color: "#52606D" }}>{nba.reason}</p>
                      </div>
                      <Link href={nba.target_route} style={{
                        padding: "8px 16px", background: "#0057D9", color: "#fff",
                        borderRadius: 8, fontSize: 12, fontWeight: 600, textDecoration: "none",
                      }}>
                        Go
                      </Link>
                    </div>
                  )}
                </div>

                {/* 7-stage roadmap */}
                <div style={{ background: "#fff", borderRadius: 14, padding: "24px", border: "1px solid #D9E2EC" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#102A43" }}>Journey Roadmap</h3>
                    {selectedMission.stage < 7 && (
                      <button
                        onClick={handleAdvanceStage}
                        disabled={advancing}
                        style={{
                          padding: "8px 18px", background: "#16803C", color: "#fff",
                          borderRadius: 8, border: "none", cursor: "pointer",
                          fontSize: 13, fontWeight: 600, fontFamily: "inherit",
                        }}
                      >
                        {advancing ? "Advancing…" : "Advance Stage →"}
                      </button>
                    )}
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                    {MISSION_STAGES.map((stage, idx) => {
                      const stageNum = idx + 1;
                      const status = getStageStatus(stageNum, selectedMission.stage);
                      const s = STATUS_STYLE[status];
                      const isSelected = selectedStageId === stageNum;

                      return (
                        <div key={stage.id} style={{ display: "flex", gap: 0 }}>
                          {/* Connector line */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 40 }}>
                            <div style={{
                              width: 28, height: 28, borderRadius: "50%",
                              background: s.dotBg, border: "2px solid #fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                              color: "#fff", fontSize: 12, fontWeight: 800, zIndex: 1,
                            }}>
                              {status === "completed" ? "✓" : stageNum}
                            </div>
                            {idx < MISSION_STAGES.length - 1 && (
                              <div style={{
                                width: 2, flex: 1, minHeight: 24,
                                background: stageNum < selectedMission.stage ? "#0057D9" : "#E8F0FE",
                                margin: "2px 0",
                              }} />
                            )}
                          </div>

                          {/* Stage card */}
                          <div
                            onClick={() => setSelectedStageId(isSelected ? null : stageNum)}
                            style={{
                              flex: 1, marginLeft: 12, marginBottom: 12,
                              padding: "14px 16px", borderRadius: 10,
                              background: s.bg, border: `1.5px solid ${isSelected ? s.border : "#E8F0FE"}`,
                              cursor: "pointer", transition: "all 0.15s",
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                              <div>
                                <span style={{ fontSize: 11, fontWeight: 700, color: s.labelColor, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                                  {status === "completed" ? "Complete" : status === "current" ? "In Progress" : "Upcoming"}
                                </span>
                                <h4 style={{ fontSize: 14, fontWeight: 700, color: "#102A43", marginTop: 2 }}>{stage.name}</h4>
                              </div>
                              <span style={{ fontSize: 16 }}>
                                {status === "completed" ? "✅" : status === "current" ? "🔵" : "⬜"}
                              </span>
                            </div>

                            {isSelected && (
                              <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid #E8F0FE" }}>
                                <p style={{ fontSize: 13, color: "#52606D" }}>{stage.description}</p>
                                {status === "current" && (
                                  <Link href={
                                    stageNum === 2 ? "/profile" :
                                    stageNum === 3 ? "/documents" :
                                    stageNum === 4 ? "/progress" : "#"
                                  } style={{
                                    display: "inline-block", marginTop: 8,
                                    fontSize: 12, color: "#0057D9", fontWeight: 600, textDecoration: "none",
                                  }}>
                                    Continue this stage →
                                  </Link>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
