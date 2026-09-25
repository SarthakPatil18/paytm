"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { isAuthenticated } from "@/lib/utils";
import { parseGoal } from "@/lib/services";
import type { GoalParseResponse } from "@/types";

const SAMPLE_PROMPTS = [
  "I want to study in Germany next year with ₹12 lakh",
  "We are planning to buy a 3BHK in Bangalore in 2 years with ₹75 lakh",
  "I want to build an emergency fund of ₹5 lakh in 6 months",
  "Need seed funding of ₹25 lakh for my tech startup next year",
];

const CATEGORY_ICONS: Record<string, string> = {
  education: "🎓",
  home: "🏠", home_purchase: "🏠",
  vehicle: "🚗", business: "💼",
  emergency: "🛡️", travel: "✈️",
  investment: "📈", healthcare: "🏥", other: "⭐",
};

export default function LandingPage() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [goalInput, setGoalInput] = useState("I want to study in Germany next year with ₹12 lakh");
  const [analyzing, setAnalyzing] = useState(false);
  const [parsedGoal, setParsedGoal] = useState<GoalParseResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState<"idle" | "loading" | "done">("idle");

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  const handleAnalyze = async () => {
    if (!goalInput.trim()) return;
    setAnalyzing(true);
    setAiMode("loading");
    setParsedGoal(null);
    setError(null);

    // If user is not authenticated, we do a lightweight client-side preview
    // (real parse requires auth — we'll redirect on mission creation)
    if (!isAuth) {
      // Simulate analysis for unauthenticated users
      await new Promise((r) => setTimeout(r, 1200));
      const preview: GoalParseResponse = {
        goal_category: detectCategory(goalInput),
        goal_title: detectTitle(goalInput),
        destination: detectDestination(goalInput),
        target_amount: detectAmount(goalInput),
        currency: "INR",
        deadline: null,
        timeline_text: detectTimeline(goalInput),
        description: goalInput.slice(0, 150),
        confidence: 0.8,
        needs_clarification: false,
        clarification_questions: [],
      };
      setParsedGoal(preview);
      setAiMode("done");
      setAnalyzing(false);
      return;
    }

    try {
      const result = await parseGoal(goalInput);
      setParsedGoal(result);
      setAiMode("done");
    } catch {
      setError("Could not connect to AI service. Please try again.");
      setAiMode("idle");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleStartMission = () => {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("finpath_initial_goal", goalInput);
      if (parsedGoal) {
        sessionStorage.setItem("finpath_parsed_goal", JSON.stringify(parsedGoal));
      }
    }
    if (isAuth) {
      router.push(`/mission/new?text=${encodeURIComponent(goalInput)}`);
    } else {
      router.push(`/register?redirect=/mission/new&text=${encodeURIComponent(goalInput)}`);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}>
      {/* Navigation */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "14px 40px", borderBottom: "1px solid #E8F0FE",
        position: "sticky", top: 0, background: "rgba(255,255,255,0.97)",
        backdropFilter: "blur(12px)", zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: "linear-gradient(135deg, #003D99 0%, #0057D9 60%, #00AEEF 100%)",
            borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 12px rgba(0,87,217,0.2)",
          }}>
            <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>F</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 800, color: "#102A43", letterSpacing: "-0.02em" }}>
            FinPath <span style={{
              fontSize: 10, fontWeight: 700, background: "#E8F0FE", color: "#0057D9",
              padding: "2px 6px", borderRadius: 4, verticalAlign: "middle",
            }}>AI</span>
          </span>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {isAuth ? (
            <Link href="/dashboard" style={{
              padding: "8px 20px", background: "#0057D9", color: "#fff",
              borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none",
            }}>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" style={{ color: "#52606D", fontWeight: 500, fontSize: 14, textDecoration: "none" }}>
                Sign In
              </Link>
              <Link href="/register" style={{
                padding: "8px 20px", background: "#0057D9", color: "#fff",
                borderRadius: 8, fontWeight: 600, fontSize: 14, textDecoration: "none",
              }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px 48px", textAlign: "center" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#E8F0FE", border: "1px solid #C7D7F5", borderRadius: 20,
          padding: "6px 16px", marginBottom: 28,
        }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0057D9" }}>
            Goal-first financial journey platform
          </span>
        </div>

        <h1 style={{
          fontSize: "clamp(32px,5vw,52px)", fontWeight: 800,
          color: "#102A43", lineHeight: 1.15, marginBottom: 20, letterSpacing: "-0.03em",
        }}>
          Turn your financial goal<br />
          <span style={{ color: "#0057D9" }}>into a clear journey</span>
        </h1>

        <p style={{ fontSize: 18, color: "#52606D", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 48px" }}>
          FinPath AI understands your goal, organizes your financial information, and guides you through every step needed to move forward.
        </p>

        {/* Goal Input Card */}
        <div style={{
          background: "#fff", border: "1px solid #D9E2EC", borderRadius: 16,
          padding: "28px", boxShadow: "0 4px 32px rgba(0,87,217,0.07)", textAlign: "left",
        }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#52606D", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            What is your financial goal?
          </p>
          <textarea
            value={goalInput}
            onChange={(e) => { setGoalInput(e.target.value); setParsedGoal(null); setAiMode("idle"); }}
            placeholder="Example: I want to study in Germany next year with ₹12 lakh…"
            rows={3}
            style={{
              width: "100%", border: "1.5px solid #D9E2EC", borderRadius: 10,
              padding: "14px 16px", fontSize: 16, color: "#102A43",
              background: "#F5F8FC", resize: "none", outline: "none",
              boxSizing: "border-box", lineHeight: 1.6, fontFamily: "inherit",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "#0057D9")}
            onBlur={(e) => (e.target.style.borderColor = "#D9E2EC")}
          />

          {/* Sample prompts */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
            {SAMPLE_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => { setGoalInput(p); setParsedGoal(null); setAiMode("idle"); }}
                style={{
                  padding: "5px 12px", border: "1px solid #D9E2EC", borderRadius: 20,
                  fontSize: 12, color: "#52606D", background: "#F5F8FC",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {p.slice(0, 40)}…
              </button>
            ))}
          </div>

          <button
            onClick={handleAnalyze}
            disabled={analyzing || !goalInput.trim()}
            style={{
              marginTop: 16, width: "100%", padding: "14px 0",
              background: analyzing ? "#7EB3F5" : "#0057D9",
              color: "#fff", borderRadius: 10, fontWeight: 700,
              fontSize: 15, border: "none", cursor: analyzing ? "not-allowed" : "pointer",
              transition: "background 0.2s", fontFamily: "inherit",
            }}
          >
            {analyzing ? "Analysing your goal…" : "Analyse My Goal"}
          </button>

          {error && (
            <p style={{ color: "#D64545", fontSize: 13, marginTop: 10, textAlign: "center" }}>{error}</p>
          )}

          {/* Parsed Result */}
          {aiMode === "done" && parsedGoal && (
            <div style={{ marginTop: 20, padding: "20px", background: "#F5F8FC", borderRadius: 12, border: "1px solid #D9E2EC" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <span style={{ color: "#16803C", fontSize: 16 }}>✓</span>
                <span style={{ fontWeight: 700, color: "#102A43", fontSize: 15 }}>Goal understood</span>
                {parsedGoal.goal_category && (
                  <span style={{
                    marginLeft: "auto", padding: "3px 10px", background: "#E8F0FE",
                    color: "#0057D9", borderRadius: 12, fontSize: 12, fontWeight: 600,
                  }}>
                    {CATEGORY_ICONS[parsedGoal.goal_category]} {parsedGoal.goal_category}
                  </span>
                )}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {parsedGoal.goal_title && (
                  <InfoRow label="Goal" value={parsedGoal.goal_title} />
                )}
                {parsedGoal.target_amount && (
                  <InfoRow label="Target Amount" value={`₹${parsedGoal.target_amount.toLocaleString("en-IN")}`} />
                )}
                {parsedGoal.timeline_text && (
                  <InfoRow label="Timeline" value={parsedGoal.timeline_text} />
                )}
                {parsedGoal.destination && (
                  <InfoRow label="Destination" value={parsedGoal.destination} />
                )}
              </div>

              {parsedGoal.needs_clarification && parsedGoal.clarification_questions.length > 0 && (
                <div style={{ marginTop: 14, padding: "12px", background: "#FFF8ED", borderRadius: 8, border: "1px solid #F5D9A8" }}>
                  <p style={{ fontSize: 13, color: "#D9822B", fontWeight: 600, marginBottom: 6 }}>Needs clarification:</p>
                  {parsedGoal.clarification_questions.map((q, i) => (
                    <p key={i} style={{ fontSize: 13, color: "#52606D" }}>• {q}</p>
                  ))}
                </div>
              )}

              <button
                onClick={handleStartMission}
                style={{
                  marginTop: 16, width: "100%", padding: "13px 0",
                  background: "#16803C", color: "#fff",
                  borderRadius: 10, fontWeight: 700, fontSize: 15,
                  border: "none", cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Create Financial Mission →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section style={{ background: "#F5F8FC", padding: "64px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, color: "#102A43", marginBottom: 8 }}>
            How FinPath Works
          </h2>
          <p style={{ textAlign: "center", color: "#52606D", marginBottom: 48 }}>
            A structured 7-stage journey from goal to completion
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
            {[
              { n: "1", title: "Goal Definition", desc: "Describe your financial goal in plain language" },
              { n: "2", title: "Financial Profile", desc: "Share your income, savings, and EMI details" },
              { n: "3", title: "Document Upload", desc: "Upload identity, bank, and income documents" },
              { n: "4", title: "Readiness Score", desc: "Get a transparent, deterministic readiness score" },
              { n: "5", title: "Financial Options", desc: "Review products suited to your mission" },
              { n: "6", title: "Preparation", desc: "Complete your application with guided steps" },
              { n: "7", title: "Completion", desc: "Mission achieved — your financial journey is complete" },
            ].map((step) => (
              <div key={step.n} style={{
                background: "#fff", borderRadius: 12, padding: "20px",
                border: "1px solid #D9E2EC", boxShadow: "0 2px 8px rgba(0,87,217,0.04)",
              }}>
                <div style={{
                  width: 32, height: 32, background: "#0057D9", color: "#fff",
                  borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 14, marginBottom: 12,
                }}>
                  {step.n}
                </div>
                <h3 style={{ fontWeight: 700, color: "#102A43", fontSize: 15, marginBottom: 6 }}>{step.title}</h3>
                <p style={{ color: "#52606D", fontSize: 13, lineHeight: 1.5 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "64px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#102A43", marginBottom: 16 }}>
          Ready to start your financial journey?
        </h2>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={isAuth ? "/dashboard" : "/register"} style={{
            padding: "14px 32px", background: "#0057D9", color: "#fff",
            borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none",
          }}>
            {isAuth ? "Go to Dashboard" : "Start Free"}
          </Link>
          <Link href="/demo" style={{
            padding: "14px 32px", background: "#F5F8FC", color: "#0057D9",
            borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none",
            border: "1.5px solid #0057D9",
          }}>
            Try Demo
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #D9E2EC", padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12,
      }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#102A43" }}>FinPath AI</span>
        <span style={{ fontSize: 13, color: "#52606D" }}>
          © 2026 FinPath AI. Financial journey platform.
        </span>
      </footer>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ padding: "10px 12px", background: "#fff", borderRadius: 8, border: "1px solid #E8F0FE" }}>
      <p style={{ fontSize: 11, color: "#52606D", fontWeight: 600, marginBottom: 2, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
      <p style={{ fontSize: 14, color: "#102A43", fontWeight: 700 }}>{value}</p>
    </div>
  );
}

// Lightweight client-side fallbacks for unauthenticated preview
function detectCategory(text: string): string {
  const t = text.toLowerCase();
  if (/study|education|university|college|degree/.test(t)) return "education";
  if (/house|home|flat|apartment/.test(t)) return "home";
  if (/car|vehicle|bike/.test(t)) return "vehicle";
  if (/business|startup/.test(t)) return "business";
  if (/emergency|fund/.test(t)) return "emergency";
  return "other";
}
function detectTitle(text: string): string {
  const cat = detectCategory(text);
  const titles: Record<string, string> = {
    education: "Education Goal",
    home: "Home Purchase",
    vehicle: "Vehicle Purchase",
    business: "Business Goal",
    emergency: "Emergency Fund",
    other: "Financial Goal",
  };
  return titles[cat] || "Financial Goal";
}
function detectDestination(text: string): string | null {
  const countries = ["germany", "usa", "uk", "canada", "australia", "france", "singapore"];
  const t = text.toLowerCase();
  for (const c of countries) if (t.includes(c)) return c.charAt(0).toUpperCase() + c.slice(1);
  return null;
}
function detectAmount(text: string): number | null {
  const lakh = text.match(/(\d+(?:\.\d+)?)\s*lakh/i);
  if (lakh) return parseFloat(lakh[1]) * 100000;
  const crore = text.match(/(\d+(?:\.\d+)?)\s*crore/i);
  if (crore) return parseFloat(crore[1]) * 10000000;
  return null;
}
function detectTimeline(text: string): string | null {
  if (/next year/i.test(text)) return "Next year";
  if (/this year/i.test(text)) return "This year";
  if (/6 months/i.test(text)) return "6 months";
  if (/(\d+)\s*year/i.test(text)) return text.match(/(\d+)\s*year/i)![0];
  return null;
}
