"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/services";
import { useAuthStore } from "@/store/auth";

export default function LoginPage() {
  const router = useRouter();
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      setUser(data.user, data.access_token);
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail
        || "Login failed. Please check your email and password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#f8f9fc", padding: "24px"
    }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 38, height: 38, background: "linear-gradient(135deg, #002e6e 0%, #0052cc 60%, #00baf2 100%)",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 2px 10px rgba(0, 82, 204, 0.25)"
            }}>
              <span style={{ color: "#fff", fontSize: 18, fontWeight: 800 }}>F</span>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#002e6e", letterSpacing: "-0.02em" }}>FinPath AI</span>
          </Link>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#002e6e", marginTop: 24, marginBottom: 6 }}>
            Welcome back
          </h1>
          <p style={{ color: "#475569", fontSize: 14 }}>Sign in to continue your financial journey</p>
        </div>

        {/* Card */}
        <div className="card">
          {error && (
            <div className="alert alert-error" style={{ marginBottom: 20 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label htmlFor="email" className="label">Email address</label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label htmlFor="password" className="label">Password</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "12px" }}
              disabled={loading}
            >
              {loading ? <span className="spinner" /> : "Sign In"}
            </button>
          </form>

          <hr className="divider" />

          <p style={{ textAlign: "center", fontSize: 14, color: "#6b7280" }}>
            Don&apos;t have an account?{" "}
            <Link href="/register" style={{ color: "#1d4ed8", fontWeight: 500, textDecoration: "none" }}>
              Create one
            </Link>
          </p>
        </div>

        <p style={{ textAlign: "center", marginTop: 20, fontSize: 13, color: "#9ca3af" }}>
          Want to try it first?{" "}
          <Link href="/demo" style={{ color: "#1d4ed8", textDecoration: "none" }}>
            View demo
          </Link>
        </p>
      </div>
    </div>
  );
}
