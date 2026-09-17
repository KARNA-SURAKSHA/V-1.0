import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  Bell,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  History as HistoryIcon,
  Info,
  MapPin,
  Plus,
  RefreshCw,
  ShieldAlert,
} from "lucide-react";

import AgentShell from "../../components/AgentShell";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";
import "../../api/agentApi";
import "./AgentPortal.css";

import ReportForm from "./ReportForm";
import EmergingDiseaseReport from "./EmergingDiseaseReport";
import History from "./History";

const TABS = [
  { key: "dashboard", label: "Dashboard" },
  { key: "report", label: "Weekly Disease Report" },
  { key: "emerging", label: "Emerging Disease" },
  { key: "history", label: "Submission History" },
  { key: "notifications", label: "Notifications" },
];

const RISK_CLASS = {
  Low: "low",
  Moderate: "moderate",
  High: "high",
  Critical: "critical",
};

function getWeekDates() {
  const today = new Date();
  const date = new Date(today);
  const day = date.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;

  date.setDate(date.getDate() + diffToMonday);
  const monday = new Date(date);
  const sunday = new Date(date);
  sunday.setDate(monday.getDate() + 6);

  const format = (value, includeYear = false) =>
    value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      ...(includeYear ? { year: "numeric" } : {}),
    });

  return `${format(monday)} – ${format(sunday, true)}`;
}

function formatDate(dateValue) {
  if (!dateValue) return "—";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

function formatTime(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function notificationTone(type = "info") {
  const value = String(type).toLowerCase();
  if (value.includes("alert") || value.includes("warning")) return "alert";
  if (value.includes("success") || value.includes("verified")) return "success";
  return "info";
}

function NotificationIcon({ type }) {
  const tone = notificationTone(type);
  if (tone === "alert") return <AlertCircle size={18} />;
  if (tone === "success") return <CheckCircle2 size={18} />;
  return <Info size={18} />;
}

export default function AgentPortal({ onExit }) {
  const { session } = useAuth();

  const [tab, setTab] = useState("dashboard");
  const [showReportEditor, setShowReportEditor] = useState(false);
  const [reportMode, setReportMode] = useState(null);
  const [reportFormKey, setReportFormKey] = useState(0);

  const [status, setStatus] = useState(null);
  const [reports, setReports] = useState([]);
  const [dashboard, setDashboard] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadDashboardData = async (isRefresh = false) => {
    if (!session) return;

    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError("");

      const statusData = await api.getAgentStatus();
      const talukId = statusData?.taluk_id ?? session?.taluk_id;

      const requests = [
        Promise.resolve(statusData),
        api.getAgentHistory(),
      ];

      if (talukId) {
        requests.push(api.getDashboard(talukId));
        requests.push(api.getNotifications(talukId));
      }

      const [statusResult, historyResult, dashboardResult, notificationResult] =
        await Promise.all(requests);

      setStatus(statusResult);
      setReports(historyResult || []);
      setDashboard(dashboardResult || null);
      setNotifications(notificationResult || []);
    } catch (err) {
      setError(err.message || "Unable to load the Agent Portal.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadDashboardData();
    // The logged-in session determines the API scope.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.username]);

  const talukName = status?.taluk_name || session?.taluk_name || "Assigned Taluk";
  const districtName = status?.district_name || "Assigned District";
  const alreadySubmitted = Boolean(status?.already_submitted);
  const weekNumber = status?.current_week ? status.current_week % 100 : null;
  const cycleDates = getWeekDates();

  const latestSubmissionDate = status?.last_submitted_at
    ? formatDate(status.last_submitted_at)
    : reports.length
      ? formatDate(
          reports.reduce((latest, item) => {
            if (!latest) return item.created_at;
            return new Date(item.created_at) > new Date(latest)
              ? item.created_at
              : latest;
          }, null)
        )
      : null;

  const latestSubmissionTime = status?.last_submitted_at
    ? formatTime(status.last_submitted_at)
    : "";

  const totalThisMonth = useMemo(() => {
    const now = new Date();
    return reports.filter((report) => {
      const date = new Date(report.created_at);
      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    }).length;
  }, [reports]);

  const snapshot = useMemo(() => {
    const cards = Array.isArray(dashboard?.cards) ? dashboard.cards : [];
    const currentReports = Array.isArray(reports) ? reports : [];

    return cards.map((card) => {
      const matching = currentReports.find(
        (report) =>
          String(report.disease || "").trim().toLowerCase() ===
          String(card.disease || "").trim().toLowerCase()
      );

      return {
        ...card,
        suspected_cases:
          matching?.suspected_cases ?? card.suspected_cases ?? "—",
      };
    });
  }, [dashboard, reports]);

  const openReport = (mode) => {
    setTab("report");
    setReportMode(mode);
    setReportFormKey((value) => value + 1);
    setShowReportEditor(true);
  };

  const openWeeklyReport = () => {
    openReport(alreadySubmitted ? "edit" : "add");
  };

  const handleTabChange = (nextTab) => {
    setTab(nextTab);
    if (nextTab !== "report") {
      setShowReportEditor(false);
      setReportMode(null);
    }
  };

  const closeEditor = () => {
    setShowReportEditor(false);
    setReportMode(null);
    loadDashboardData(true);
  };

  if (!session) return null;

  return (
    <AgentShell
      tabs={TABS}
      activeTab={tab}
      onTabChange={handleTabChange}
      onExit={onExit}
      notificationCount={notifications.length}
    >
      {tab === "dashboard" && (
        <DashboardView
          session={session}
          status={status}
          talukName={talukName}
          districtName={districtName}
          weekNumber={weekNumber}
          cycleDates={cycleDates}
          alreadySubmitted={alreadySubmitted}
          loading={loading}
          refreshing={refreshing}
          error={error}
          latestSubmissionDate={latestSubmissionDate}
          latestSubmissionTime={latestSubmissionTime}
          totalThisMonth={totalThisMonth}
          snapshot={snapshot}
          notifications={notifications}
          onRefresh={() => loadDashboardData(true)}
          onWeeklyReport={openWeeklyReport}
          onEmerging={() => setTab("emerging")}
          onHistory={() => setTab("history")}
          onNotifications={() => setTab("notifications")}
        />
      )}

      {tab === "report" && (
        showReportEditor ? (
          <section className="agent-editor-page">
            <div className="agent-page-heading agent-editor-heading">
              <div className="agent-heading-icon">
                {reportMode === "add" ? <Plus size={20} /> : <FileText size={20} />}
              </div>
              <div>
                <h2>{reportMode === "add" ? "Submit Weekly Disease Report" : "Edit Weekly Disease Report"}</h2>
                <p>
                  {reportMode === "add"
                    ? "Enter the disease information collected for your assigned taluk."
                    : "Update the information submitted for the current surveillance cycle."}
                </p>
              </div>
            </div>

            <button type="button" className="agent-secondary-button" onClick={closeEditor}>
              Cancel
            </button>

            <div className="agent-form-card">
              <ReportForm key={reportFormKey} mode={reportMode} />
            </div>
          </section>
        ) : (
          <WeeklyReportLanding
            alreadySubmitted={alreadySubmitted}
            weekNumber={weekNumber}
            cycleDates={cycleDates}
            onSubmit={openWeeklyReport}
          />
        )
      )}

      {tab === "emerging" && <EmergingDiseaseReport />}

      {tab === "history" && <History />}

      {tab === "notifications" && (
        <NotificationsView
          notifications={notifications}
          loading={loading}
          onRefresh={() => loadDashboardData(true)}
        />
      )}
    </AgentShell>
  );
}

function DashboardView({
  session,
  talukName,
  districtName,
  weekNumber,
  cycleDates,
  alreadySubmitted,
  loading,
  refreshing,
  error,
  latestSubmissionDate,
  latestSubmissionTime,
  totalThisMonth,
  snapshot,
  notifications,
  onRefresh,
  onWeeklyReport,
  onEmerging,
  onHistory,
  onNotifications,
}) {
  return (
    <div className="agent-dashboard">
      <section className="agent-hero">
        <div className="agent-hero-overlay" />
        <div className="agent-hero-content">
          <h1>Welcome back, {session.full_name || session.username}! <span>👋</span></h1>
          <p>Field surveillance overview for {talukName}</p>

          <div className="agent-cycle">
            <div className="agent-cycle-icon"><CalendarDays size={22} /></div>
            <div>
              <strong>Current Surveillance Cycle</strong>
              <span>
                Week {weekNumber ?? "—"} <b>•</b> {cycleDates}
              </span>
            </div>
          </div>
        </div>

        <div className="agent-assignment-card">
          <div className="agent-assignment-icon"><MapPin size={22} /></div>
          <div>
            <strong>Assigned Location</strong>
            <div><span>Taluk</span><b>:</b><em>{talukName}</em></div>
            <div><span>District</span><b>:</b><em>{districtName}</em></div>
            <div><span>Role</span><b>:</b><em>Field Surveillance Agent</em></div>
          </div>
        </div>
      </section>

      {error && (
        <div className="agent-error-banner">
          <AlertCircle size={17} />
          <span>{error}</span>
          <button type="button" onClick={onRefresh}>Retry</button>
        </div>
      )}

      <section className="agent-stat-grid">
        <StatCard
          className="status-card"
          icon={alreadySubmitted ? <CheckCircle2 size={22} /> : <Clock3 size={22} />}
          title="Report Status"
          value={loading ? "Loading..." : alreadySubmitted ? "Submitted" : "Pending"}
          detail={alreadySubmitted ? "This week's report has been submitted" : "Weekly report requires submission"}
        />
        <StatCard
          className="submission-card"
          icon={<CalendarDays size={22} />}
          title="Last Submission"
          value={loading ? "Loading..." : latestSubmissionDate || "No submission yet"}
          detail={latestSubmissionDate && latestSubmissionTime ? latestSubmissionTime : "Your first report is pending"}
        />
        <StatCard
          className="cycle-card"
          icon={<RefreshCw size={22} />}
          title="Current Cycle"
          value={`Week ${weekNumber ?? "—"}`}
          detail={cycleDates}
        />
        <StatCard
          className="total-card"
          icon={<FileText size={22} />}
          title="Total Reports Submitted"
          value={loading ? "—" : String(totalThisMonth)}
          detail="This month"
        />
      </section>

      <section className="agent-section-heading">
        <h2>Quick Actions</h2>
      </section>

      <section className="agent-quick-grid">
        <QuickAction
          tone="blue"
          icon={<FileText size={21} />}
          title="Submit Weekly Report"
          description="Report disease cases and field observations for the current week"
          onClick={onWeeklyReport}
        />
        <QuickAction
          tone="red"
          icon={<ShieldAlert size={21} />}
          title="Report Emerging Disease"
          description="Report unusual or unknown disease patterns"
          onClick={onEmerging}
        />
        <QuickAction
          tone="green"
          icon={<HistoryIcon size={21} />}
          title="View Submission History"
          description="Check your past reports and submissions"
          onClick={onHistory}
        />
      </section>

      <section className="agent-bottom-grid">
        <div className="agent-panel snapshot-panel">
          <div className="agent-panel-heading">
            <div className="agent-panel-title-wrap">
              <MapPin size={21} />
              <div>
                <h3>Current Taluk Snapshot</h3>
                <p>Latest surveillance data for {talukName}</p>
              </div>
            </div>
          </div>

          <div className="snapshot-table-wrap">
            <table className="snapshot-table">
              <thead>
                <tr>
                  <th>Disease</th>
                  <th>Confirmed Cases</th>
                  <th>Suspected Cases</th>
                  <th>Severity</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.map((item) => {
                  const risk = item.risk_level || "Low";
                  return (
                    <tr key={item.disease}>
                      <td>
                        <span className={`disease-dot ${String(item.disease).toLowerCase().replace(/\s+/g, "-")}`} />
                        {item.disease}
                      </td>
                      <td>{item.cases ?? 0}</td>
                      <td>{item.suspected_cases ?? "—"}</td>
                      <td>
                        <span className={`risk-pill ${RISK_CLASS[risk] || "low"}`}>
                          {risk}
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {!snapshot.length && (
                  <tr>
                    <td colSpan="4" className="snapshot-empty">
                      No surveillance reports are available for this taluk yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="snapshot-note">
            <Info size={16} />
            <span>This is a read-only snapshot of the current taluk situation.</span>
          </div>
        </div>

        <div className="agent-panel notification-panel">
          <div className="agent-panel-heading">
            <div className="agent-panel-title-wrap">
              <Bell size={19} />
              <h3>Recent Notifications</h3>
            </div>
            <button type="button" onClick={onNotifications}>View All</button>
          </div>

          <NotificationList notifications={notifications.slice(0, 4)} />
        </div>
      </section>

      <div className="agent-refresh-line">
        <button type="button" onClick={onRefresh} disabled={refreshing}>
          <RefreshCw size={14} className={refreshing ? "spin" : ""} />
          {refreshing ? "Refreshing..." : "Refresh surveillance data"}
        </button>
      </div>
    </div>
  );
}

function StatCard({ className = "", icon, title, value, detail }) {
  const isStatus = className.includes("status-card");
  const isSubmitted = String(value).toLowerCase() === "submitted";

  return (
    <article className={`agent-stat-card ${className}`}>
      <div className="agent-stat-icon">{icon}</div>
      <div className="agent-stat-copy">
        <span className="agent-stat-title">{title}</span>
        {isStatus && (isSubmitted || String(value).toLowerCase() === "pending") ? (
          <span className={`agent-status-pill ${isSubmitted ? "submitted" : "pending"}`}>
            {value}
          </span>
        ) : (
          <strong>{value}</strong>
        )}
        <p>{detail}</p>
      </div>
    </article>
  );
}

function QuickAction({ tone, icon, title, description, onClick }) {
  return (
    <button type="button" className={`agent-quick-card ${tone}`} onClick={onClick}>
      <div className="agent-quick-icon">{icon}</div>
      <div className="agent-quick-copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
      <ArrowRight size={22} className="agent-quick-arrow" />
    </button>
  );
}

function NotificationList({ notifications }) {
  if (!notifications.length) {
    return (
      <div className="agent-empty-notifications">
        <Bell size={22} />
        <p>No notifications yet.</p>
      </div>
    );
  }

  return (
    <div className="agent-notification-list">
      {notifications.map((notification) => {
        const tone = notificationTone(notification.type);
        return (
          <div className="agent-notification-row" key={notification.id}>
            <div className={`agent-notification-icon ${tone}`}>
              <NotificationIcon type={notification.type} />
            </div>
            <div className="agent-notification-copy">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
            <time>{formatRelativeDate(notification.created_at)}</time>
          </div>
        );
      })}
    </div>
  );
}

function formatRelativeDate(dateValue) {
  if (!dateValue) return "";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "";

  const diff = Math.max(0, Date.now() - date.getTime());
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(hours / 24);

  if (hours < 1) return "just now";
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  if (days < 7) return `${days} day${days === 1 ? "" : "s"} ago`;
  return formatDate(dateValue);
}

function WeeklyReportLanding({ alreadySubmitted, weekNumber, cycleDates, onSubmit }) {
  return (
    <section className="agent-report-landing">
      <div className="agent-page-heading">
        <div className="agent-heading-icon"><FileText size={20} /></div>
        <div>
          <h2>Weekly Disease Report</h2>
          <p>Submit the latest disease surveillance information from your assigned taluk.</p>
        </div>
      </div>

      <div className={`agent-report-status-banner ${alreadySubmitted ? "submitted" : "pending"}`}>
        <div className="agent-report-status-icon">
          {alreadySubmitted ? <CheckCircle2 size={23} /> : <Clock3 size={23} />}
        </div>
        <div>
          <span>Week {weekNumber ?? "—"} · {cycleDates}</span>
          <h3>{alreadySubmitted ? "This week's report has been submitted" : "This week's report is pending"}</h3>
          <p>
            {alreadySubmitted
              ? "You can edit the submitted information whenever a correction is required."
              : "Submit the verified disease information collected for your assigned taluk."}
          </p>
        </div>
        <button type="button" onClick={onSubmit}>
          <FileText size={16} />
          {alreadySubmitted ? "Edit Weekly Report" : "Submit Weekly Report"}
        </button>
      </div>
    </section>
  );
}

function NotificationsView({ notifications, loading, onRefresh }) {
  return (
    <section className="agent-notifications-page">
      <div className="agent-page-heading">
        <div className="agent-heading-icon"><Bell size={20} /></div>
        <div>
          <h2>Notifications</h2>
          <p>Updates and messages related to your field surveillance work.</p>
        </div>
        <button type="button" className="agent-refresh-button" onClick={onRefresh} disabled={loading}>
          <RefreshCw size={15} className={loading ? "spin" : ""} />
          Refresh
        </button>
      </div>

      <div className="agent-full-notification-card">
        <NotificationList notifications={notifications} />
        {!notifications.length && (
          <div className="agent-large-empty">
            <Bell size={28} />
            <h3>No notifications</h3>
            <p>New surveillance reminders and updates will appear here.</p>
          </div>
        )}
      </div>
    </section>
  );
}
