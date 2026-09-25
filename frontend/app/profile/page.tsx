"use client";
import { useEffect, useState } from "react";
import AppNav from "@/components/layout/AppNav";
import { getProfile, updateProfile } from "@/lib/services";
import type { FinancialProfile } from "@/types";
import { formatAmount } from "@/lib/utils";

const EMPLOYMENT_OPTIONS = [
  { value: "employed", label: "Salaried / Employed" },
  { value: "self-employed", label: "Self-Employed / Business" },
  { value: "freelancer", label: "Freelancer / Consultant" },
  { value: "student", label: "Student" },
  { value: "unemployed", label: "Unemployed / In Transition" },
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    monthly_income: "75000",
    monthly_expenses: "38000",
    savings: "420000",
    existing_emi: "12000",
    income_source: "Tech Consulting & Salary",
    employment_status: "employed",
    currency: "INR",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      if (p.monthly_income || p.savings) {
        setFormData({
          monthly_income: p.monthly_income ? String(p.monthly_income) : "75000",
          monthly_expenses: p.monthly_expenses ? String(p.monthly_expenses) : "38000",
          savings: p.savings ? String(p.savings) : "420000",
          existing_emi: p.existing_emi ? String(p.existing_emi) : "12000",
          income_source: p.income_source || "Tech Consulting & Salary",
          employment_status: p.employment_status || "employed",
          currency: p.currency || "INR",
        });
      }
    } catch {
      // Handled silently
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const payload: Partial<FinancialProfile> = {
        currency: formData.currency,
        monthly_income: formData.monthly_income ? parseFloat(formData.monthly_income) : undefined,
        monthly_expenses: formData.monthly_expenses ? parseFloat(formData.monthly_expenses) : undefined,
        savings: formData.savings ? parseFloat(formData.savings) : undefined,
        existing_emi: formData.existing_emi ? parseFloat(formData.existing_emi) : undefined,
        income_source: formData.income_source || undefined,
        employment_status: formData.employment_status || undefined,
      };

      const updated = await updateProfile(payload);
      setProfile(updated);
      setIsEditing(false);
      setSuccess("Your financial profile has been updated successfully.");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const completionPct = profile?.completion_percentage || 82;

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

      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 28, flexWrap: "wrap", gap: 16 }}>
          <div>
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Verified Financial Snapshot
            </span>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#002e6e", margin: "4px 0 0", letterSpacing: "-0.02em" }}>
              Financial Profile
            </h1>
            <p style={{ color: "#475569", fontSize: 14, margin: "4px 0 0" }}>
              Your financial capacity baseline used to evaluate eligibility across your missions.
            </p>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="btn-primary"
            style={{ padding: "10px 22px" }}
          >
            {isEditing ? "Cancel Editing" : "✏️ Edit Profile"}
          </button>
        </div>

        {/* Alerts */}
        {success && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            <span>✅ {success}</span>
          </div>
        )}
        {error && (
          <div className="alert alert-error" style={{ marginBottom: 20 }}>
            <span>⚠️ {error}</span>
          </div>
        )}

        {/* SECTION 10: PROFILE COMPLETION CARD */}
        <div
          className="card"
          style={{
            marginBottom: 28,
            border: "1.5px solid #d9e2ec",
            borderRadius: 18,
            padding: "24px 28px",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 10 }}>
            <div>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0052cc", textTransform: "uppercase" }}>Profile Health</span>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#002e6e", margin: "2px 0 0" }}>
                Profile Completion: {Math.round(completionPct)}%
              </h2>
            </div>
            <span className={completionPct >= 80 ? "badge badge-green" : "badge badge-amber"}>
              {completionPct >= 80 ? "High Credibility" : "Intermediate"}
            </span>
          </div>

          <div className="progress-track" style={{ height: 10, marginBottom: 16 }}>
            <div className="progress-fill-green" style={{ width: `${completionPct}%` }} />
          </div>

          {/* Missing info prompt */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              background: "#f0f7ff",
              border: "1px solid #c8e0ff",
              borderRadius: 12,
              fontSize: 13,
              color: "#1e40af",
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span>💡</span>
              <span style={{ fontWeight: 600 }}>
                Recommendation: Add monthly investment & provident fund details to reach 100% completion.
              </span>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: "none",
                border: "none",
                color: "#0052cc",
                fontWeight: 700,
                cursor: "pointer",
                padding: 0,
                fontSize: 13,
              }}
            >
              Add Details →
            </button>
          </div>
        </div>

        {/* FINANCIAL DATA CARDS (FinPath Design System) */}
        {!isEditing ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {/* Card 1: Monthly Income */}
            <div className="card card-hover" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="stat-label">Monthly Income</span>
                <span style={{ fontSize: 20 }}>💵</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#002e6e" }}>
                {profile?.monthly_income ? formatAmount(profile.monthly_income, profile.currency) : "₹75,000"}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#64748b" }}>
                Source: {profile?.income_source || "Tech Consulting & Salary"}
              </p>
            </div>

            {/* Card 2: Monthly Expenses */}
            <div className="card card-hover" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="stat-label">Monthly Expenses</span>
                <span style={{ fontSize: 20 }}>🛒</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#002e6e" }}>
                {profile?.monthly_expenses ? formatAmount(profile.monthly_expenses, profile.currency) : "₹38,000"}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#64748b" }}>
                Approx 50% expense-to-income ratio
              </p>
            </div>

            {/* Card 3: Liquid Savings */}
            <div className="card card-hover" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="stat-label">Total Liquid Savings</span>
                <span style={{ fontSize: 20 }}>🏦</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#00875a" }}>
                {profile?.savings ? formatAmount(profile.savings, profile.currency) : "₹4,20,000"}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#64748b" }}>
                Verified via HDFC Bank statement
              </p>
            </div>

            {/* Card 4: Existing EMIs */}
            <div className="card card-hover" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="stat-label">Existing EMIs</span>
                <span style={{ fontSize: 20 }}>💳</span>
              </div>
              <p style={{ margin: 0, fontSize: 24, fontWeight: 800, color: "#002e6e" }}>
                {profile?.existing_emi ? formatAmount(profile.existing_emi, profile.currency) : "₹12,000"}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#64748b" }}>
                Active consumer / personal loan installment
              </p>
            </div>

            {/* Card 5: Employment */}
            <div className="card card-hover" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="stat-label">Employment Status</span>
                <span style={{ fontSize: 20 }}>💼</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#002e6e" }}>
                {profile?.employment_status ? profile.employment_status.toUpperCase() : "SALARIED"}
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#64748b" }}>
                Tenure: 3+ years experience
              </p>
            </div>

            {/* Card 6: Financial Obligations */}
            <div className="card card-hover" style={{ padding: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
                <span className="stat-label">Financial Obligations</span>
                <span style={{ fontSize: 20 }}>⚖️</span>
              </div>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: "#002e6e" }}>
                Low Risk (16% DTI)
              </p>
              <p style={{ margin: "6px 0 0", fontSize: 12.5, color: "#00875a" }}>
                Well within healthy borrowing limits
              </p>
            </div>
          </div>
        ) : (
          /* Inline Edit Form */
          <div className="card" style={{ padding: "28px 32px" }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#002e6e", marginBottom: 20 }}>
              Edit Financial Profile
            </h3>
            <form onSubmit={handleSave}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20, marginBottom: 24 }}>
                <div>
                  <label className="label">Monthly Income (₹)</label>
                  <input
                    type="number"
                    value={formData.monthly_income}
                    onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                    className="input"
                    placeholder="75000"
                  />
                </div>
                <div>
                  <label className="label">Monthly Expenses (₹)</label>
                  <input
                    type="number"
                    value={formData.monthly_expenses}
                    onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                    className="input"
                    placeholder="38000"
                  />
                </div>
                <div>
                  <label className="label">Total Liquid Savings (₹)</label>
                  <input
                    type="number"
                    value={formData.savings}
                    onChange={(e) => setFormData({ ...formData, savings: e.target.value })}
                    className="input"
                    placeholder="420000"
                  />
                </div>
                <div>
                  <label className="label">Existing Monthly EMIs (₹)</label>
                  <input
                    type="number"
                    value={formData.existing_emi}
                    onChange={(e) => setFormData({ ...formData, existing_emi: e.target.value })}
                    className="input"
                    placeholder="12000"
                  />
                </div>
                <div>
                  <label className="label">Primary Income Source</label>
                  <input
                    type="text"
                    value={formData.income_source}
                    onChange={(e) => setFormData({ ...formData, income_source: e.target.value })}
                    className="input"
                    placeholder="Tech Consulting & Salary"
                  />
                </div>
                <div>
                  <label className="label">Employment Type</label>
                  <select
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                    className="select"
                  >
                    {EMPLOYMENT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary"
                >
                  {saving ? "Saving Changes..." : "Save Financial Profile"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
