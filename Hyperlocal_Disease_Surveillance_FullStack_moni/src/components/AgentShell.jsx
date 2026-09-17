import { useEffect, useRef, useState } from "react";
import {
  Bell,
  ChevronDown,
  ClipboardList,
  FileText,
  History,
  LayoutDashboard,
  LogOut,
  Menu,
  ShieldAlert,
  Sun,
  X,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./AgentShell.css";

const ICONS = {
  dashboard: LayoutDashboard,
  report: FileText,
  emerging: ShieldAlert,
  history: History,
  notifications: Bell,
};

export default function AgentShell({
  tabs = [],
  activeTab,
  onTabChange,
  onExit,
  notificationCount = 0,
  children,
}) {
  const { session } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const fullName = session?.full_name || session?.username || "Agent";
  const talukName = session?.taluk_name || "Assigned Taluk";

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setMobileOpen(false);
        setProfileOpen(false);
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const selectTab = (key) => {
    onTabChange?.(key);
    setMobileOpen(false);
  };

  const handleLogout = () => {
    setProfileOpen(false);
    setMobileOpen(false);
    onExit?.();
  };

  return (
    <div className="agent-shell">
      <header className="agent-header">
        <div className="agent-brand">
          <div className="agent-brand-mark" aria-hidden="true">
            <span className="agent-brand-cross">+</span>
          </div>
          <div className="agent-brand-copy">
            <div className="agent-brand-name">KARNA SURAKSHA</div>
            <div className="agent-brand-subtitle">Hyperlocal Disease Surveillance</div>
          </div>
        </div>

        <div className="agent-header-right">
          <button
            type="button"
            className="agent-mobile-menu"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Open agent navigation"
          >
            {mobileOpen ? <X size={21} /> : <Menu size={21} />}
          </button>

          <button
            type="button"
            className="agent-header-icon-button"
            onClick={() => selectTab("notifications")}
            aria-label="Open notifications"
          >
            <Bell size={21} />
            {notificationCount > 0 && (
              <span className="agent-notification-badge">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <div className="agent-theme-icon" aria-hidden="true">
            <Sun size={20} />
          </div>

          <div className="agent-profile" ref={profileRef}>
            <button
              type="button"
              className="agent-profile-button"
              onClick={() => setProfileOpen((value) => !value)}
              aria-expanded={profileOpen}
            >
              <div className="agent-avatar" aria-hidden="true">
                <span>{fullName.slice(0, 1).toUpperCase()}</span>
              </div>
              <div className="agent-profile-copy">
                <strong>{fullName}</strong>
                <span>Field Agent</span>
              </div>
              <ChevronDown
                size={17}
                className={profileOpen ? "agent-chevron-open" : ""}
              />
            </button>

            {profileOpen && (
              <div className="agent-profile-menu">
                <div className="agent-profile-menu-heading">
                  <strong>{fullName}</strong>
                  <span>{session?.username || "Agent account"}</span>
                </div>
                <div className="agent-profile-menu-location">
                  <span>Assigned Taluk</span>
                  <strong>{talukName}</strong>
                </div>
                <button type="button" onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <aside className={`agent-sidebar ${mobileOpen ? "agent-sidebar-open" : ""}`}>
        <nav className="agent-nav" aria-label="Agent portal navigation">
          {tabs.map((tab) => {
            const Icon = tab.icon || ICONS[tab.key] || ClipboardList;
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                type="button"
                className={`agent-nav-item ${active ? "active" : ""}`}
                onClick={() => selectTab(tab.key)}
              >
                <Icon size={20} strokeWidth={2.2} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="agent-sidebar-illustration" aria-hidden="true">
          <div className="agent-mountain agent-mountain-one" />
          <div className="agent-mountain agent-mountain-two" />
          <div className="agent-tree agent-tree-one" />
          <div className="agent-tree agent-tree-two" />
          <div className="agent-tree agent-tree-three" />
        </div>

        <div className="agent-sidebar-message">
          <p>Healthy Communities</p>
          <p>Stronger Tomorrow</p>
        </div>
      </aside>

      {mobileOpen && (
        <button
          type="button"
          className="agent-mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <main className="agent-main">
        <div className="agent-main-inner">{children}</div>
      </main>
    </div>
  );
}
