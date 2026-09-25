"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AppNav from "@/components/layout/AppNav";
import { chatAssistant } from "@/lib/services";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  actions?: string[];
  time: string;
}

const SUGGESTED_PROMPTS = [
  "What should I do next?",
  "What documents am I still missing?",
  "Why is my salary slip required?",
  "How complete is my financial profile?",
  "Explain my Germany education mission",
];

const INITIAL_MESSAGES: Message[] = [
  {
    id: "welcome-1",
    sender: "ai",
    text: "Hello! I am your FinPath AI financial journey assistant. I'm actively monitoring your **Study in Germany** mission (₹12,00,000 target). Ask me anything about required documents, readiness scores, or your next best financial steps.",
    actions: ["What should I do next?", "What documents are missing?", "Explain my mission"],
    time: "Just now",
  },
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!messageText) setInput("");
    setLoading(true);

    try {
      const res = await chatAssistant(textToSend);
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: "ai",
        text: res.reply,
        actions: res.suggested_actions,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      // Offline fallback
      let fallbackReply = "I am tracking your Study in Germany mission. Your next recommended action is to verify your salary slip in the Document Center.";
      if (textToSend.toLowerCase().includes("missing")) {
        fallbackReply = "Your Germany education mission currently requires:\n• Updated bank statement (Verified ✓)\n• Passport ID (Verified ✓)\n• Salary slip (Needs Review)\n• Offer letter (Needs Review)\n\nYour next recommended action is to verify your salary slip.";
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: "ai",
          text: fallbackReply,
          actions: ["Review Salary Slip", "View Documents", "Profile Check"],
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f4f6fb", display: "flex", flexDirection: "column" }}>
      <AppNav />

      <div style={{ flex: 1, maxWidth: 860, width: "100%", margin: "0 auto", padding: "24px 20px 80px", display: "flex", flexDirection: "column" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <div
            style={{
              width: 48,
              height: 48,
              background: "linear-gradient(135deg, #002e6e 0%, #0052cc 60%, #00baf2 100%)",
              borderRadius: 14,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 10px",
              boxShadow: "0 4px 14px rgba(0, 82, 204, 0.25)",
            }}
          >
            <span style={{ fontSize: 24 }}>🤖</span>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#002e6e", margin: "0 0 4px", letterSpacing: "-0.02em" }}>
            FinPath AI Assistant
          </h1>
          <p style={{ color: "#64748b", fontSize: 14, margin: 0 }}>
            Ask anything about your financial journey, required documents, or readiness steps.
          </p>
        </div>

        {/* Chat Container Card */}
        <div
          className="card"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            height: "64vh",
            minHeight: 460,
            padding: 0,
            overflow: "hidden",
            boxShadow: "0 8px 30px rgba(0, 46, 110, 0.06)",
            border: "1.5px solid #d9e2ec",
          }}
        >
          {/* Chat Messages Log */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "24px 20px",
              display: "flex",
              flexDirection: "column",
              gap: 16,
              background: "#fafcff",
            }}
          >
            {messages.map((m) => (
              <div
                key={m.id}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: m.sender === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "14px 18px",
                    borderRadius: m.sender === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background: m.sender === "user" ? "#0052cc" : "#ffffff",
                    color: m.sender === "user" ? "#ffffff" : "#0f172a",
                    border: m.sender === "user" ? "none" : "1px solid #e2e8f0",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                    fontSize: 14,
                    lineHeight: 1.6,
                    whiteSpace: "pre-line",
                  }}
                >
                  {m.text}
                </div>

                {/* Subtext info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    marginTop: 4,
                    fontSize: 11,
                    color: "#94a3b8",
                  }}
                >
                  <span>{m.sender === "user" ? "You" : "FinPath AI"}</span>
                  <span>·</span>
                  <span>{m.time}</span>
                </div>

                {/* Suggested Action Buttons if from AI */}
                {m.actions && m.actions.length > 0 && (
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
                    {m.actions.map((act) => (
                      <button
                        key={act}
                        onClick={() => handleSend(act)}
                        style={{
                          background: "#ebf4ff",
                          border: "1px solid #c8e0ff",
                          borderRadius: 8,
                          padding: "4px 10px",
                          fontSize: 12,
                          color: "#0052cc",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        ⚡ {act}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, color: "#64748b", fontSize: 13 }}>
                <div className="spinner" style={{ width: 18, height: 18 }} />
                <span>FinPath AI is analyzing your journey...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div
            style={{
              padding: "10px 16px",
              background: "#f1f5f9",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: 8,
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {SUGGESTED_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => handleSend(p)}
                style={{
                  background: "#ffffff",
                  border: "1px solid #cbd5e1",
                  borderRadius: 100,
                  padding: "5px 12px",
                  fontSize: 12,
                  color: "#334155",
                  fontWeight: 500,
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div
            style={{
              padding: "16px 20px",
              background: "#ffffff",
              borderTop: "1px solid #e2e8f0",
              display: "flex",
              gap: 12,
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
              placeholder="Ask anything about your journey..."
              className="input"
              style={{ flex: 1, padding: "12px 16px", borderRadius: 10 }}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn-primary"
              style={{ padding: "0 24px" }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
