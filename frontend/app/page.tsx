"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/utils";

const DEMO_GOALS = [
  "I want to study in Germany next year and need ₹12 lakh.",
  "We're planning to buy a home in Pune within 3 years.",
  "I need ₹5 lakh for my daughter's medical treatment.",
  "Starting a business and need ₹20 lakh in seed capital.",
];

export default function LandingPage() {
  const [goalIndex, setGoalIndex] = useState(0);
  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(true);
  const [charIndex, setCharIndex] = useState(0);
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isAuthenticated());
  }, []);

  // Typewriter effect
  useEffect(() => {
    const currentGoal = DEMO_GOALS[goalIndex];

    if (isTyping) {
      if (charIndex < currentGoal.length) {
        const timer = setTimeout(() => {
          setDisplayText(currentGoal.slice(0, charIndex + 1));
          setCharIndex(charIndex + 1);
        }, 35);
        return () => clearTimeout(timer);
      } else {
        const timer = setTimeout(() => setIsTyping(false), 2500);
        return () => clearTimeout(timer);
      }
    } else {
      if (charIndex > 0) {
        const timer = setTimeout(() => {
          setDisplayText(currentGoal.slice(0, charIndex - 1));
          setCharIndex(charIndex - 1);
        }, 20);
        return () => clearTimeout(timer);
      } else {
        setGoalIndex((prev) => (prev + 1) % DEMO_GOALS.length);
        setIsTyping(true);
      }
    }
  }, [charIndex, isTyping, goalIndex]);

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff" }}>
      {/* Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 40px", borderBottom: "1px solid #f3f4f6",
        position: "sticky", top: 0, background: "#ffffff", zIndex: 50
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: "#1d4ed8",
            borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>F</span>
          </div>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#111827" }}>FinPath AI</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {isAuth ? (
            <Link href="/dashboard" className="btn-primary" style={{ fontSize: 14 }}>
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="btn-secondary" style={{ fontSize: 14 }}>
                Sign in
              </Link>
              <Link href="/register" className="btn-primary" style={{ fontSize: 14 }}>
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: 760, margin: "0 auto",
        padding: "100px 40px 80px",
        textAlign: "center"
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "#dbeafe", color: "#1d4ed8",
          padding: "6px 16px", borderRadius: 100,
          fontSize: 13, fontWeight: 500, marginBottom: 32
        }}>
          <span>Phase 1</span>
          <span style={{ opacity: 0.5 }}>·</span>
          <span>Financial Journey Platform</span>
        </div>

        <h1 style={{
          fontSize: 52, fontWeight: 700, lineHeight: 1.15,
          color: "#111827", marginBottom: 24,
          letterSpacing: -1
        }}>
          Your financial journey<br />
          <span style={{ color: "#1d4ed8" }}>starts with your goal.</span>
        </h1>

        <p style={{
          fontSize: 18, color: "#6b7280", lineHeight: 1.7,
          marginBottom: 48, maxWidth: 560, margin: "0 auto 48px"
        }}>
          Tell FinPath what you're trying to achieve. We'll help organize your financial journey around it — from goal to documents to profile.
        </p>

        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href={isAuth ? "/dashboard" : "/register"} className="btn-primary" style={{ padding: "14px 28px", fontSize: 15 }}>
            Start Your Financial Journey
          </Link>
          <Link href="/demo" className="btn-secondary" style={{ padding: "14px 28px", fontSize: 15 }}>
            Explore Demo
          </Link>
        </div>
      </section>

      {/* Typewriter Demo */}
      <section style={{ background: "#f8f9fc", padding: "60px 40px" }}>
        <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
          <p style={{ fontSize: 13, color: "#9ca3af", marginBottom: 20, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            People tell FinPath things like
          </p>
          <div style={{
            background: "#ffffff", border: "1px solid #e5e7eb",
            borderRadius: 12, padding: "28px 32px",
            minHeight: 84, display: "flex", alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)"
          }}>
            <p style={{ fontSize: 20, color: "#374151", lineHeight: 1.5, fontStyle: "italic" }}>
              &ldquo;{displayText}<span style={{ opacity: 0.5, borderRight: "2px solid #374151", marginLeft: 1 }}>&nbsp;</span>&rdquo;
            </p>
          </div>
          <p style={{ fontSize: 14, color: "#6b7280", marginTop: 16 }}>
            And FinPath turns that into a structured Financial Mission.
          </p>
        </div>
      </section>

      {/* How it Works */}
      <section style={{ padding: "80px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 30, fontWeight: 700, textAlign: "center", marginBottom: 12, color: "#111827" }}>
            How FinPath works
          </h2>
          <p style={{ textAlign: "center", color: "#6b7280", marginBottom: 56, fontSize: 16 }}>
            A simple, transparent process from goal to financial profile.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24 }}>
            {[
              { step: "01", icon: "💬", title: "Tell us your goal", desc: "Describe what you're trying to achieve in plain language." },
              { step: "02", icon: "🧠", title: "AI understands it", desc: "FinPath extracts key information and creates a Financial Mission." },
              { step: "03", icon: "📄", title: "Upload documents", desc: "Add your salary slip, bank statement, or other documents." },
              { step: "04", icon: "📊", title: "See your profile", desc: "Review extracted information and track your progress." },
            ].map((item) => (
              <div key={item.step} className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
                <div style={{ fontSize: 36, marginBottom: 16 }}>{item.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#1d4ed8", marginBottom: 8, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                  Step {item.step}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: "#111827", marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section style={{ background: "#f8f9fc", padding: "60px 40px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
            Built for trust
          </h2>
          <p style={{ color: "#6b7280", fontSize: 15, lineHeight: 1.7, marginBottom: 40 }}>
            FinPath Phase 1 is a foundation. We organize your financial information — we never make financial decisions for you. Every piece of extracted data goes through your review before it becomes part of your profile.
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: 32, flexWrap: "wrap" }}>
            {[
              { icon: "🔒", label: "Your data is yours" },
              { icon: "👁", label: "Full review before saving" },
              { icon: "❌", label: "No financial decisions" },
              { icon: "🧹", label: "No fabricated data" },
            ].map((item) => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 8, color: "#374151", fontSize: 14 }}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#111827", marginBottom: 16 }}>
          Ready to start your financial journey?
        </h2>
        <p style={{ color: "#6b7280", fontSize: 16, marginBottom: 36 }}>
          It takes less than 2 minutes to create your first Financial Mission.
        </p>
        <Link href={isAuth ? "/dashboard" : "/register"} className="btn-primary" style={{ padding: "14px 32px", fontSize: 15 }}>
          Get Started Free
        </Link>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: "1px solid #f3f4f6", padding: "24px 40px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
        color: "#9ca3af", fontSize: 13
      }}>
        <span>© 2026 FinPath AI — Phase 1</span>
        <span>A goal-first financial journey platform.</span>
      </footer>
    </div>
  );
}
