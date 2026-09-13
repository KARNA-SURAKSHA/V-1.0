import { ArrowDownRight, ArrowUpRight, CheckCircle2 } from "lucide-react";

export const cn = (...items) => items.filter(Boolean).join(" ");

export function Panel({ title, subtitle, action, onAction, children, className = "" }) {
  return (
    <section className={cn("ms-panel", className)}>
      <div className="ms-panel-head">
        <div className="ms-panel-title-wrap">
          <h3 className="ms-panel-title">{title}</h3>
          {subtitle ? <p className="ms-panel-subtitle">{subtitle}</p> : null}
        </div>
        {action ? (
          <button type="button" className="ms-panel-action" onClick={onAction}>
            {action}
            <span aria-hidden="true">→</span>
          </button>
        ) : null}
      </div>
      <div className="ms-panel-body">{children}</div>
    </section>
  );
}

export function Kpi({ icon, label, value, note, tone = "green", trend }) {
  const toneClass = {
    green: "ms-kpi-icon-green",
    blue: "ms-kpi-icon-blue",
    amber: "ms-kpi-icon-amber",
    purple: "ms-kpi-icon-purple",
  }[tone] || "ms-kpi-icon-green";

  return (
    <article className="ms-kpi">
      <div className={`ms-kpi-icon ${toneClass}`}>{icon}</div>
      <div className="ms-kpi-copy">
        <div className="ms-kpi-label">{label}</div>
        <div className="ms-kpi-value">{value}</div>
        {trend !== undefined && trend !== null ? (
          <div className={`ms-kpi-note ${trend > 0 ? "ms-trend-red" : "ms-trend-green"}`}>
            {trend > 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            <span>{Math.abs(trend)}% vs last week</span>
          </div>
        ) : note ? (
          <div className="ms-kpi-note ms-trend-green">{note}</div>
        ) : null}
      </div>
    </article>
  );
}

export function StatusBadge({ children, tone = "green" }) {
  return <span className={`ms-status ms-status-${tone}`}>{children}</span>;
}

export function RiskBadge({ level }) {
  const tone = level === "Critical" || level === "High" ? "red" : level === "Moderate" ? "amber" : "green";
  return <StatusBadge tone={tone}>{level || "Low"}</StatusBadge>;
}

export function Empty({ text }) {
  return <div className="ms-empty">{text}</div>;
}

export function Loading() {
  return <div className="ms-loading">Loading surveillance data…</div>;
}

export function PageHeading({ eyebrow, title, subtitle, image, children }) {
  return (
    <div className="ms-page-heading">
      <div className="ms-page-heading-copy">
        {eyebrow ? <div className="ms-eyebrow">{eyebrow}</div> : null}
        <h1>{title}</h1>
        {subtitle ? <p>{subtitle}</p> : null}
        {children}
      </div>
      {image ? <img src={image} alt="" className="ms-page-heading-image" /> : null}
    </div>
  );
}

export function Toast({ message, onClose }) {
  if (!message) return null;
  return (
    <div className="ms-toast">
      <CheckCircle2 size={17} />
      <span>{message}</span>
      <button type="button" onClick={onClose}>×</button>
    </div>
  );
}
