"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState, useRef } from "react";

interface NavItem {
  label: string;
  href: string;
  id: string;
  icon: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", id: "nav-dashboard", icon: "📊" },
  { label: "Missions", href: "/missions", id: "nav-missions", icon: "🎯" },
  { label: "Documents", href: "/documents", id: "nav-documents", icon: "📁" },
  { label: "Financial Profile", href: "/profile", id: "nav-profile", icon: "👤" },
  { label: "AI Assistant", href: "/ai", id: "nav-ai", icon: "🤖" },
  { label: "Progress", href: "/progress", id: "nav-progress", icon: "📈" },
];

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: "🏠" },
  { label: "Missions", href: "/missions", icon: "🎯" },
  { label: "Documents", href: "/documents", icon: "📁" },
  { label: "AI", href: "/ai", icon: "🤖" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

const NOTIFICATIONS = [
  {
    id: 1,
    title: "Document Verification Required",
    desc: "Your salary slip was parsed. Please verify the extracted fields to confirm accuracy.",
    time: "10m ago",
    unread: true,
    href: "/documents",
    type: "warning",
  },
  {
    id: 2,
    title: "Profile 82% Complete",
    desc: "Add monthly investment details to reach 100% and unlock lower loan rates.",
    time: "2h ago",
    unread: true,
    href: "/profile",
    type: "info",
  },
  {
    id: 3,
    title: "Mission Milestone Ready",
    desc: "Germany Education Mission readiness is at 73%. Funding options are calculating.",
    time: "1d ago",
    unread: false,
    href: "/progress",
    type: "success",
  },
];

export default function AppNav() {
  const pathname = usePathname();
  const { user, logout, initialize } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Click outside listener for notifications
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => n.unread).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
  };

  return (
    <>
      {/* Top Navbar */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          height: 64,
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          position: "sticky",
          top: 0,
          zIndex: 50,
          boxShadow: "0 1px 4px rgba(0, 46, 110, 0.03)",
        }}
      >
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link
            href="/dashboard"
            style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                background: "linear-gradient(135deg, #002e6e 0%, #0052cc 60%, #00baf2 100%)",
                borderRadius: 10,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 8px rgba(0, 82, 204, 0.25)",
              }}
            >
              <span style={{ color: "#ffffff", fontSize: 16, fontWeight: 800 }}>F</span>
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 17, fontWeight: 800, color: "#002e6e", letterSpacing: "-0.02em" }}>
                  FinPath
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    background: "#e0f2fe",
                    color: "#0369a1",
                    padding: "1px 6px",
                    borderRadius: 4,
                  }}
                >
                  AI
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="desktop-nav-links" style={{ display: "flex", alignItems: "center", gap: 4 }}>
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href || (item.href === "/missions" && pathname.startsWith("/mission"));
              return (
                <Link
                  key={item.id}
                  id={item.id}
                  href={item.href}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    padding: "7px 14px",
                    borderRadius: 8,
                    fontSize: 13.5,
                    fontWeight: 600,
                    textDecoration: "none",
                    color: isActive ? "#0052cc" : "#475569",
                    background: isActive ? "#ebf4ff" : "transparent",
                    transition: "all 0.15s ease",
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Actions: Notifications & User */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {/* Notifications Dropdown */}
          <div style={{ position: "relative" }} ref={notifRef}>
            <button
              id="notif-btn"
              className="notif-bell"
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && <span className="notif-badge" />}
            </button>

            {showNotifications && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: 50,
                  width: 340,
                  background: "#ffffff",
                  borderRadius: 14,
                  boxShadow: "0 12px 35px rgba(0, 46, 110, 0.15), 0 2px 8px rgba(0,0,0,0.06)",
                  border: "1px solid #e2e8f0",
                  zIndex: 100,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "14px 16px",
                    borderBottom: "1px solid #f1f5f9",
                    background: "#f8fafc",
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#002e6e" }}>
                    Notifications ({unreadCount} new)
                  </span>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      style={{
                        background: "none",
                        border: "none",
                        fontSize: 12,
                        color: "#0052cc",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div style={{ maxHeight: 320, overflowY: "auto" }}>
                  {notifications.map((notif) => (
                    <Link
                      key={notif.id}
                      href={notif.href}
                      onClick={() => setShowNotifications(false)}
                      style={{
                        display: "block",
                        padding: "12px 16px",
                        borderBottom: "1px solid #f1f5f9",
                        textDecoration: "none",
                        background: notif.unread ? "#f0f7ff" : "#ffffff",
                        transition: "background 0.15s ease",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#0f172a" }}>
                          {notif.title}
                        </span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>{notif.time}</span>
                      </div>
                      <p style={{ fontSize: 12, color: "#475569", margin: 0, lineHeight: 1.4 }}>
                        {notif.desc}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Menu */}
          {user ? (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: "#ebf4ff",
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 700,
                  color: "#0052cc",
                  border: "1px solid #c8e0ff",
                }}
              >
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
              </div>
              <span style={{ fontSize: 13.5, color: "#1e293b", fontWeight: 600 }} className="desktop-nav-links">
                {user.full_name ? user.full_name.split(" ")[0] : "Account"}
              </span>
              <button
                id="nav-logout"
                onClick={logout}
                className="btn-ghost"
                style={{ fontSize: 12.5, padding: "6px 10px" }}
              >
                Sign out
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8 }}>
              <Link href="/login" className="btn-secondary" style={{ padding: "7px 14px", fontSize: 13 }}>
                Sign in
              </Link>
              <Link href="/register" className="btn-primary" style={{ padding: "7px 16px", fontSize: 13 }}>
                Get Started
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Navigation */}
      <div className="mobile-nav">
        {MOBILE_NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || (item.href === "/missions" && pathname.startsWith("/mission"));
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`mobile-nav-item ${isActive ? "active" : ""}`}
            >
              <span style={{ fontSize: 18 }}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
