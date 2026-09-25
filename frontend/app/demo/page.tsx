"use client";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { formatAmount } from "@/lib/utils";

const DEMO_MISSION = {
  goal_title: "Study in Germany",
  goal_category: "education",
  destination: "Germany",
  target_amount: 1200000,
  currency: "INR",
  timeline_text: "Next year",
  status: "ACTIVE",
};

const DEMO_PROFILE = {
  monthly_income: 75000,
  savings: 300000,
  existing_emi: 8000,
  employment_status: "employed",
  completion_percentage: 80,
};

const DEMO_DOCS = [
  { name: "Salary_Slip_August.pdf", type: "Salary Slip", status: "confirmed", confidence: 97 },
  { name: "HDFC_Statement_Q2.pdf", type: "Bank Statement", status: "confirmed", confidence: 94 },
  { name: "Scholarship_Letter.pdf", type: "Scholarship Letter", status: "review_required", confidence: 88 },
];

export default function DemoPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      {/* Demo Banner */}
      <div style={{
        background: "#fef3c7", borderBottom: "1px solid #fde68a",
        padding: "10px 24px", textAlign: "center", fontSize: 13, color: "#92400e"
      }}>
        🔍 <strong>Demo Mode</strong> — This is sample data. No real information is stored.{" "}
        <Link href="/register" style={{ color: "#1d4ed8", fontWeight: 600, textDecoration: "none" }}>
          Create your real account →
        </Link>
      </div>

      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 40px", height: 60, background: "#fff", borderBottom: "1px solid #f3f4f6"
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 28, height: 28, background: "#1d4ed8", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>F</span>
          </div>
          <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>FinPath AI</span>
        </Link>
        <Link href="/register" className="btn-primary" style={{ fontSize: 14 }}>Get Started</Link>
      </nav>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            Demo: Sushrut&apos;s Financial Journey
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14 }}>
            This shows what FinPath looks like with sample data. All values below are for demonstration only.
          </p>
        </div>

        {/* Active Mission */}
        <div className="card" style={{ marginBottom: 24, borderLeft: "4px solid #1d4ed8" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 36 }}>🎓</span>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Study in Germany</h2>
                  <span className="badge badge-green">ACTIVE</span>
                  <span className="badge badge-yellow">Demo Data</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280" }}>Education · Germany</p>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <div>
              <p className="label">Target Amount</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>₹12,00,000</p>
            </div>
            <div>
              <p className="label">Timeline</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Next year</p>
            </div>
            <div>
              <p className="label">Overall Progress</p>
              <p style={{ fontSize: 20, fontWeight: 700, color: "#1d4ed8" }}>73%</p>
            </div>
          </div>

          {[
            { label: "Goal Information", value: 100 },
            { label: "Documents", value: 66 },
            { label: "Financial Profile", value: 80 },
          ].map((item) => (
            <div key={item.label} style={{ marginBottom: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: "#374151" }}>{item.label}</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>{item.value}%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
          {/* Financial Profile */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Financial Profile</h3>
              <span className="badge badge-yellow" style={{ fontSize: 11 }}>Demo Data</span>
            </div>
            {[
              { label: "Monthly Income", value: "₹75,000 / month" },
              { label: "Savings", value: "₹3,00,000" },
              { label: "Monthly Expenses", value: "Not provided" },
              { label: "Existing EMI", value: "₹8,000 / month" },
              { label: "Employment", value: "Employed" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>{item.label}</span>
                <span style={{ fontSize: 14, fontWeight: item.value !== "Not provided" ? 500 : 400, color: item.value !== "Not provided" ? "#111827" : "#d1d5db" }}>
                  {item.value}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Completeness</span>
                <span style={{ fontSize: 12, fontWeight: 600 }}>80%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: "80%" }} />
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>Documents</h3>
              <span className="badge badge-yellow" style={{ fontSize: 11 }}>Demo Data</span>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              {DEMO_DOCS.map((doc) => (
                <div key={doc.name} style={{
                  padding: "12px 14px", background: "#f8f9fc", borderRadius: 8,
                  border: "1px solid #e5e7eb"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#111827", marginBottom: 2 }}>{doc.name}</p>
                      <p style={{ fontSize: 12, color: "#6b7280" }}>{doc.type} · {doc.confidence}% confident</p>
                    </div>
                    <span className={`badge ${doc.status === "confirmed" ? "badge-green" : "badge-orange"}`} style={{ fontSize: 11 }}>
                      {doc.status === "confirmed" ? "✓ Confirmed" : "⚠ Review"}
                    </span>
                  </div>
                </div>
              ))}
              <div style={{
                padding: "12px 14px", background: "#f8f9fc", borderRadius: 8,
                border: "2px dashed #d1d5db", textAlign: "center", color: "#9ca3af", fontSize: 13
              }}>
                + Upload Document
              </div>
            </div>
          </div>
        </div>

        {/* Next Step */}
        <div className="card" style={{ borderTop: "3px solid #1d4ed8", background: "#fafbff", marginBottom: 32 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ fontSize: 12, color: "#1d4ed8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
                Next Step
              </p>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
                Review Scholarship Letter
              </h3>
              <p style={{ fontSize: 13, color: "#6b7280" }}>
                Your scholarship letter has been processed. Review the extracted information.
              </p>
            </div>
            <button className="btn-primary" disabled style={{ opacity: 0.6 }}>
              Review Data
            </button>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: "center", padding: "20px 0 40px" }}>
          <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 12 }}>
            Ready to start your real financial journey?
          </h2>
          <p style={{ color: "#6b7280", marginBottom: 24 }}>
            This demo shows a snapshot. Your real account is connected to AI that actually processes your documents.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link href="/register" className="btn-primary" style={{ padding: "12px 28px" }}>
              Create Account
            </Link>
            <Link href="/login" className="btn-secondary" style={{ padding: "12px 28px" }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
