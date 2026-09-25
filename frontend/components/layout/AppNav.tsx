"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useEffect } from "react";

interface NavItem {
  label: string;
  href: string;
  id: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", id: "nav-dashboard" },
  { label: "Missions", href: "/dashboard", id: "nav-missions" },
  { label: "Documents", href: "/dashboard#documents", id: "nav-documents" },
  { label: "Profile", href: "/profile", id: "nav-profile" },
];

export default function AppNav() {
  const pathname = usePathname();
  const { user, logout, initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <nav style={{
      display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "0 40px", height: 60,
      background: "#ffffff", borderBottom: "1px solid #f3f4f6",
      position: "sticky", top: 0, zIndex: 50
    }}>
      {/* Logo */}
      <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
        <div style={{
          width: 28, height: 28, background: "#1d4ed8",
          borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center"
        }}>
          <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>F</span>
        </div>
        <span style={{ fontSize: 16, fontWeight: 700, color: "#111827" }}>FinPath AI</span>
      </Link>

      {/* Nav Links */}
      <div style={{ display: "flex", gap: 4 }}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.id}
              id={item.id}
              href={item.href}
              style={{
                padding: "6px 14px",
                borderRadius: 6,
                fontSize: 14,
                fontWeight: 500,
                textDecoration: "none",
                color: isActive ? "#1d4ed8" : "#6b7280",
                background: isActive ? "#dbeafe" : "transparent",
                transition: "all 0.15s ease",
              }}
            >
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* User */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {user && (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 32, height: 32,
              background: "#dbeafe", borderRadius: "50%",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 600, color: "#1d4ed8"
            }}>
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>
              {user.full_name.split(" ")[0]}
            </span>
          </div>
        )}
        <button
          id="nav-logout"
          onClick={logout}
          className="btn-ghost"
          style={{ fontSize: 13, padding: "6px 12px" }}
        >
          Sign out
        </button>
      </div>
    </nav>
  );
}
