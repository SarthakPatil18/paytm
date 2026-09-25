"use client";
import { useState } from "react";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";

export default function DemoPage() {
  const [docs, setDocs] = useState([
    {
      id: "demo-1",
      name: "Passport_Front_Back.pdf",
      type: "Passport",
      status: "confirmed",
      statusLabel: "Confirmed ✓",
      date: "Sep 2026",
      desc: "Nationality and identity verification.",
    },
    {
      id: "demo-2",
      name: "HDFC_6M_Statement.pdf",
      type: "Bank Statement",
      status: "confirmed",
      statusLabel: "Confirmed ✓",
      date: "Sep 2026",
      desc: "Verified liquid balance: ₹3,45,000.",
    },
    {
      id: "demo-3",
      name: "TUM_Admission_Offer.pdf",
      type: "Offer Letter",
      status: "review_required",
      statusLabel: "Review Required",
      date: "Sep 2026",
      desc: "AI extracted: TUM M.Sc CS starting Oct 2027.",
    },
    {
      id: "demo-4",
      name: "Salary_Slip_August.pdf",
      type: "Salary Slip",
      status: "pending",
      statusLabel: "Pending",
      date: "Awaiting Upload",
      desc: "Income verification for co-borrower assessment.",
    },
  ]);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const [readiness, setReadiness] = useState(73);

  const handleOpenReview = (doc: any) => {
    setSelectedDoc(doc);
    setReviewModalOpen(true);
  };

  const handleConfirmReview = () => {
    if (selectedDoc) {
      setDocs((prev) =>
        prev.map((d) => (d.id === selectedDoc.id ? { ...d, status: "confirmed", statusLabel: "Confirmed ✓" } : d))
      );
      setReadiness(86);
      setReviewModalOpen(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", paddingBottom: 80 }}>
      {/* Demo Mode Top Banner */}
      <div
        style={{
          background: "linear-gradient(90deg, #002e6e, #0052cc)",
          color: "#ffffff",
          padding: "10px 24px",
          textAlign: "center",
          fontSize: 13,
          fontWeight: 600,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 12,
        }}
      >
        <span>🔍 <strong>Jury / Hackathon Demo Mode</strong> — Pre-populated with real financial journey data</span>
        <Link
          href="/register"
          style={{
            background: "#ffffff",
            color: "#0052cc",
            padding: "3px 12px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Create Real Mission →
        </Link>
      </div>

      <AppNav />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: 28, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 16 }}>
          <div>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#002e6e", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
              Good morning, Sushrut
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: 0 }}>
              Live demo of FinPath AI’s goal-first financial journey platform.
            </p>
          </div>
          <Link href="/register" className="btn-primary" style={{ padding: "10px 22px" }}>
            Sign Up for Free
          </Link>
        </div>

        {/* SECTION 6: PROMINENT NEXT BEST ACTION CARD */}
        <div className="nba-card" style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 16 }}>
            <div style={{ maxWidth: 640 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span className="badge badge-amber" style={{ fontSize: 11 }}>
                  ⚡ Priority Action
                </span>
                <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Your Next Best Action
                </span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#002e6e", margin: "0 0 6px" }}>
                Verify your offer letter
              </h2>
              <p style={{ fontSize: 13.5, color: "#334155", margin: 0, lineHeight: 1.5 }}>
                We found your Technical University of Munich offer letter, but some extracted tuition and intake dates need your confirmation.
              </p>
            </div>
            <button
              onClick={() =>
                handleOpenReview({
                  id: "demo-3",
                  name: "TUM_Admission_Offer.pdf",
                  type: "Offer Letter",
                  status: "review_required",
                })
              }
              className="btn-primary"
              style={{
                alignSelf: "center",
                padding: "11px 24px",
                borderRadius: 10,
                background: "#0052cc",
                whiteSpace: "nowrap",
              }}
            >
              Review Document →
            </button>
          </div>
        </div>

        {/* SECTION 5 & 14: FINANCIAL MISSION HERO */}
        <div
          className="card"
          style={{
            marginBottom: 28,
            border: "1.5px solid #d9e2ec",
            borderRadius: 20,
            padding: "28px 32px",
            background: "#ffffff",
          }}
        >
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
                🎓
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase" }}>
                    Active Financial Mission
                  </span>
                  <span className="badge badge-green">ACTIVE</span>
                  <span className="badge badge-blue">Demo Data</span>
                </div>
                <h2 style={{ fontSize: 24, fontWeight: 800, color: "#002e6e", margin: 0 }}>
                  Study in Germany
                </h2>
              </div>
            </div>

            <Link href="/progress" className="btn-secondary" style={{ fontSize: 13, padding: "8px 16px" }}>
              Track Milestones →
            </Link>
          </div>

          {/* Numbers Grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
              gap: 16,
              padding: "18px 22px",
              background: "#f8fafc",
              borderRadius: 14,
              border: "1px solid #e2e8f0",
              marginBottom: 24,
            }}
          >
            <div>
              <span className="stat-label">Target Amount</span>
              <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#002e6e" }}>₹12,00,000</p>
            </div>
            <div>
              <span className="stat-label">Target Timeline</span>
              <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#002e6e" }}>1 Year</p>
            </div>
            <div>
              <span className="stat-label">Destination</span>
              <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: "#002e6e" }}>Germany</p>
            </div>
            <div>
              <span className="stat-label">Journey Readiness</span>
              <p style={{ margin: "2px 0 0", fontSize: 22, fontWeight: 800, color: readiness >= 80 ? "#00875a" : "#0052cc" }}>
                {readiness}%
              </p>
            </div>
          </div>

          {/* Progress track */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13, fontWeight: 600 }}>
              <span style={{ color: "#334155" }}>Mission Readiness Progress</span>
              <span style={{ color: "#0052cc", fontWeight: 700 }}>{readiness}% Ready</span>
            </div>
            <div className="progress-track" style={{ height: 10 }}>
              <div className="progress-fill" style={{ width: `${readiness}%` }} />
            </div>
          </div>

          {/* Mission Progress Breakdown */}
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "#002e6e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 14 }}>
              Mission Progress
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
                  <span style={{ color: "#00875a", fontWeight: 800, fontSize: 16 }}>✓</span>
                </div>
                <span className="badge badge-green" style={{ fontSize: 11 }}>82% Complete</span>
              </div>

              <div style={{ padding: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Documents</span>
                  <span style={{ color: "#0052cc", fontWeight: 800, fontSize: 14 }}>
                    {docs.filter((d) => d.status === "confirmed").length}/4
                  </span>
                </div>
                <span className="badge badge-blue" style={{ fontSize: 11 }}>
                  {docs.filter((d) => d.status === "confirmed").length} Verified
                </span>
              </div>

              <div style={{ padding: "14px", background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: 12 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#1e293b" }}>Assessment</span>
                  <span style={{ color: "#0052cc", fontWeight: 800, fontSize: 14 }}>70%</span>
                </div>
                <span className="badge badge-blue" style={{ fontSize: 11 }}>In Progress</span>
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

        {/* SECTION 14: 4 DOCUMENTS EXACT MATCH */}
        <h2 style={{ fontSize: 18, fontWeight: 800, color: "#002e6e", marginBottom: 16 }}>
          Document Center Status
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 32 }}>
          {docs.map((doc) => (
            <div key={doc.id} className="card card-hover" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>
                    {doc.type === "Passport" ? "🛂" : doc.type === "Bank Statement" ? "🏦" : doc.type === "Offer Letter" ? "🎓" : "💼"}
                  </span>
                  <span
                    className={
                      doc.status === "confirmed"
                        ? "badge badge-green"
                        : doc.status === "review_required"
                        ? "badge badge-amber"
                        : "badge badge-gray"
                    }
                  >
                    {doc.statusLabel}
                  </span>
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#002e6e", margin: "0 0 4px" }}>
                  {doc.type}
                </h3>
                <p style={{ fontSize: 12.5, color: "#64748b", margin: "0 0 12px", lineHeight: 1.5 }}>
                  {doc.desc}
                </p>
              </div>

              <div style={{ paddingTop: 12, borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 11.5, color: "#94a3b8" }}>{doc.date}</span>
                {doc.status === "review_required" ? (
                  <button
                    onClick={() => handleOpenReview(doc)}
                    className="btn-primary"
                    style={{ fontSize: 12, padding: "5px 12px", background: "#0052cc" }}
                  >
                    Review Document
                  </button>
                ) : (
                  <button
                    onClick={() => handleOpenReview(doc)}
                    className="btn-ghost"
                    style={{ fontSize: 12, color: "#0052cc" }}
                  >
                    Inspect Details →
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Review Modal */}
      {reviewModalOpen && selectedDoc && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 540,
              width: "100%",
              background: "#ffffff",
              borderRadius: 20,
              padding: "28px 32px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
              <div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#0052cc", textTransform: "uppercase" }}>
                  AI Extraction Verification
                </span>
                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#002e6e", margin: "2px 0 0" }}>
                  {selectedDoc.type}
                </h3>
              </div>
              <span className="badge badge-blue">Confidence: 94%</span>
            </div>

            <div style={{ background: "#f0f7ff", border: "1px solid #c8e0ff", borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#1e40af", marginBottom: 20 }}>
              AI extracted: TUM M.Sc Computer Science, October 2027 start date, €12,000 tuition.
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 24, fontSize: 13.5 }}>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>University:</span>
                <span style={{ fontWeight: 700, color: "#002e6e" }}>Technical University of Munich</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>Program:</span>
                <span style={{ fontWeight: 700, color: "#002e6e" }}>M.Sc Computer Science</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>Start Date:</span>
                <span style={{ fontWeight: 700, color: "#002e6e" }}>October 2027</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "#f8fafc", borderRadius: 8 }}>
                <span style={{ color: "#64748b" }}>Tuition:</span>
                <span style={{ fontWeight: 700, color: "#00875a" }}>€12,000 / Year</span>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setReviewModalOpen(false)} className="btn-ghost" style={{ fontSize: 13 }}>
                Reject
              </button>
              <button
                onClick={handleConfirmReview}
                className="btn-primary"
                style={{ fontSize: 13, padding: "8px 22px", background: "#00875a" }}
              >
                Confirm Information ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
