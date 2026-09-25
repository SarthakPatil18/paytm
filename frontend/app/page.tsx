"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isAuthenticated } from "@/lib/utils";

const SAMPLE_PROMPTS = [
  "I want to study in Germany next year with ₹12 lakh",
  "We are planning to buy a 3BHK in Bangalore in 2 years with ₹75 lakh",
  "I want to build an emergency fund of ₹5 lakh in 6 months",
  "Need seed funding of ₹25 lakh for my tech startup next year",
];

export default function LandingPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [goalInput, setGoalInput] = useState("I want to study in Germany next year with ₹12 lakh");
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const handleAnalyze = () => {
    if (!goalInput.trim()) return;
    setAnalyzing(true);
    setAnalyzed(false);
    setAnalysisStep(1);

    setTimeout(() => setAnalysisStep(2), 500);
    setTimeout(() => setAnalysisStep(3), 1000);
    setTimeout(() => setAnalysisStep(4), 1500);
    setTimeout(() => {
      setAnalyzing(false);
      setAnalyzed(true);
    }, 2000);
  };

  const handleStartMission = () => {
    // Save to session storage for the wizard
    if (typeof window !== "undefined") {
      sessionStorage.setItem("finpath_initial_goal", goalInput);
    }
    if (isAuth) {
      router.push(`/mission/new?text=${encodeURIComponent(goalInput)}`);
    } else {
      router.push(`/register?redirect=/mission/new&text=${encodeURIComponent(goalInput)}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Top Header */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 36px",
          borderBottom: "1px solid #f1f5f9",
          position: "sticky",
          top: 0,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          zIndex: 50,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: "linear-gradient(135deg, #002e6e 0%, #0052cc 60%, #00baf2 100%)",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0, 82, 204, 0.25)",
            }}
          >
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>F</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#002e6e", letterSpacing: "-0.02em" }}>
              FinPath
            </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
                background: "#e0f2fe",
                color: "#0284c7",
                padding: "2px 6px",
                borderRadius: 4,
              }}
            >
              AI
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/demo" className="btn-secondary" style={{ fontSize: 13.5, padding: "8px 16px" }}>
            🔍 Try Instant Demo
          </Link>
          {isAuth ? (
            <Link href="/dashboard" className="btn-primary" style={{ fontSize: 13.5, padding: "8px 18px" }}>
              Dashboard →
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-ghost" style={{ fontSize: 13.5 }}>
                Sign in
              </Link>
              <Link href="/register" className="btn-primary" style={{ fontSize: 13.5, padding: "8px 18px" }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "70px 24px 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            background: "#ebf4ff",
            color: "#0052cc",
            padding: "6px 18px",
            borderRadius: 100,
            fontSize: 13,
            fontWeight: 700,
            marginBottom: 24,
            border: "1px solid #c8e0ff",
          }}
        >
          <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: "#00baf2" }} />
          <span>Goal-First Financial Journey Platform</span>
        </div>

        <h1
          style={{
            fontSize: "clamp(32px, 5vw, 52px)",
            fontWeight: 800,
            color: "#002e6e",
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            marginBottom: 18,
          }}
        >
          Turn your financial goal into a clear journey.
        </h1>

        <p
          style={{
            fontSize: "clamp(16px, 2.5vw, 19px)",
            color: "#475569",
            maxWidth: 680,
            margin: "0 auto 36px",
            lineHeight: 1.6,
          }}
        >
          FinPath AI understands your goal, organizes your financial information, and guides you through every step.
        </p>

        {/* Action CTAs */}
        <div style={{ display: "flex", justifyContent: "center", gap: 14, flexWrap: "wrap", marginBottom: 50 }}>
          <button
            onClick={handleStartMission}
            className="btn-primary"
            style={{ padding: "14px 30px", fontSize: 16, borderRadius: 12 }}
          >
            Start Your Financial Journey →
          </button>
          <Link
            href="/demo"
            className="btn-secondary"
            style={{ padding: "14px 28px", fontSize: 16, borderRadius: 12 }}
          >
            Try Instant Demo
          </Link>
        </div>

        {/* Conversational Goal Input Card */}
        <div
          className="card"
          style={{
            maxWidth: 760,
            margin: "0 auto",
            textAlign: "left",
            boxShadow: "0 12px 40px rgba(0, 46, 110, 0.08)",
            border: "1.5px solid #d9e6f7",
            borderRadius: 20,
            padding: "28px 32px",
            background: "#ffffff",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
            <span style={{ fontSize: 20 }}>💬</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#002e6e" }}>
              Tell FinPath what you want to achieve:
            </span>
          </div>

          <div style={{ position: "relative", marginBottom: 16 }}>
            <input
              type="text"
              value={goalInput}
              onChange={(e) => {
                setGoalInput(e.target.value);
                setAnalyzed(false);
              }}
              placeholder="e.g. I want to study in Germany next year with ₹12 lakh"
              className="input"
              style={{
                padding: "16px 20px",
                fontSize: 15,
                borderRadius: 12,
                border: "2px solid #cbd5e1",
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAnalyze();
              }}
            />
          </div>

          {/* Quick chips */}
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
            {SAMPLE_PROMPTS.map((prompt) => (
              <button
                key={prompt}
                onClick={() => {
                  setGoalInput(prompt);
                  setAnalyzed(false);
                }}
                style={{
                  background: "#f1f5f9",
                  border: "1px solid #e2e8f0",
                  padding: "5px 12px",
                  borderRadius: 100,
                  fontSize: 12,
                  color: "#475569",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = "#ebf4ff";
                  e.currentTarget.style.color = "#0052cc";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = "#f1f5f9";
                  e.currentTarget.style.color = "#475569";
                }}
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* AI Processing Interaction */}
          {analyzing && (
            <div
              style={{
                background: "#f0f7ff",
                borderRadius: 12,
                padding: "18px 22px",
                border: "1px solid #b9d9ff",
                marginBottom: 18,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div className="spinner" />
                <span style={{ fontSize: 14, fontWeight: 700, color: "#0052cc" }}>
                  Understanding your goal...
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6, fontSize: 13 }}>
                <div style={{ color: analysisStep >= 1 ? "#00875a" : "#94a3b8", fontWeight: 600 }}>
                  {analysisStep >= 1 ? "✓ Goal detected" : "○ Detecting goal category..."}
                </div>
                <div style={{ color: analysisStep >= 2 ? "#00875a" : "#94a3b8", fontWeight: 600 }}>
                  {analysisStep >= 2 ? "✓ Target amount detected" : "○ Calculating target amount..."}
                </div>
                <div style={{ color: analysisStep >= 3 ? "#00875a" : "#94a3b8", fontWeight: 600 }}>
                  {analysisStep >= 3 ? "✓ Timeline detected" : "○ Estimating target timeline..."}
                </div>
                <div style={{ color: analysisStep >= 4 ? "#00875a" : "#94a3b8", fontWeight: 600 }}>
                  {analysisStep >= 4 ? "✓ Financial mission ready" : "○ Assembling mission checklist..."}
                </div>
              </div>
            </div>
          )}

          {/* Analyzed Confirmation State */}
          {analyzed && (
            <div
              style={{
                background: "#e6f9f2",
                borderRadius: 14,
                padding: "20px 24px",
                border: "1.5px solid #a8edd6",
                marginBottom: 20,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ color: "#00875a", fontSize: 18, fontWeight: 800 }}>✓</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: "#004d33" }}>
                  Financial Mission Ready to Launch
                </span>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                  gap: 12,
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: "1px solid #bbf2e0",
                }}
              >
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#006847", textTransform: "uppercase" }}>Category</span>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#003824" }}>Education (Germany)</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#006847", textTransform: "uppercase" }}>Target Amount</span>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#003824" }}>₹12,00,000</p>
                </div>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#006847", textTransform: "uppercase" }}>Timeline</span>
                  <p style={{ margin: "2px 0 0", fontSize: 14, fontWeight: 700, color: "#003824" }}>Next year (1 Year)</p>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
            {!analyzed && (
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="btn-secondary"
                style={{ borderRadius: 10, padding: "10px 20px" }}
              >
                {analyzing ? "Analyzing..." : "Analyze with AI"}
              </button>
            )}
            <button
              onClick={handleStartMission}
              className="btn-primary"
              style={{ borderRadius: 10, padding: "10px 24px" }}
            >
              Create Financial Mission →
            </button>
          </div>
        </div>
      </section>

      {/* 4 Core Capabilities Section */}
      <section
        style={{
          background: "#f8fafd",
          borderTop: "1px solid #eef2f8",
          padding: "70px 24px",
        }}
      >
        <div style={{ maxWidth: 1060, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <span
              style={{
                fontSize: 12,
                fontWeight: 800,
                color: "#0052cc",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Core Capabilities
            </span>
            <h2
              style={{
                fontSize: 32,
                fontWeight: 800,
                color: "#002e6e",
                marginTop: 8,
                letterSpacing: "-0.02em",
              }}
            >
              Why FinPath AI is Different
            </h2>
            <p style={{ color: "#64748b", fontSize: 16, maxWidth: 540, margin: "8px auto 0" }}>
              Instead of pushing individual financial products, FinPath orchestrates your entire financial journey around your goal.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
              gap: 20,
            }}
          >
            {/* Capability 1 */}
            <div className="card card-hover" style={{ padding: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#ebf4ff",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                  color: "#0052cc",
                }}
              >
                💬
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#002e6e", marginBottom: 8 }}>
                1. Natural Goal Understanding
              </h3>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                Speak in your own words. Gemini AI parses your intent, extracts amounts, timelines, and destinations, and clarifies missing gaps.
              </p>
            </div>

            {/* Capability 2 */}
            <div className="card card-hover" style={{ padding: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#e0f2fe",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                  color: "#0284c7",
                }}
              >
                🎯
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#002e6e", marginBottom: 8 }}>
                2. Financial Mission
              </h3>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                Your goal transforms into a dedicated Financial Mission with readiness milestones, document checklists, and target dates.
              </p>
            </div>

            {/* Capability 3 */}
            <div className="card card-hover" style={{ padding: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#e6f9f2",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                  color: "#00875a",
                }}
              >
                📄
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#002e6e", marginBottom: 8 }}>
                3. Intelligent Document Processing
              </h3>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                Drop passports, bank statements, or offer letters. OCR extracts verified parameters with confidence scores for your review.
              </p>
            </div>

            {/* Capability 4 */}
            <div className="card card-hover" style={{ padding: 28 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  background: "#fef3c7",
                  borderRadius: 12,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 22,
                  marginBottom: 16,
                  color: "#b45309",
                }}
              >
                ⚡
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#002e6e", marginBottom: 8 }}>
                4. Adaptive Journey & Next Best Action
              </h3>
              <p style={{ fontSize: 13.5, color: "#475569", lineHeight: 1.6 }}>
                Never wonder what to do next. The system dynamically pinpoints the highest-impact action to move your mission forward.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: "1px solid #e2e8f0",
          padding: "36px 24px",
          textAlign: "center",
          color: "#94a3b8",
          fontSize: 13,
        }}
      >
        <p style={{ margin: "0 0 6px" }}>
          FinPath AI © 2026 — Phase 1 Financial Journey Platform
        </p>
        <p style={{ margin: 0, fontSize: 12 }}>
          Empowering goal-first financial decision making with AI
        </p>
      </footer>
    </div>
  );
}
