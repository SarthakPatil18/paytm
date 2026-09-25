"use client";
import { useEffect, useState } from "react";
import AppNav from "@/components/layout/AppNav";
import { getProfile, updateProfile } from "@/lib/services";
import type { FinancialProfile } from "@/types";
import { formatAmount } from "@/lib/utils";

const EMPLOYMENT_OPTIONS = [
  "employed",
  "self-employed",
  "freelancer",
  "student",
  "unemployed",
  "retired",
];

export default function ProfilePage() {
  const [profile, setProfile] = useState<FinancialProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    monthly_income: "",
    monthly_expenses: "",
    savings: "",
    existing_emi: "",
    income_source: "",
    employment_status: "",
    currency: "INR",
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const p = await getProfile();
      setProfile(p);
      setFormData({
        monthly_income: p.monthly_income ? String(p.monthly_income) : "",
        monthly_expenses: p.monthly_expenses ? String(p.monthly_expenses) : "",
        savings: p.savings ? String(p.savings) : "",
        existing_emi: p.existing_emi ? String(p.existing_emi) : "",
        income_source: p.income_source || "",
        employment_status: p.employment_status || "",
        currency: p.currency || "INR",
      });
    } catch {
      // ignore
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
      };
      if (formData.monthly_income) payload.monthly_income = parseFloat(formData.monthly_income);
      if (formData.monthly_expenses) payload.monthly_expenses = parseFloat(formData.monthly_expenses);
      if (formData.savings) payload.savings = parseFloat(formData.savings);
      if (formData.existing_emi) payload.existing_emi = parseFloat(formData.existing_emi);
      if (formData.income_source) payload.income_source = formData.income_source;
      if (formData.employment_status) payload.employment_status = formData.employment_status;

      const updated = await updateProfile(payload);
      setProfile(updated);
      setSuccess("Your financial profile has been updated.");
      setTimeout(() => setSuccess(""), 4000);
    } catch {
      setError("Failed to update profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const completionColor = (profile?.completion_percentage || 0) >= 80 ? "#059669"
    : (profile?.completion_percentage || 0) >= 40 ? "#d97706" : "#dc2626";

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

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            Financial Profile
          </h1>
          <p style={{ color: "#6b7280", fontSize: 14, maxWidth: 500 }}>
            This is your financial snapshot. It&apos;s built from your confirmed documents and manual entries.
            We never make financial judgments — this is only data completeness.
          </p>
        </div>

        {/* Completion */}
        {profile && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 600, color: "#111827", marginBottom: 4 }}>
                  Profile Completeness
                </h3>
                <p style={{ fontSize: 13, color: "#6b7280" }}>
                  {profile.completion_percentage < 40 ? "Add more information to build your profile." :
                    profile.completion_percentage < 80 ? "Getting there — a few more fields to fill." :
                      "Your profile is well-filled. ✓"}
                </p>
              </div>
              <span style={{ fontSize: 28, fontWeight: 700, color: completionColor }}>
                {profile.completion_percentage}%
              </span>
            </div>
            <div className="progress-bar" style={{ height: 8 }}>
              <div
                className="progress-fill"
                style={{ width: `${profile.completion_percentage}%`, background: completionColor }}
              />
            </div>
            <div style={{ display: "flex", gap: 20, marginTop: 16, flexWrap: "wrap" }}>
              {[
                { label: "Income", done: !!profile.monthly_income },
                { label: "Savings", done: !!profile.savings },
                { label: "Expenses", done: !!profile.monthly_expenses },
                { label: "Existing EMI", done: profile.existing_emi !== null && profile.existing_emi !== undefined },
                { label: "Employment", done: !!profile.employment_status },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div className={`status-dot ${item.done ? "status-dot-green" : "status-dot-gray"}`} />
                  <span style={{ fontSize: 13, color: item.done ? "#111827" : "#9ca3af" }}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {success && <div className="alert alert-success" style={{ marginBottom: 20 }}>{success}</div>}
        {error && <div className="alert alert-error" style={{ marginBottom: 20 }}>{error}</div>}

        {/* Form */}
        <div className="card">
          <div style={{ marginBottom: 20 }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: "#111827", marginBottom: 4 }}>
              Financial Information
            </h2>
            <p style={{ fontSize: 13, color: "#6b7280" }}>
              Leave any field blank if you don&apos;t want to provide it. You can update this anytime.
            </p>
          </div>

          <form onSubmit={handleSave}>
            {/* Income Section */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                Income
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="monthly-income" className="label">Monthly Income (₹)</label>
                  <input
                    id="monthly-income"
                    className="input"
                    type="number"
                    placeholder="e.g., 75000"
                    value={formData.monthly_income}
                    onChange={(e) => setFormData({ ...formData, monthly_income: e.target.value })}
                  />
                  {formData.monthly_income && (
                    <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                      = {formatAmount(parseFloat(formData.monthly_income))} / month
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="income-source" className="label">Income Source</label>
                  <input
                    id="income-source"
                    className="input"
                    placeholder="e.g., Employer name, freelance"
                    value={formData.income_source}
                    onChange={(e) => setFormData({ ...formData, income_source: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Assets Section */}
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 12, fontWeight: 600, color: "#1d4ed8", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>
                Assets & Liabilities
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label htmlFor="savings" className="label">Total Savings (₹)</label>
                  <input
                    id="savings"
                    className="input"
                    type="number"
                    placeholder="e.g., 300000"
                    value={formData.savings}
                    onChange={(e) => setFormData({ ...formData, savings: e.target.value })}
                  />
                  {formData.savings && (
                    <p style={{ fontSize: 11, color: "#6b7280", marginTop: 4 }}>
                      = {formatAmount(parseFloat(formData.savings))}
                    </p>
                  )}
                </div>
                <div>
                  <label htmlFor="monthly-expenses" className="label">Monthly Expenses (₹)</label>
                  <input
                    id="monthly-expenses"
                    className="input"
                    type="number"
                    placeholder="e.g., 40000"
                    value={formData.monthly_expenses}
                    onChange={(e) => setFormData({ ...formData, monthly_expenses: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="existing-emi" className="label">Existing EMI (₹/month)</label>
                  <input
                    id="existing-emi"
                    className="input"
                    type="number"
                    placeholder="e.g., 8000 (0 if none)"
                    value={formData.existing_emi}
                    onChange={(e) => setFormData({ ...formData, existing_emi: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="employment-status" className="label">Employment Status</label>
                  <select
                    id="employment-status"
                    className="select"
                    value={formData.employment_status}
                    onChange={(e) => setFormData({ ...formData, employment_status: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {EMPLOYMENT_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <hr className="divider" />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                id="save-profile-btn"
                type="submit"
                className="btn-primary"
                disabled={saving}
                style={{ minWidth: 140 }}
              >
                {saving ? <><span className="spinner" /> Saving…</> : "Save Profile"}
              </button>
            </div>
          </form>
        </div>

        {/* Info Note */}
        <div className="alert alert-info" style={{ marginTop: 24 }}>
          <span>ℹ</span>
          <div>
            <strong>About your financial profile</strong>
            <p style={{ marginTop: 4, marginBottom: 0 }}>
              FinPath uses this information to track your journey progress. We do not make loan, insurance,
              or eligibility decisions based on this data. This is Phase 1 — a foundation for your financial story.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
