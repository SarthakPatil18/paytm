"use client";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";

const MILESTONES = [
  {
    id: 1,
    title: "Financial Goal Created",
    status: "completed",
    date: "14 Sep 2026",
    desc: "Goal 'Study in Germany' established with ₹12,00,000 target and 1-year timeline.",
    icon: "🎯",
  },
  {
    id: 2,
    title: "Financial Profile Completed",
    status: "completed",
    date: "18 Sep 2026",
    desc: "Monthly income ₹75,000, savings ₹4,20,000, and existing obligations logged.",
    icon: "👤",
  },
  {
    id: 3,
    title: "Passport ID Verified",
    status: "completed",
    date: "20 Sep 2026",
    desc: "Identity verified for international student eligibility.",
    icon: "🛂",
  },
  {
    id: 4,
    title: "Bank Statement Verified",
    status: "completed",
    date: "21 Sep 2026",
    desc: "6-month liquid balance of ₹3,45,000 verified with HDFC Bank statement.",
    icon: "🏦",
  },
  {
    id: 5,
    title: "Salary Slip Verification",
    status: "active",
    date: "Action Required",
    desc: "AI extracted income fields. User confirmation needed to complete verification.",
    icon: "💼",
  },
  {
    id: 6,
    title: "Funding Plan & Loan Assessment",
    status: "pending",
    date: "Upcoming Milestone",
    desc: "Automated calculation of gap funding, collateral options, and interest subsidy.",
    icon: "📊",
  },
  {
    id: 7,
    title: "Lender Application & Blocked Account",
    status: "pending",
    date: "Upcoming Milestone",
    desc: "1-click direct submission of verified dossier to partner banks and German blocked account.",
    icon: "📝",
  },
];

export default function ProgressPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", paddingBottom: 80 }}>
      <AppNav />

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Journey Tracking
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#002e6e", margin: "4px 0 0", letterSpacing: "-0.02em" }}>
              Mission Progress Dashboard
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: "4px 0 0" }}>
              Track completed milestones, current bottlenecks, and upcoming application steps.
            </p>
          </div>
          <Link href="/documents" className="btn-primary" style={{ padding: "10px 20px" }}>
            Resolve Next Action →
          </Link>
        </div>

        {/* Readiness Overview Banner */}
        <div
          className="card"
          style={{
            marginBottom: 28,
            background: "linear-gradient(135deg, #002e6e 0%, #0043a8 70%, #0052cc 100%)",
            color: "#ffffff",
            borderRadius: 20,
            padding: "30px 34px",
            boxShadow: "0 10px 30px rgba(0, 46, 110, 0.15)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#93c5fd", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Active Mission: Study in Germany
              </span>
              <h2 style={{ fontSize: 26, fontWeight: 800, margin: "6px 0 8px" }}>
                73% Journey Readiness
              </h2>
              <p style={{ color: "#e2e8f0", fontSize: 14, maxWidth: 520, margin: 0 }}>
                You have verified 4 critical milestones. Confirming your salary slip will raise your readiness score to 86%.
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 90,
                  height: 90,
                  borderRadius: "50%",
                  border: "6px solid #00baf2",
                  background: "rgba(255, 255, 255, 0.1)",
                  fontSize: 26,
                  fontWeight: 800,
                }}
              >
                73%
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column: Completed vs Pending Actions */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24, marginBottom: 32 }}>
          {/* Completed Actions */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ color: "#00875a", fontSize: 18, fontWeight: 800 }}>✓</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#002e6e", margin: 0 }}>
                Completed Actions (4)
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, borderLeft: "4px solid #00b074" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>Financial Goal Defined</p>
                <span style={{ fontSize: 12, color: "#64748b" }}>Target amount: ₹12,00,000 · Timeline: 1 Year</span>
              </div>
              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, borderLeft: "4px solid #00b074" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>Profile Completed (82%)</p>
                <span style={{ fontSize: 12, color: "#64748b" }}>Verified monthly salary and liquid savings</span>
              </div>
              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, borderLeft: "4px solid #00b074" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>Passport Document Verified</p>
                <span style={{ fontSize: 12, color: "#64748b" }}>OCR extraction approved and secured</span>
              </div>
              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, borderLeft: "4px solid #00b074" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 700, color: "#0f172a" }}>Bank Statement Verified</p>
                <span style={{ fontSize: 12, color: "#64748b" }}>6 months balance records validated</span>
              </div>
            </div>
          </div>

          {/* Pending Actions */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <span style={{ color: "#b45309", fontSize: 18, fontWeight: 800 }}>⚡</span>
              <h3 style={{ fontSize: 16, fontWeight: 800, color: "#002e6e", margin: 0 }}>
                Pending Actions & Next Steps (3)
              </h3>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ padding: "12px 14px", background: "#fffbeb", borderRadius: 10, borderLeft: "4px solid #f59e0b" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                  <p style={{ margin: 0, fontSize: 13.5, fontWeight: 700, color: "#92400e" }}>→ Salary Slip Verification</p>
                  <Link href="/documents" className="btn-primary" style={{ padding: "3px 10px", fontSize: 11, background: "#f59e0b" }}>
                    Verify Now
                  </Link>
                </div>
                <span style={{ fontSize: 12, color: "#78350f" }}>Review AI extracted salary figures to complete documentation</span>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, borderLeft: "4px solid #cbd5e1" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 700, color: "#475569" }}>○ Funding Plan Assessment</p>
                <span style={{ fontSize: 12, color: "#64748b" }}>Locked until document verification is complete</span>
              </div>

              <div style={{ padding: "12px 14px", background: "#f8fafc", borderRadius: 10, borderLeft: "4px solid #cbd5e1" }}>
                <p style={{ margin: "0 0 2px", fontSize: 13.5, fontWeight: 700, color: "#475569" }}>○ Loan Application Submission</p>
                <span style={{ fontSize: 12, color: "#64748b" }}>Direct digital application to banking partners</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chronological Milestones Timeline */}
        <h3 style={{ fontSize: 18, fontWeight: 800, color: "#002e6e", marginBottom: 20 }}>
          Milestone Timeline
        </h3>

        <div className="card" style={{ padding: "28px 32px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {MILESTONES.map((m, idx) => (
              <div key={m.id} style={{ display: "flex", gap: 18, position: "relative" }}>
                {/* Node icon */}
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    background:
                      m.status === "completed"
                        ? "#e6f9f2"
                        : m.status === "active"
                        ? "#fef3c7"
                        : "#f1f5f9",
                    color:
                      m.status === "completed"
                        ? "#00875a"
                        : m.status === "active"
                        ? "#b45309"
                        : "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 16,
                    flexShrink: 0,
                    zIndex: 2,
                    border:
                      m.status === "completed"
                        ? "2px solid #00b074"
                        : m.status === "active"
                        ? "2px solid #f59e0b"
                        : "2px solid #cbd5e1",
                  }}
                >
                  {m.status === "completed" ? "✓" : m.status === "active" ? "→" : "○"}
                </div>

                {/* Content */}
                <div style={{ flex: 1, paddingBottom: idx < MILESTONES.length - 1 ? 16 : 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4, flexWrap: "wrap", gap: 8 }}>
                    <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "#002e6e" }}>
                      {m.title}
                    </h4>
                    <span style={{ fontSize: 12, fontWeight: 600, color: m.status === "active" ? "#b45309" : "#64748b" }}>
                      {m.date}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: "#475569", lineHeight: 1.5 }}>
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
