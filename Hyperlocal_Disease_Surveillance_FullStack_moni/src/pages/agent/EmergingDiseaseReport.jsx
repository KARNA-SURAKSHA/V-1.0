import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  FileText,
  Info,
  MapPin,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Send,
  ShieldAlert,
  UploadCloud,
  X,
} from "lucide-react";

import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

import "./EmergingDiseaseReport.css";

const REPORT_TYPES = [
  "New Disease",
  "New Symptoms",
  "New Area",
];

const SEVERITIES = [
  "Low",
  "Medium",
  "High",
];

const EMPTY_FORM = {
  reported_name: "",
  type: "",
  observed_date: new Date().toISOString().slice(0, 10),
  symptoms: "",
  severity: "Medium",
};

function getTodayInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getIsoWeek(date = new Date()) {
  const value = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  );

  const day = value.getUTCDay() || 7;

  value.setUTCDate(
    value.getUTCDate() + 4 - day
  );

  const yearStart = new Date(
    Date.UTC(
      value.getUTCFullYear(),
      0,
      1
    )
  );

  return Math.ceil(
    (((value - yearStart) / 86400000) + 1) / 7
  );
}

function getWeekRange() {
  const today = new Date();
  const day = today.getDay();
  const mondayOffset =
    day === 0 ? -6 : 1 - day;

  const monday = new Date(today);

  monday.setDate(
    today.getDate() + mondayOffset
  );

  const sunday = new Date(monday);

  sunday.setDate(
    monday.getDate() + 6
  );

  const format = (
    value,
    includeYear = false
  ) =>
    value.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      ...(includeYear
        ? { year: "numeric" }
        : {}),
    });

  return `${format(monday)} – ${format(
    sunday,
    true
  )}`;
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isThisMonth(value) {
  if (!value) return false;

  const date = new Date(value);
  const now = new Date();

  return (
    !Number.isNaN(date.getTime()) &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear()
  );
}

function normalizeStatus(status) {
  const value = String(
    status || ""
  ).toUpperCase();

  if (value === "VERIFIED") {
    return {
      label: "Resolved",
      className: "resolved",
    };
  }

  if (value === "REJECTED") {
    return {
      label: "Rejected",
      className: "rejected",
    };
  }

  return {
    label: "Under Review",
    className: "under-review",
  };
}

function readMetadata(description) {
  const text = String(
    description || ""
  );

  const typeMatch = text.match(
    /(?:^|\n)Report Type:\s*(.+)/i
  );

  const severityMatch = text.match(
    /(?:^|\n)Severity Level:\s*(.+)/i
  );

  const attachmentsMatch = text.match(
    /(?:^|\n)Attachments:\s*(.+)/i
  );

  return {
    type:
      typeMatch?.[1]?.trim() &&
      REPORT_TYPES.includes(
        typeMatch[1].trim()
      )
        ? typeMatch[1].trim()
        : "New Disease",

    severity:
      severityMatch?.[1]?.trim() &&
      SEVERITIES.includes(
        severityMatch[1].trim()
      )
        ? severityMatch[1].trim()
        : "Medium",

    attachments:
      attachmentsMatch?.[1]
        ? attachmentsMatch[1]
            .split("|")
            .map((item) =>
              item.trim()
            )
            .filter(Boolean)
        : [],
  };
}

function buildDescription({
  type,
  severity,
  fileNames,
}) {
  const attachments = fileNames.length
    ? fileNames.join(" | ")
    : "None";

  return [
    `Report Type: ${type}`,
    `Severity Level: ${severity}`,
    `Attachments: ${attachments}`,
  ].join("\n");
}

function toInputDate(value) {
  if (!value) {
    return getTodayInputValue();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return getTodayInputValue();
  }

  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

/*
 * The logged-in agent's registered Taluk
 * is taken from /agent/status.
 *
 * Fallbacks are kept in case older session
 * data already contains location information.
 */
function getLocation(
  session,
  agentStatus
) {
  return {
    taluk:
      agentStatus?.taluk_name ||
      session?.taluk_name ||
      session?.taluk ||
      session?.assigned_taluk ||
      "Loading...",

    district:
      agentStatus?.district_name ||
      session?.district_name ||
      session?.district ||
      session?.assigned_district ||
      "Loading...",
  };
}

export default function EmergingDiseaseReport() {
  const { session } = useAuth();

  const [
    agentStatus,
    setAgentStatus,
  ] = useState(null);

  const location = useMemo(
    () =>
      getLocation(
        session,
        agentStatus
      ),
    [session, agentStatus]
  );

  const formRef = useRef(null);

  const [form, setForm] = useState({
    ...EMPTY_FORM,
  });

  const [files, setFiles] = useState([]);

  const [reports, setReports] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [
    searchTerm,
    setSearchTerm,
  ] = useState("");

  const [
    selectedReport,
    setSelectedReport,
  ] = useState(null);

  const [
    editingId,
    setEditingId,
  ] = useState(null);

  const today =
    getTodayInputValue();

  /*
   * Get the currently logged-in agent's
   * registered Taluk and District.
   */
  const loadAgentStatus =
    async () => {
      try {
        const data =
          await api.getAgentStatus();

        setAgentStatus(data);

        return data;
      } catch (err) {
        console.error(
          "Unable to load the registered agent location:",
          err
        );

        return null;
      }
    };

  /*
   * Load only the emerging disease
   * reports belonging to the logged-in agent.
   */
  const loadReports = async () => {
    setLoading(true);
    setError("");

    try {
      const data =
        await api.getMyEmergingReports();

      setReports(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      setError(
        err?.message ||
          "Unable to load emerging disease reports."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAgentStatus();
    loadReports();
  }, []);

  const resetForm = () => {
    setForm({
      ...EMPTY_FORM,
      observed_date: today,
    });

    setFiles([]);
    setEditingId(null);
  };

  const scrollToForm = () => {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  };

  const handleReportNew = () => {
    setMessage("");
    setError("");

    resetForm();

    scrollToForm();
  };

  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
    } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleFiles = (
    event
  ) => {
    const selected =
      Array.from(
        event.target.files || []
      );

    setFiles(selected);
  };

  const handleDrop = (
    event
  ) => {
    event.preventDefault();

    const dropped =
      Array.from(
        event.dataTransfer.files ||
          []
      );

    setFiles(dropped);
  };

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setMessage("");

      const cleanName =
        form.reported_name.trim();

      const cleanSymptoms =
        form.symptoms.trim();

      if (!cleanName) {
        setError(
          "Disease or condition name is required."
        );

        return;
      }

      if (!form.type) {
        setError(
          "Please select the report type."
        );

        return;
      }

      if (!cleanSymptoms) {
        setError(
          "Please describe the key symptoms observed."
        );

        return;
      }

      setSubmitting(true);

      try {
        const observedDate =
          new Date(
            `${form.observed_date}T00:00:00`
          );

        const payload = {
          reported_name:
            cleanName,

          suspected_cases: 0,

          symptoms:
            cleanSymptoms,

          description:
            buildDescription({
              type: form.type,
              severity:
                form.severity,
              fileNames:
                files.map(
                  (file) =>
                    file.name
                ),
            }),

          observed_date:
            observedDate.toISOString(),
        };

        if (editingId) {
          await api.request(
            `/agent/emerging/${editingId}`,
            {
              method: "PUT",
              body: payload,
            }
          );

          setMessage(
            "Emerging disease report updated successfully."
          );
        } else {
          await api.request(
            "/agent/emerging",
            {
              method: "POST",
              body: payload,
            }
          );

          setMessage(
            "Emerging disease report submitted for medical review."
          );
        }

        resetForm();

        await loadReports();

        requestAnimationFrame(() => {
          document
            .querySelector(
              ".emerging-reports-card"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        });
      } catch (err) {
        setError(
          err?.message ||
            "Unable to save the emerging disease report."
        );
      } finally {
        setSubmitting(false);
      }
    };

  const handleEdit = (
    report
  ) => {
    if (
      String(
        report.status || ""
      ).toUpperCase() !==
      "PENDING"
    ) {
      setSelectedReport(
        report
      );

      return;
    }

    const metadata =
      readMetadata(
        report.description
      );

    setForm({
      reported_name:
        report.reported_name ||
        "",

      type: metadata.type,

      observed_date:
        toInputDate(
          report.observed_date
        ),

      symptoms:
        report.symptoms || "",

      severity:
        metadata.severity,
    });

    setFiles([]);
    setEditingId(report.id);

    setMessage("");
    setError("");

    scrollToForm();
  };

  const filteredReports =
    useMemo(() => {
      const term =
        searchTerm
          .trim()
          .toLowerCase();

      if (!term) {
        return reports;
      }

      return reports.filter(
        (report) => {
          const metadata =
            readMetadata(
              report.description
            );

          return [
            report.reported_name,
            report.taluk_name,
            report.symptoms,
            report.status,
            metadata.type,
            metadata.severity,
          ]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(term);
        }
      );
    }, [
      reports,
      searchTerm,
    ]);

  const monthReports =
    useMemo(
      () =>
        reports.filter(
          (report) =>
            isThisMonth(
              report.created_at
            )
        ),
      [reports]
    );

  const pendingCount =
    reports.filter(
      (report) =>
        String(
          report.status
        ).toUpperCase() ===
        "PENDING"
    ).length;

  const resolvedCount =
    reports.filter(
      (report) =>
        String(
          report.status
        ).toUpperCase() ===
        "VERIFIED"
    ).length;

  const highPriorityCount =
    reports.filter(
      (report) =>
        readMetadata(
          report.description
        ).severity ===
          "High" &&
        String(
          report.status
        ).toUpperCase() !==
          "REJECTED"
    ).length;

  return (
    <div className="emerging-page">
      <section className="emerging-hero">
        <div className="emerging-hero-overlay" />

        <div className="emerging-hero-content">
          <h1>
            Emerging Disease
          </h1>

          <p>
            Report unusual disease
            patterns, new symptoms
            or potential outbreaks
            that are not part of
            the existing disease
            list.
          </p>

          <div className="emerging-cycle">
            <div className="emerging-cycle-icon">
              <CalendarDays
                size={22}
              />
            </div>

            <div>
              <strong>
                Current Surveillance
                Cycle
              </strong>

              <span>
                Week {getIsoWeek()}{" "}
                <b>•</b>{" "}
                {getWeekRange()}
              </span>
            </div>
          </div>
        </div>

        <div className="emerging-assignment-card">
          <MapPin size={23} />

          <div>
            <strong>
              Assigned Location
            </strong>

            <div>
              <span>Taluk</span>
              <b>:</b>
              <em>
                {location.taluk}
              </em>
            </div>

            <div>
              <span>District</span>
              <b>:</b>
              <em>
                {location.district}
              </em>
            </div>

            <div>
              <span>Role</span>
              <b>:</b>
              <em>
                Field Surveillance Agent
              </em>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div className="emerging-alert emerging-alert-error">
          <AlertCircle size={16} />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadReports()
            }
          >
            Retry
          </button>
        </div>
      )}

      {message && (
        <div className="emerging-alert emerging-alert-success">
          <CheckCircle2 size={16} />

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() =>
              setMessage("")
            }
          >
            Dismiss
          </button>
        </div>
      )}

      <section className="emerging-stat-grid">
        <StatCard
          className="emerging-stat-blue"
          icon={
            <ShieldAlert size={22} />
          }
          title="Total Emerging Reports"
          value={
            loading
              ? "—"
              : monthReports.length
          }
          detail="this month"
        />

        <StatCard
          className="emerging-stat-green"
          icon={
            <Clock3 size={22} />
          }
          title="Under Review"
          value={
            loading
              ? "—"
              : pendingCount
          }
          detail="pending review"
        />

        <StatCard
          className="emerging-stat-orange"
          icon={
            <CheckCircle2 size={22} />
          }
          title="Resolved"
          value={
            loading
              ? "—"
              : resolvedCount
          }
          detail="confirmed / closed"
        />

        <StatCard
          className="emerging-stat-purple"
          icon={
            <ShieldAlert size={22} />
          }
          title="High Priority"
          value={
            loading
              ? "—"
              : highPriorityCount
          }
          detail="requires immediate attention"
        />
      </section>

      <section className="emerging-main-grid">
        <div className="emerging-reports-card">
          <div className="emerging-card-header">
            <div className="emerging-card-title">
              <div className="emerging-title-icon green">
                <FileText size={19} />
              </div>

              <h2>
                Recent Emerging Disease
                Reports
              </h2>
            </div>

            <button
              type="button"
              className="emerging-report-new-button"
              onClick={
                handleReportNew
              }
            >
              <Plus size={17} />
              Report New
            </button>
          </div>

          <div className="emerging-table-toolbar">
            <div className="emerging-search">
              <Search size={15} />

              <input
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search reports"
                aria-label="Search emerging reports"
              />
            </div>

            <span>
              {
                filteredReports.length
              }{" "}
              report
              {filteredReports.length ===
              1
                ? ""
                : "s"}
            </span>
          </div>

          <div className="emerging-table-wrapper">
            <table className="emerging-table">
              <thead>
                <tr>
                  <th>
                    Date Reported
                  </th>

                  <th>
                    Disease / Condition
                  </th>

                  <th>
                    Type
                  </th>

                  <th>
                    Location
                  </th>

                  <th>
                    Symptoms
                  </th>

                  <th>
                    Severity
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Action
                  </th>
                </tr>
              </thead>

              <tbody>
                {!loading &&
                  filteredReports.map(
                    (report) => {
                      const metadata =
                        readMetadata(
                          report.description
                        );

                      const status =
                        normalizeStatus(
                          report.status
                        );

                      return (
                        <tr
                          key={
                            report.id
                          }
                        >
                          <td>
                            <div className="emerging-date-cell">
                              <strong>
                                {formatDate(
                                  report.created_at
                                )}
                              </strong>

                              <span>
                                {formatTime(
                                  report.created_at
                                )}
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="emerging-disease-cell">
                              <strong>
                                {report.reported_name ||
                                  "Unknown"}
                              </strong>
                            </div>
                          </td>

                          <td>
                            <span
                              className={`emerging-type-pill ${metadata.type
                                .toLowerCase()
                                .replace(
                                  /\s+/g,
                                  "-"
                                )}`}
                            >
                              {
                                metadata.type
                              }
                            </span>
                          </td>

                          <td>
                            <div className="emerging-location-cell">
                              <strong>
                                {report.taluk_name ||
                                  location.taluk}
                              </strong>

                              <span>
                                {
                                  location.district
                                }
                              </span>
                            </div>
                          </td>

                          <td>
                            <div className="emerging-symptom-cell">
                              {report.symptoms ||
                                "—"}
                            </div>
                          </td>

                          <td>
                            <span
                              className={`emerging-severity-pill ${metadata.severity.toLowerCase()}`}
                            >
                              {
                                metadata.severity
                              }
                            </span>
                          </td>

                          <td>
                            <span
                              className={`emerging-status-pill ${status.className}`}
                            >
                              {
                                status.label
                              }
                            </span>
                          </td>

                          <td>
                            <div className="emerging-action-buttons">
  <button
    type="button"
    title="View report"
    aria-label={`View ${report.reported_name}`}
    onClick={() =>
      setSelectedReport(report)
    }
  >
    <Eye size={16} />
  </button>
</div>
                          </td>
                        </tr>
                      );
                    }
                  )}

                {loading && (
                  <tr>
                    <td
                      colSpan="8"
                      className="emerging-empty-row"
                    >
                      Loading emerging
                      disease reports...
                    </td>
                  </tr>
                )}

                {!loading &&
                  filteredReports.length ===
                    0 && (
                    <tr>
                      <td
                        colSpan="8"
                        className="emerging-empty-row"
                      >
                        <FileText
                          size={24}
                        />

                        <strong>
                          No emerging
                          disease
                          reports found.
                        </strong>

                        <span>
                          Submit a new
                          report using
                          the form.
                        </span>
                      </td>
                    </tr>
                  )}
              </tbody>
            </table>
          </div>
        </div>

        <form
          ref={formRef}
          className="emerging-form-card"
          onSubmit={
            handleSubmit
          }
        >
          <div className="emerging-card-header">
            <div className="emerging-card-title">
              <div className="emerging-title-icon green">
                <ShieldAlert
                  size={19}
                />
              </div>

              <h2>
                Report a New / Emerging
                Disease
              </h2>
            </div>
          </div>

          {editingId && (
            <div className="emerging-edit-banner">
              <Pencil size={14} />

              <span>
                Editing a pending
                report
              </span>

              <button
                type="button"
                onClick={resetForm}
              >
                Cancel edit
              </button>
            </div>
          )}

          <div className="emerging-form-inner">
            <div className="emerging-form-grid two-columns">
              <Field
                label="Disease / Condition"
                required
              >
                <div className="emerging-input-with-icon">
                  <Search size={16} />

                  <input
                    name="reported_name"
                    value={
                      form.reported_name
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Enter disease name or condition"
                    required
                  />
                </div>
              </Field>

              <Field
                label="Type"
                required
              >
                <SelectField
                  name="type"
                  value={
                    form.type
                  }
                  onChange={
                    handleChange
                  }
                  options={
                    REPORT_TYPES
                  }
                  placeholder="Select type"
                />
              </Field>

              <Field
                label="Location (Taluk)"
                required
              >
                <div className="emerging-input-with-icon">
                  <MapPin
                    size={16}
                  />

                  <input
                    value={
                      location.taluk
                    }
                    readOnly
                    aria-readonly="true"
                  />
                </div>
              </Field>

              <Field
                label="Date of First Observation"
                required
              >
                <div className="emerging-input-with-icon">
                  <CalendarDays
                    size={16}
                  />

                  <input
                    type="date"
                    name="observed_date"
                    value={
                      form.observed_date
                    }
                    max={today}
                    onChange={
                      handleChange
                    }
                    required
                  />
                </div>
              </Field>
            </div>

            <Field
              label="Key Symptoms Observed"
              required
            >
              <div className="emerging-textarea-wrap">
                <textarea
                  name="symptoms"
                  value={
                    form.symptoms
                  }
                  onChange={
                    handleChange
                  }
                  maxLength={500}
                  placeholder="Describe the symptoms in detail (e.g., fever, rash, cough, etc.)"
                  required
                />

                <span>
                  {
                    form.symptoms
                      .length
                  }
                  /500
                </span>
              </div>
            </Field>

            <div className="emerging-form-grid severity-attachments">
              <Field
                label="Severity Level"
                required
              >
                <SelectField
                  name="severity"
                  value={
                    form.severity
                  }
                  onChange={
                    handleChange
                  }
                  options={
                    SEVERITIES
                  }
                />
              </Field>

              <Field label="Attachments (optional)">
                <label
                  className="emerging-upload-box"
                  onDragOver={(
                    event
                  ) =>
                    event.preventDefault()
                  }
                  onDrop={
                    handleDrop
                  }
                >
                  <UploadCloud
                    size={18}
                  />

                  <span>
                    Click to upload
                    or drag and
                    drop
                  </span>

                  <small>
                    Images, reports,
                    or other files
                  </small>

                  <input
                    type="file"
                    multiple
                    onChange={
                      handleFiles
                    }
                    hidden
                  />
                </label>

                {files.length >
                  0 && (
                  <div className="emerging-file-list">
                    {files.map(
                      (file) => (
                        <span
                          key={`${file.name}-${file.size}`}
                        >
                          {
                            file.name
                          }
                        </span>
                      )
                    )}
                  </div>
                )}
              </Field>
            </div>

            <div className="emerging-form-actions">
              <button
                type="button"
                className="emerging-clear-button"
                onClick={
                  resetForm
                }
                disabled={
                  submitting
                }
              >
                <RotateCcw
                  size={15}
                />

                Clear Form
              </button>

              <button
                type="submit"
                className="emerging-submit-button"
                disabled={
                  submitting
                }
              >
                <Send size={15} />

                {submitting
                  ? "Saving..."
                  : editingId
                    ? "Update Report"
                    : "Submit Report"}
              </button>
            </div>

            <div className="emerging-guidelines">
              <div className="emerging-guidelines-icon">
                <Info size={15} />
              </div>

              <div>
                <strong>
                  Guidelines for Reporting
                </strong>

                <ul>
                  <li>
                    Report diseases
                    that are new,
                    unusual or not
                    in the existing
                    list.
                  </li>

                  <li>
                    Include detailed
                    symptoms,
                    location and any
                    supporting
                    evidence.
                  </li>

                  <li>
                    For severe or
                    high-risk cases,
                    report
                    immediately.
                  </li>

                  <li>
                    Your report will
                    be reviewed by
                    the medical
                    supervisor and
                    health team.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </form>
      </section>

      {selectedReport && (
        <ReportDetailsModal
          report={
            selectedReport
          }
          location={location}
          onClose={() =>
            setSelectedReport(
              null
            )
          }
          onEdit={() => {
            setSelectedReport(
              null
            );

            handleEdit(
              selectedReport
            );
          }}
        />
      )}
    </div>
  );
}

function Field({
  label,
  required = false,
  children,
}) {
  return (
    <div className="emerging-field">
      <label>
        {label}

        {required && (
          <span> *</span>
        )}
      </label>

      {children}
    </div>
  );
}

function SelectField({
  name,
  value,
  onChange,
  options,
  placeholder = "Select",
}) {
  return (
    <div className="emerging-select-wrap">
      <select
        name={name}
        value={value}
        onChange={onChange}
        required
      >
        <option
          value=""
          disabled
        >
          {placeholder}
        </option>

        {options.map(
          (option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          )
        )}
      </select>

      <ChevronDown
        size={15}
      />
    </div>
  );
}

function StatCard({
  className,
  icon,
  title,
  value,
  detail,
}) {
  return (
    <div
      className={`emerging-stat-card ${className}`}
    >
      <div className="emerging-stat-icon">
        {icon}
      </div>

      <div className="emerging-stat-copy">
        <strong>
          {title}
        </strong>

        <b>
          {value}
        </b>

        <span>
          {detail}
        </span>
      </div>

      <span className="emerging-stat-arrow">
        ›
      </span>
    </div>
  );
}

function ReportDetailsModal({
  report,
  location,
  onClose,
  onEdit,
}) {
  const metadata =
    readMetadata(
      report.description
    );

  const status =
    normalizeStatus(
      report.status
    );

  return (
    <div
      className="emerging-modal-backdrop"
      onMouseDown={onClose}
    >
      <div
        className="emerging-modal"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <div className="emerging-modal-header">
          <div>
            <span>
              Emerging Disease
              Report
            </span>

            <h3>
              {
                report.reported_name
              }
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close report details"
          >
            <X size={18} />
          </button>
        </div>

        <div className="emerging-modal-grid">
          <div>
            <span>
              Date Reported
            </span>

            <strong>
              {formatDate(
                report.created_at
              )}
            </strong>
          </div>

          <div>
            <span>
              Type
            </span>

            <strong>
              {metadata.type}
            </strong>
          </div>

          <div>
            <span>
              Location
            </span>

            <strong>
              {report.taluk_name ||
                location.taluk}
            </strong>
          </div>

          <div>
            <span>
              Severity
            </span>

            <strong>
              {metadata.severity}
            </strong>
          </div>

          <div>
            <span>
              Status
            </span>

            <strong>
              {status.label}
            </strong>
          </div>

          <div>
            <span>
              First Observation
            </span>

            <strong>
              {formatDate(
                report.observed_date
              )}
            </strong>
          </div>

          <div className="full">
            <span>
              Key Symptoms Observed
            </span>

            <p>
              {report.symptoms ||
                "No symptoms recorded."}
            </p>
          </div>

          <div className="full">
            <span>
              Attachments
            </span>

            <p>
              {metadata
                .attachments
                .length
                ? metadata.attachments.join(
                    ", "
                  )
                : "No attachments recorded."}
            </p>
          </div>

          {report.review_notes && (
            <div className="full">
              <span>
                Medical Review Notes
              </span>

              <p>
                {
                  report.review_notes
                }
              </p>
            </div>
          )}
        </div>

        <div className="emerging-modal-footer">
          <button
            type="button"
            className="emerging-modal-secondary"
            onClick={onClose}
          >
            Close
          </button>

          <button
            type="button"
            className="emerging-modal-primary"
            onClick={onEdit}
          >
            <Pencil size={14} />

            {String(
              report.status
            ).toUpperCase() ===
            "PENDING"
              ? "Edit Report"
              : "View Only"}
          </button>
        </div>
      </div>
    </div>
  );
}