"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import AppNav from "@/components/layout/AppNav";
import { parseGoal, createMission } from "@/lib/services";
import type { GoalParseResponse } from "@/types";
import { GOAL_CATEGORY_ICONS, GOAL_CATEGORY_LABELS } from "@/types";
import { formatAmount } from "@/lib/utils";

const GOAL_CATEGORIES = ["education", "healthcare", "home", "vehicle", "business", "emergency", "other"];

type Step = "input" | "confirm" | "done";
type Mode = "natural" | "structured";

export default function NewMissionPage() {
  const router = useRouter();

  const [mode, setMode] = useState<Mode>("natural");
  const [step, setStep] = useState<Step>("input");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Natural language input
  const [goalText, setGoalText] = useState("");
  const [parsed, setParsed] = useState<GoalParseResponse | null>(null);

  // Structured input
  const [structured, setStructured] = useState({
    goal_category: "",
    goal_title: "",
    description: "",
    destination: "",
    target_amount: "",
    currency: "INR",
    timeline_text: "",
  });

  // Editable confirm fields
  const [editedParsed, setEditedParsed] = useState<GoalParseResponse | null>(null);

  const handleNaturalSubmit = async () => {
    if (!goalText.trim()) return;
    setError("");
    setLoading(true);

    try {
      const result = await parseGoal(goalText);
      setParsed(result);
      setEditedParsed(result);
      setStep("confirm");
    } catch {
      setError("We couldn't understand your goal right now. Please try again or use structured input.");
    } finally {
      setLoading(false);
    }
  };

  const handleStructuredSubmit = () => {
    if (!structured.goal_category || !structured.goal_title) {
      setError("Please fill in at least Goal Category and Goal Title.");
      return;
    }
    setError("");
    const fakeResult: GoalParseResponse = {
      goal_category: structured.goal_category,
      goal_title: structured.goal_title,
      destination: structured.destination || null,
      target_amount: structured.target_amount ? parseFloat(structured.target_amount) : null,
      currency: structured.currency,
      deadline: null,
      timeline_text: structured.timeline_text || null,
      description: structured.description || null,
      confidence: 1.0,
      needs_clarification: false,
      clarification_questions: [],
    };
    setParsed(fakeResult);
    setEditedParsed(fakeResult);
    setStep("confirm");
  };

  const handleConfirm = async () => {
    if (!editedParsed?.goal_category || !editedParsed?.goal_title) {
      setError("Please ensure goal category and title are filled in.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const mission = await createMission({
        goal_category: editedParsed.goal_category!,
        goal_title: editedParsed.goal_title!,
        description: editedParsed.description || undefined,
        destination: editedParsed.destination || undefined,
        target_amount: editedParsed.target_amount || undefined,
        currency: editedParsed.currency,
        timeline_text: editedParsed.timeline_text || undefined,
      });

      setStep("done");
      setTimeout(() => router.push(`/mission/${mission.id}`), 1500);
    } catch {
      setError("Failed to create mission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fc" }}>
      <AppNav />

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <button onClick={() => router.push("/dashboard")} className="btn-ghost" style={{ padding: "6px 0", marginBottom: 16 }}>
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
            Create a Financial Mission
          </h1>
          <p style={{ color: "#6b7280", fontSize: 15 }}>
            Tell FinPath what you&apos;re trying to achieve. We&apos;ll organize your financial journey around it.
          </p>
        </div>

        {/* Progress Steps */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 32 }}>
          {(["input", "confirm", "done"] as Step[]).map((s, i) => (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: step === s ? "#1d4ed8" : (i < ["input", "confirm", "done"].indexOf(step) ? "#059669" : "#e5e7eb"),
                color: step === s || i < ["input", "confirm", "done"].indexOf(step) ? "#fff" : "#9ca3af",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 13, fontWeight: 600
              }}>
                {i < ["input", "confirm", "done"].indexOf(step) ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: 13, fontWeight: 500, color: step === s ? "#111827" : "#9ca3af" }}>
                {s === "input" ? "Describe Goal" : s === "confirm" ? "Confirm" : "Mission Created"}
              </span>
              {i < 2 && <div style={{ flex: 1, height: 1, background: "#e5e7eb", minWidth: 40 }} />}
            </div>
          ))}
        </div>

        {error && (
          <div className="alert alert-error" style={{ marginBottom: 24 }}>
            {error}
          </div>
        )}

        {/* Step 1: Input */}
        {step === "input" && (
          <div className="card">
            {/* Mode Toggle */}
            <div style={{
              display: "flex", background: "#f3f4f6", borderRadius: 8,
              padding: 4, marginBottom: 28, gap: 4
            }}>
              <button
                id="mode-natural"
                onClick={() => { setMode("natural"); setError(""); }}
                style={{
                  flex: 1, padding: "8px 16px", borderRadius: 6,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
                  background: mode === "natural" ? "#ffffff" : "transparent",
                  color: mode === "natural" ? "#111827" : "#6b7280",
                  boxShadow: mode === "natural" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                Natural Language
              </button>
              <button
                id="mode-structured"
                onClick={() => { setMode("structured"); setError(""); }}
                style={{
                  flex: 1, padding: "8px 16px", borderRadius: 6,
                  border: "none", cursor: "pointer", fontSize: 14, fontWeight: 500,
                  background: mode === "structured" ? "#ffffff" : "transparent",
                  color: mode === "structured" ? "#111827" : "#6b7280",
                  boxShadow: mode === "structured" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  transition: "all 0.15s",
                }}
              >
                Structured Input
              </button>
            </div>

            {mode === "natural" ? (
              <div>
                <label className="label" style={{ fontSize: 14, color: "#374151", marginBottom: 10 }}>
                  Tell us what you&apos;re trying to achieve
                </label>
                <textarea
                  id="goal-text-input"
                  className="textarea"
                  placeholder={`Example:\n"I want to study in Germany next year and need around ₹12 lakh."`}
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  style={{ minHeight: 140, fontSize: 15, lineHeight: 1.7 }}
                />
                <p style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                  💡 Be as specific as you can — mention goal, amount, and timeline if known.
                </p>
                <div style={{ marginTop: 24 }}>
                  <button
                    id="parse-goal-btn"
                    onClick={handleNaturalSubmit}
                    className="btn-primary"
                    style={{ width: "100%", padding: "12px" }}
                    disabled={loading || !goalText.trim()}
                  >
                    {loading ? <><span className="spinner" /> Analyzing your goal…</> : "Create My Mission"}
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="label">Goal Category *</label>
                    <select
                      id="structured-category"
                      className="select"
                      value={structured.goal_category}
                      onChange={(e) => setStructured({ ...structured, goal_category: e.target.value })}
                    >
                      <option value="">Select category…</option>
                      {GOAL_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {GOAL_CATEGORY_ICONS[c]} {GOAL_CATEGORY_LABELS[c]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="label">Goal Title *</label>
                    <input
                      id="structured-title"
                      className="input"
                      placeholder="e.g., Study in Germany"
                      value={structured.goal_title}
                      onChange={(e) => setStructured({ ...structured, goal_title: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label">Target Amount</label>
                    <input
                      id="structured-amount"
                      className="input"
                      type="number"
                      placeholder="e.g., 1200000"
                      value={structured.target_amount}
                      onChange={(e) => setStructured({ ...structured, target_amount: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label">Currency</label>
                    <select
                      id="structured-currency"
                      className="select"
                      value={structured.currency}
                      onChange={(e) => setStructured({ ...structured, currency: e.target.value })}
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                    </select>
                  </div>

                  <div>
                    <label className="label">Destination / Location</label>
                    <input
                      id="structured-destination"
                      className="input"
                      placeholder="e.g., Germany"
                      value={structured.destination}
                      onChange={(e) => setStructured({ ...structured, destination: e.target.value })}
                    />
                  </div>

                  <div>
                    <label className="label">Timeline</label>
                    <input
                      id="structured-timeline"
                      className="input"
                      placeholder="e.g., Next year, 18 months"
                      value={structured.timeline_text}
                      onChange={(e) => setStructured({ ...structured, timeline_text: e.target.value })}
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <label className="label">Additional Notes</label>
                    <textarea
                      id="structured-notes"
                      className="textarea"
                      style={{ minHeight: 80 }}
                      placeholder="Any additional context…"
                      value={structured.description}
                      onChange={(e) => setStructured({ ...structured, description: e.target.value })}
                    />
                  </div>
                </div>

                <button
                  id="structured-submit-btn"
                  onClick={handleStructuredSubmit}
                  className="btn-primary"
                  style={{ width: "100%", padding: "12px", marginTop: 24 }}
                >
                  Review & Confirm
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Confirm */}
        {step === "confirm" && editedParsed && (
          <div className="card">
            <div style={{ marginBottom: 24 }}>
              <p style={{ fontSize: 13, color: "#059669", fontWeight: 500, marginBottom: 4 }}>
                ✓ Here&apos;s what we understood
              </p>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>Review your Financial Mission</h2>
              {parsed?.needs_clarification && (
                <div className="alert alert-warning" style={{ marginTop: 16 }}>
                  <div>
                    <strong>We need a bit more information:</strong>
                    <ul style={{ margin: "8px 0 0 16px", padding: 0 }}>
                      {parsed.clarification_questions.map((q, i) => <li key={i}>{q}</li>)}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {parsed && mode === "natural" && (
              <div style={{
                background: "#f8f9fc", borderRadius: 8, padding: 16, marginBottom: 24,
                border: "1px solid #e5e7eb", fontSize: 13, color: "#6b7280"
              }}>
                <strong style={{ color: "#374151" }}>Your input:</strong> &ldquo;{goalText}&rdquo;
                {parsed.confidence > 0 && (
                  <span style={{ marginLeft: 8 }}>
                    · AI Confidence: <strong style={{ color: "#059669" }}>{Math.round(parsed.confidence * 100)}%</strong>
                  </span>
                )}
              </div>
            )}

            {/* Editable fields */}
            <div style={{ display: "grid", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div>
                  <label className="label">Goal Category</label>
                  <select
                    id="confirm-category"
                    className="select"
                    value={editedParsed.goal_category || ""}
                    onChange={(e) => setEditedParsed({ ...editedParsed, goal_category: e.target.value })}
                  >
                    <option value="">Select…</option>
                    {GOAL_CATEGORIES.map((c) => (
                      <option key={c} value={c}>{GOAL_CATEGORY_ICONS[c]} {GOAL_CATEGORY_LABELS[c]}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Goal Title</label>
                  <input
                    id="confirm-title"
                    className="input"
                    value={editedParsed.goal_title || ""}
                    onChange={(e) => setEditedParsed({ ...editedParsed, goal_title: e.target.value })}
                    placeholder="Mission title"
                  />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                <div>
                  <label className="label">Estimated Amount</label>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <input
                      id="confirm-amount"
                      className="input"
                      type="number"
                      value={editedParsed.target_amount ?? ""}
                      onChange={(e) => setEditedParsed({ ...editedParsed, target_amount: e.target.value ? parseFloat(e.target.value) : null })}
                      placeholder="Not specified"
                    />
                  </div>
                  {editedParsed.target_amount && (
                    <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4 }}>
                      = {formatAmount(editedParsed.target_amount)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="label">Timeline</label>
                  <input
                    id="confirm-timeline"
                    className="input"
                    value={editedParsed.timeline_text || ""}
                    onChange={(e) => setEditedParsed({ ...editedParsed, timeline_text: e.target.value })}
                    placeholder="Not specified"
                  />
                </div>
              </div>

              <div>
                <label className="label">Destination / Location</label>
                <input
                  id="confirm-destination"
                  className="input"
                  value={editedParsed.destination || ""}
                  onChange={(e) => setEditedParsed({ ...editedParsed, destination: e.target.value })}
                  placeholder="Not specified"
                />
              </div>
            </div>

            <hr className="divider" />

            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
              <button
                id="confirm-back-btn"
                className="btn-secondary"
                onClick={() => setStep("input")}
              >
                Edit Input
              </button>
              <button
                id="confirm-mission-btn"
                className="btn-primary"
                onClick={handleConfirm}
                disabled={loading}
                style={{ minWidth: 160 }}
              >
                {loading ? <><span className="spinner" /> Creating…</> : "Confirm Mission →"}
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Done */}
        {step === "done" && (
          <div className="card" style={{ textAlign: "center", padding: 48 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: "#111827", marginBottom: 8 }}>
              Financial Mission Created!
            </h2>
            <p style={{ color: "#6b7280" }}>Taking you to your mission dashboard…</p>
            <div style={{ marginTop: 20 }}>
              <div className="spinner" style={{ margin: "0 auto" }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
