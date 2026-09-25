"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth";
import { useEffect, useState, useRef } from "react";
import { getNotificationSummary, markNotificationRead, markAllNotificationsRead } from "@/lib/services";
import type { Notification, NotificationSummary } from "@/types";

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
  { label: "Profile", href: "/profile", id: "nav-profile", icon: "👤" },
  { label: "AI Assistant", href: "/ai", id: "nav-ai", icon: "🤖" },
  { label: "Progress", href: "/progress", id: "nav-progress", icon: "📈" },
];

const MOBILE_NAV_ITEMS = [
  { label: "Home", href: "/dashboard", icon: "📊" },
  { label: "Missions", href: "/missions", icon: "🎯" },
  { label: "Documents", href: "/documents", icon: "📁" },
  { label: "AI", href: "/ai", icon: "🤖" },
  { label: "Profile", href: "/profile", icon: "👤" },
];

const NOTIF_TYPE_COLORS: Record<string, string> = {
  document_review: "#D9822B",
  profile_incomplete: "#0057D9",
  milestone: "#16803C",
  deadline: "#D64545",
  action: "#0057D9",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, initialize } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifSummary, setNotifSummary] = useState<NotificationSummary | null>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (user) loadNotifications();
  }, [user]);

  async function loadNotifications() {
    try {
      const summary = await getNotificationSummary();
      setNotifSummary(summary);
    } catch {
      // Silently fail — notifications are non-critical
    }
  }

  async function handleMarkRead(id: number) {
    try {
      await markNotificationRead(id);
      await loadNotifications();
    } catch {}
  }

  async function handleMarkAllRead() {
    try {
      await markAllNotificationsRead();
      await loadNotifications();
    } catch {}
  }

  // Click outside to close notification panel
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const unreadCount = notifSummary?.unread_count ?? 0;

  return (
    <>
      {/* Desktop Top Nav */}
      <nav style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 28px", height: 60,
        background: "#fff", borderBottom: "1px solid #D9E2EC",
        position: "sticky", top: 0, zIndex: 100,
        boxShadow: "0 1px 4px rgba(0,87,217,0.06)",
      }}>
        {/* Logo */}
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div style={{
            width: 34, height: 34,
            background: "linear-gradient(135deg, #003D99 0%, #0057D9 60%, #00AEEF 100%)",
            borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 10px rgba(0,87,217,0.2)",
          }}>
            <span style={{ color: "#fff", fontSize: 17, fontWeight: 800 }}>F</span>
          </div>
          <span style={{ fontSize: 17, fontWeight: 800, color: "#102A43", letterSpacing: "-0.02em" }}>
            FinPath{" "}
            <span style={{
              fontSize: 10, fontWeight: 700, background: "#E8F0FE", color: "#0057D9",
              padding: "2px 6px", borderRadius: 4,
            }}>AI</span>
          </span>
        </Link>

        {/* Nav Links */}
        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                id={item.id}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "7px 14px", borderRadius: 8,
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  color: isActive ? "#0057D9" : "#52606D",
                  background: isActive ? "#E8F0FE" : "transparent",
                  textDecoration: "none", transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: 14 }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Right: Notifications + User */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Notification bell */}
          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              onClick={() => { setShowNotifications(!showNotifications); if (!showNotifications) loadNotifications(); }}
              style={{
                width: 36, height: 36, borderRadius: 8, border: "1px solid #D9E2EC",
                background: "#F5F8FC", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                position: "relative",
              }}
            >
              <span style={{ fontSize: 16 }}>🔔</span>
              {unreadCount > 0 && (
                <span style={{
                  position: "absolute", top: -4, right: -4,
                  background: "#D64545", color: "#fff",
                  borderRadius: "50%", width: 18, height: 18,
                  fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  border: "2px solid #fff",
                }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications dropdown */}
            {showNotifications && (
              <div style={{
                position: "absolute", top: 44, right: 0, width: 340,
                background: "#fff", border: "1px solid #D9E2EC", borderRadius: 14,
                boxShadow: "0 8px 32px rgba(0,87,217,0.12)", zIndex: 200, overflow: "hidden",
              }}>
                <div style={{
                  padding: "14px 16px", borderBottom: "1px solid #E8F0FE",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#102A43" }}>Notifications</span>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      style={{
                        fontSize: 12, color: "#0057D9", background: "none",
                        border: "none", cursor: "pointer", fontWeight: 600,
                      }}
                    >
                      Mark all read
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: 340, overflowY: "auto" }}>
                  {!notifSummary || notifSummary.notifications.length === 0 ? (
                    <div style={{ padding: "24px", textAlign: "center", color: "#52606D", fontSize: 13 }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifSummary.notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => { handleMarkRead(n.id); setShowNotifications(false); if (n.related_resource) router.push(`/${n.related_resource}s`); }}
                        style={{
                          padding: "12px 16px", borderBottom: "1px solid #F0F4F8",
                          cursor: "pointer", background: n.is_read ? "#fff" : "#F5F8FC",
                          display: "flex", gap: 10, alignItems: "flex-start",
                        }}
                      >
                        <div style={{
                          width: 8, height: 8, borderRadius: "50%", flexShrink: 0, marginTop: 4,
                          background: n.is_read ? "transparent" : (NOTIF_TYPE_COLORS[n.type] || "#0057D9"),
                        }} />
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, fontWeight: n.is_read ? 500 : 700, color: "#102A43", marginBottom: 2 }}>
                            {n.title}
                          </p>
                          <p style={{ fontSize: 12, color: "#52606D", lineHeight: 1.4 }}>{n.message}</p>
                          <p style={{ fontSize: 11, color: "#A0AEC0", marginTop: 4 }}>{timeAgo(n.created_at)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div style={{ padding: "10px 16px", borderTop: "1px solid #E8F0FE" }}>
                  <Link href="/notifications" onClick={() => setShowNotifications(false)} style={{
                    fontSize: 12, color: "#0057D9", textDecoration: "none", fontWeight: 600,
                  }}>
                    View all notifications →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* User info */}
          {user && (
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: "50%",
                background: "linear-gradient(135deg, #0057D9, #00AEEF)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#fff", fontWeight: 800, fontSize: 14,
              }}>
                {user.full_name?.charAt(0).toUpperCase()}
              </div>
              <div style={{ lineHeight: 1.2 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#102A43" }}>{user.full_name}</p>
                <button
                  onClick={handleLogout}
                  style={{
                    fontSize: 11, color: "#52606D", background: "none",
                    border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit",
                  }}
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Mobile Bottom Nav */}
      <nav style={{
        display: "none",
        position: "fixed", bottom: 0, left: 0, right: 0,
        background: "#fff", borderTop: "1px solid #D9E2EC",
        zIndex: 100, padding: "6px 0 calc(6px + env(safe-area-inset-bottom))",
      }}
        id="mobile-nav"
      >
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          {MOBILE_NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  gap: 2, padding: "6px 12px", textDecoration: "none",
                  color: isActive ? "#0057D9" : "#52606D",
                }}
              >
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 10, fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <style>{`
        @media (max-width: 768px) {
          nav:first-of-type { display: none !important; }
          #mobile-nav { display: block !important; }
        }
      `}</style>
    </>
  );
}
