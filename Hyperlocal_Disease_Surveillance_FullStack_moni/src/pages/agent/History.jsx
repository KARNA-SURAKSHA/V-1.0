import { useCallback, useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Info,
  MapPin,
  RefreshCw,
  X,
  Eye,
  Bug,
} from "lucide-react";

import { api } from "../../api";

import "./History.css";


/* ============================================================
   CONFIGURATION
============================================================ */

const PAGE_SIZE = 5;


/* ============================================================
   DATE HELPERS
============================================================ */

function parseDate(value) {

  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}


function formatDate(value) {

  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}


function formatLongDate(value) {

  const date = parseDate(value);

  if (!date) {
    return "Unknown date";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );
}


function formatTime(value) {

  const date = parseDate(value);

  if (!date) {
    return "—";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


function localDateKey(value) {

  const date = parseDate(value);

  if (!date) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}


/* ============================================================
   STATUS
============================================================ */

function getStatus(report) {

  /*
   * The current backend does not have a dedicated status
   * column in DiseaseReport.
   *
   * If a future API response supplies status/submission_status,
   * it will be used automatically.
   */

  const explicitStatus =
    String(
      report?.status ||
      report?.submission_status ||
      ""
    ).trim();

  if (explicitStatus) {
    return explicitStatus;
  }


  /*
   * Current backend behaviour:
   *
   * created_at == updated_at
   *       -> Submitted
   *
   * updated_at later than created_at
   *       -> Revised
   */

  const created =
    parseDate(
      report?.created_at
    );

  const updated =
    parseDate(
      report?.updated_at
    );

  if (
    created &&
    updated &&
    updated.getTime() -
      created.getTime() >
      1000
  ) {
    return "Revised";
  }

  return "Submitted";
}


/* ============================================================
   SEVERITY
============================================================ */

function getSeverityClass(
  severity
) {

  switch (
    String(
      severity || ""
    ).toLowerCase()
  ) {

    case "high":
      return "high";

    case "moderate":
      return "moderate";

    case "critical":
      return "critical";

    default:
      return "low";
  }
}


/* ============================================================
   STATUS CLASS
============================================================ */

function getStatusClass(
  status
) {

  switch (
    String(
      status || ""
    ).toLowerCase()
  ) {

    case "draft":
      return "draft";

    case "revised":
      return "revised";

    case "pending":
      return "pending";

    default:
      return "submitted";
  }
}


/* ============================================================
   ERROR MESSAGE
============================================================ */

function getErrorMessage(
  error
) {

  return (
    error?.message ||
    "Unable to load submission history. Please try again."
  );
}


/* ============================================================
   SUMMARY CARD
============================================================ */

function SummaryCard({
  tone,
  icon,
  title,
  value,
  note,
}) {

  return (

    <div
      className={`history-summary-card ${tone}`}
    >

      <div className="history-summary-icon">
        {icon}
      </div>

      <div className="history-summary-copy">

        <span>
          {title}
        </span>

        <strong>
          {value}
        </strong>

        <small>
          {note}
        </small>

      </div>

    </div>

  );
}


/* ============================================================
   FILTER FIELD
============================================================ */

function FilterField({
  label,
  children,
}) {

  return (

    <label className="history-filter-field">

      <span>
        {label}
      </span>

      {children}

    </label>

  );
}


/* ============================================================
   VIEW REPORT MODAL
============================================================ */

function ViewReportModal({
  report,
  onClose,
}) {

  if (!report) {
    return null;
  }


  const status =
    getStatus(report);


  const confirmed =
    Number(
      report.confirmed_cases ??
      report.cases ??
      0
    );


  const suspected =
    Number(
      report.suspected_cases ??
      0
    );


  return (

    <div
      className="history-modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {
          onClose();
        }

      }}
    >

      <section
        className="history-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="history-view-title"
      >

        {/* HEADER */}

        <div className="history-modal-header">

          <div className="history-modal-title-wrap">

            <div className="history-modal-icon">

              <Eye size={20} />

            </div>

            <div>

              <h2
                id="history-view-title"
              >
                Report Details
              </h2>

              <p>
                {report.disease ||
                  "Disease report"}
              </p>

            </div>

          </div>


          <button
            type="button"
            className="history-modal-close"
            onClick={onClose}
            aria-label="Close report details"
          >

            <X size={20} />

          </button>

        </div>


        {/* BODY */}

        <div className="history-modal-body">

          <div className="history-detail-grid">

            {/* DATE */}

            <div>

              <span>
                Date &amp; Time
              </span>

              <strong>

                {formatLongDate(
                  report.created_at
                )}

                {" · "}

                {formatTime(
                  report.created_at
                )}

              </strong>

            </div>


            {/* STATUS */}

            <div>

              <span>
                Status
              </span>

              <strong>

                <em
                  className={
                    `history-pill status ${
                      getStatusClass(
                        status
                      )
                    }`
                  }
                >
                  {status}
                </em>

              </strong>

            </div>


            {/* CONFIRMED */}

            <div>

              <span>
                Confirmed Cases
              </span>

              <strong>
                {confirmed}
              </strong>

            </div>


            {/* SUSPECTED */}

            <div>

              <span>
                Suspected Cases
              </span>

              <strong>
                {suspected}
              </strong>

            </div>


            {/* SEVERITY */}

            <div>

              <span>
                Severity
              </span>

              <strong>

                <em
                  className={
                    `history-pill severity ${
                      getSeverityClass(
                        report.severity
                      )
                    }`
                  }
                >
                  {report.severity ||
                    "Low"}
                </em>

              </strong>

            </div>


            {/* WEEK */}

            <div>

              <span>
                Surveillance Week
              </span>

              <strong>

                Week{" "}
                {report.week_number ??
                  "—"}

                {" · "}

                {report.year ??
                  "—"}

              </strong>

            </div>

          </div>


          {/* REMARKS */}

          <div className="history-detail-section">

            <span>
              Field Observations / Remarks
            </span>

            <p>

              {report.remarks?.trim() ||
                "No remarks provided."}

            </p>

          </div>


          {/* PRECAUTIONS */}

          <div className="history-detail-section">

            <span>
              Precautionary Measures
            </span>

            <p>

              {
                report.preventive_measures?.trim() ||
                "No precautionary measures provided."
              }

            </p>

          </div>

        </div>


        {/* FOOTER */}

        <div className="history-modal-footer">

          <button
            type="button"
            onClick={onClose}
          >
            Close
          </button>

        </div>

      </section>

    </div>

  );
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function History() {

  const [
    reports,
    setReports,
  ] = useState([]);


  const [
    status,
    setStatus,
  ] = useState(null);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  /* ==========================================================
     FILTER STATE
  ========================================================== */

  const [
    fromDate,
    setFromDate,
  ] = useState("");


  const [
    toDateFilter,
    setToDateFilter,
  ] = useState("");


  const [
    disease,
    setDisease,
  ] = useState("all");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  /* ==========================================================
     PAGINATION
  ========================================================== */

  const [
    page,
    setPage,
  ] = useState(1);


  /* ==========================================================
     VIEW MODAL
  ========================================================== */

  const [
    selectedReport,
    setSelectedReport,
  ] = useState(null);


  /* ==========================================================
     LOAD HISTORY
  ========================================================== */

  const loadHistory =
    useCallback(
      async (
        isRefresh = false
      ) => {

        try {

          if (isRefresh) {

            setRefreshing(
              true
            );

          } else {

            setLoading(
              true
            );

          }

          setError("");


          const [
            statusResult,
            historyResult,
          ] =
            await Promise.all([
              api.getAgentStatus(),
              api.getAgentHistory(),
            ]);


          setStatus(
            statusResult ||
              null
          );


          setReports(
            Array.isArray(
              historyResult
            )
              ? historyResult
              : []
          );

        } catch (err) {

          setError(
            getErrorMessage(
              err
            )
          );

        } finally {

          setLoading(false);

          setRefreshing(false);

        }

      },
      []
    );


  /* ==========================================================
     INITIAL LOAD
  ========================================================== */

  useEffect(() => {

    loadHistory();

  }, [
    loadHistory,
  ]);


  /* ==========================================================
     RESET PAGE WHEN FILTERS CHANGE
  ========================================================== */

  useEffect(() => {

    setPage(1);

  }, [
    fromDate,
    toDateFilter,
    disease,
    statusFilter,
  ]);


  /* ==========================================================
     ESCAPE MODAL
  ========================================================== */

  useEffect(() => {

    const handleKeyDown =
      (event) => {

        if (
          event.key ===
          "Escape"
        ) {

          setSelectedReport(
            null
          );

        }

      };


    document.addEventListener(
      "keydown",
      handleKeyDown
    );


    return () => {

      document.removeEventListener(
        "keydown",
        handleKeyDown
      );

    };

  }, []);


  /* ==========================================================
     DISEASE OPTIONS
  ========================================================== */

  const diseaseOptions =
    useMemo(
      () => {

        return Array.from(
          new Set(
            reports
              .map(
                (report) =>
                  String(
                    report?.disease ||
                      ""
                  ).trim()
              )
              .filter(
                Boolean
              )
          )
        ).sort(
          (a, b) =>
            a.localeCompare(
              b
            )
        );

      },
      [reports]
    );


  /* ==========================================================
     DECORATED REPORTS
  ========================================================== */

  const decoratedReports =
    useMemo(
      () => {

        return reports

          .map(
            (report) => ({
              ...report,

              uiStatus:
                getStatus(
                  report
                ),
            })
          )

          .sort(
            (a, b) => {

              const aTime =
                parseDate(
                  a.created_at
                )?.getTime() ||
                0;

              const bTime =
                parseDate(
                  b.created_at
                )?.getTime() ||
                0;

              return (
                bTime -
                aTime
              );

            }
          );

      },
      [reports]
    );


  /* ==========================================================
     FILTERED REPORTS
  ========================================================== */

  const filteredReports =
    useMemo(
      () => {

        return decoratedReports.filter(
          (report) => {

            const reportDate =
              localDateKey(
                report.created_at
              );


            /* FROM DATE */

            if (
              fromDate &&
              (
                !reportDate ||
                reportDate <
                  fromDate
              )
            ) {

              return false;

            }


            /* TO DATE */

            if (
              toDateFilter &&
              (
                !reportDate ||
                reportDate >
                  toDateFilter
              )
            ) {

              return false;

            }


            /* DISEASE */

            if (
              disease !==
                "all" &&
              String(
                report.disease ||
                  ""
              ).toLowerCase() !==
                disease.toLowerCase()
            ) {

              return false;

            }


            /* STATUS */

            if (
              statusFilter !==
                "all" &&
              String(
                report.uiStatus ||
                  ""
              ).toLowerCase() !==
                statusFilter.toLowerCase()
            ) {

              return false;

            }


            return true;

          }
        );

      },
      [
        decoratedReports,
        fromDate,
        toDateFilter,
        disease,
        statusFilter,
      ]
    );


  /* ==========================================================
     TOTAL PAGES
  ========================================================== */

  const totalPages =
    Math.max(
      1,
      Math.ceil(
        filteredReports.length /
          PAGE_SIZE
      )
    );


  /* ==========================================================
     KEEP PAGE VALID
  ========================================================== */

  useEffect(() => {

    setPage(
      (current) =>
        Math.min(
          current,
          totalPages
        )
    );

  }, [
    totalPages,
  ]);


  /* ==========================================================
     CURRENT PAGE DATA
  ========================================================== */

  const visibleReports =
    useMemo(
      () => {

        const start =
          (page - 1) *
          PAGE_SIZE;

        return filteredReports.slice(
          start,
          start + PAGE_SIZE
        );

      },
      [
        filteredReports,
        page,
      ]
    );


  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary =
    useMemo(
      () => {

        const total =
          filteredReports.length;


        const submitted =
          filteredReports.filter(
            (report) =>
              report.uiStatus
                .toLowerCase() ===
              "submitted"
          ).length;


        const draft =
          filteredReports.filter(
            (report) =>
              report.uiStatus
                .toLowerCase() ===
              "draft"
          ).length;


        const revised =
          filteredReports.filter(
            (report) =>
              report.uiStatus
                .toLowerCase() ===
              "revised"
          ).length;


        const percentage =
          (value) => {

            return total
              ? `${Math.round(
                  (value /
                    total) *
                    100
                )}%`
              : "0%";

          };


        return {

          total,

          submitted,

          draft,

          revised,

          submittedPercent:
            percentage(
              submitted
            ),

          draftPercent:
            percentage(
              draft
            ),

          revisedPercent:
            percentage(
              revised
            ),

        };

      },
      [
        filteredReports,
      ]
    );


  /* ==========================================================
     ASSIGNMENT
  ========================================================== */

  const currentWeek =
    status?.current_week ??
    "—";


  const talukName =
    status?.taluk_name ||
    "Assigned Taluk";


  const districtName =
    status?.district_name ||
    "Assigned District";


  /* ==========================================================
     TABLE RANGE
  ========================================================== */

  const visibleStart =
    filteredReports.length
      ? (page - 1) *
          PAGE_SIZE +
        1
      : 0;


  const visibleEnd =
    Math.min(
      page * PAGE_SIZE,
      filteredReports.length
    );


  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  const clearFilters =
    () => {

      setFromDate("");

      setToDateFilter("");

      setDisease(
        "all"
      );

      setStatusFilter(
        "all"
      );

      setPage(1);

    };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loading) {

    return (

      <div className="history-page-loading">

        <RefreshCw
          className="history-spin"
          size={22}
        />

        <span>
          Loading submission history...
        </span>

      </div>

    );

  }


  /* ==========================================================
     PAGE
  ========================================================== */

  return (

    <div className="submission-history-page">

      {/* ====================================================
          HERO
      ==================================================== */}

      <section className="history-hero">

        <div className="history-hero-overlay" />


        <div className="history-hero-content">

          <h1>
            Submission History
          </h1>

          <p>
            View your past report submissions and their current status
          </p>


          <div className="history-cycle">

            <div className="history-cycle-icon">

              <CalendarDays
                size={21}
              />

            </div>


            <div>

              <strong>
                Current Surveillance Cycle
              </strong>

              <span>

                Week{" "}
                {currentWeek}

                <b>
                  •
                </b>

                {getCurrentWeekRange()}

              </span>

            </div>

          </div>

        </div>


        {/* ASSIGNED LOCATION */}

        <div className="history-assignment-card">

          <MapPin
            size={22}
            className="history-assignment-icon"
          />


          <div>

            <strong>
              Assigned Location
            </strong>


            <div>

              <span>
                Taluk
              </span>

              <b>
                :
              </b>

              <em>
                {talukName}
              </em>

            </div>


            <div>

              <span>
                District
              </span>

              <b>
                :
              </b>

              <em>
                {districtName}
              </em>

            </div>


            <div>

              <span>
                Role
              </span>

              <b>
                :
              </b>

              <em>
                Field Surveillance Agent
              </em>

            </div>

          </div>

        </div>

      </section>


      {/* ====================================================
          ERROR
      ==================================================== */}

      {error && (

        <div className="history-error">

          <Info
            size={17}
          />

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() =>
              loadHistory(true)
            }
          >
            Try Again
          </button>

        </div>

      )}


      {/* ====================================================
          FILTER BAR
      ==================================================== */}

      <section className="history-filter-panel">

        {/* FROM DATE */}

        <FilterField
          label="From Date"
        >

          <div className="history-input-wrap">

            <CalendarDays
              size={17}
            />

            <input
              type="date"
              value={fromDate}
              onChange={(event) =>
                setFromDate(
                  event.target.value
                )
              }
              aria-label="From date"
            />

          </div>

        </FilterField>


        {/* TO DATE */}

        <FilterField
          label="To Date"
        >

          <div className="history-input-wrap">

            <CalendarDays
              size={17}
            />

            <input
              type="date"
              value={toDateFilter}
              onChange={(event) =>
                setToDateFilter(
                  event.target.value
                )
              }
              aria-label="To date"
            />

          </div>

        </FilterField>


        {/* DISEASE */}

        <FilterField
          label="Disease"
        >

          <div className="history-select-wrap">

            <select
              value={disease}
              onChange={(event) =>
                setDisease(
                  event.target.value
                )
              }
              aria-label="Disease filter"
            >

              <option value="all">
                All Diseases
              </option>


              {diseaseOptions.map(
                (item) => (

                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>

                )
              )}

            </select>

          </div>

        </FilterField>


        {/* STATUS */}

        <FilterField
          label="Status"
        >

          <div className="history-select-wrap">

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value
                )
              }
              aria-label="Status filter"
            >

              <option value="all">
                All Status
              </option>

              <option value="Submitted">
                Submitted
              </option>

              <option value="Draft">
                Draft
              </option>

              <option value="Revised">
                Revised
              </option>

              <option value="Pending">
                Pending
              </option>

            </select>

          </div>

        </FilterField>


        {/* REFRESH */}

        <button
          type="button"
          className="history-refresh-button"
          onClick={() =>
            loadHistory(true)
          }
          disabled={refreshing}
        >

          <RefreshCw
            size={17}
            className={
              refreshing
                ? "history-spin"
                : ""
            }
          />

          <span>

            {refreshing
              ? "Refreshing"
              : "Refresh"}

          </span>

        </button>

      </section>


      {/* ====================================================
          SUMMARY CARDS
      ==================================================== */}

      <section className="history-summary-grid">

        <SummaryCard
          tone="total"
          icon={
            <FileText
              size={23}
            />
          }
          title="Total Submissions"
          value={
            summary.total
          }
          note="in selected period"
        />


        <SummaryCard
          tone="submitted"
          icon={
            <CheckCircle2
              size={24}
            />
          }
          title="Submitted"
          value={
            summary.submitted
          }
          note={`(${summary.submittedPercent})`}
        />


        <SummaryCard
          tone="draft"
          icon={
            <Clock3
              size={24}
            />
          }
          title="Draft"
          value={
            summary.draft
          }
          note={`(${summary.draftPercent})`}
        />


        <SummaryCard
          tone="revised"
          icon={
            <Bug
              size={23}
            />
          }
          title="Revised"
          value={
            summary.revised
          }
          note={`(${summary.revisedPercent})`}
        />

      </section>


      {/* ====================================================
          SUBMISSION HISTORY TABLE
      ==================================================== */}

      <section className="history-table-card">

        {/* TABLE HEADER */}

        <div className="history-table-heading">

          <div className="history-section-icon">

            <FileText
              size={19}
            />

          </div>

          <h2>
            Submission History
          </h2>

        </div>


        {/* TABLE */}

        <div className="history-table-scroll">

          <table className="history-table">

            <thead>

              <tr>

                <th>
                  Date &amp; Time
                </th>

                <th>
                  Disease(s)
                </th>

                <th>
                  Confirmed Cases
                </th>

                <th>
                  Suspected Cases
                </th>

                <th>
                  Severity
                </th>

                <th>
                  Status
                </th>

                <th>
                  Remarks
                </th>

                <th className="history-actions-heading">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody>

              {visibleReports.map(
                (report) => {

                  const statusValue =
                    report.uiStatus;


                  const confirmed =
                    Number(
                      report.confirmed_cases ??
                      report.cases ??
                      0
                    );


                  const suspected =
                    Number(
                      report.suspected_cases ??
                      0
                    );


                  return (

                    <tr
                      key={
                        report.id
                      }
                    >

                      {/* DATE */}

                      <td>

                        <div className="history-date-cell">

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


                      {/* DISEASE */}

                      <td>

                        <span className="history-disease-name">

                          {report.disease ||
                            "—"}

                        </span>

                      </td>


                      {/* CONFIRMED */}

                      <td>
                        {confirmed}
                      </td>


                      {/* SUSPECTED */}

                      <td>
                        {suspected}
                      </td>


                      {/* SEVERITY */}

                      <td>

                        <span
                          className={
                            `history-pill severity ${
                              getSeverityClass(
                                report.severity
                              )
                            }`
                          }
                        >

                          {report.severity ||
                            "Low"}

                        </span>

                      </td>


                      {/* STATUS */}

                      <td>

                        <span
                          className={
                            `history-pill status ${
                              getStatusClass(
                                statusValue
                              )
                            }`
                          }
                        >

                          {statusValue}

                        </span>

                      </td>


                      {/* REMARKS */}

                      <td>

                        <div className="history-remarks">

                          {report.remarks?.trim() ||
                            "—"}

                        </div>

                      </td>


                      {/* ACTION */}

                      <td className="history-actions-cell">

                        <button
                          type="button"
                          className="history-view-button"
                          onClick={() =>
                            setSelectedReport(
                              report
                            )
                          }
                          aria-label={
                            `View ${
                              report.disease ||
                              "disease"
                            } report`
                          }
                          title="View report"
                        >

                          <Eye
                            size={18}
                          />

                        </button>

                      </td>

                    </tr>

                  );

                }
              )}


              {/* EMPTY */}

              {!visibleReports.length && (

                <tr>

                  <td
                    colSpan="8"
                    className="history-empty-row"
                  >

                    <div>

                      <FileText
                        size={28}
                      />

                      <strong>
                        No submissions found
                      </strong>

                      <span>
                        Try changing your filters.
                      </span>

                      <button
                        type="button"
                        onClick={
                          clearFilters
                        }
                      >
                        Clear Filters
                      </button>

                    </div>

                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>


        {/* TABLE FOOTER */}

        <div className="history-table-footer">

          <span>

            Showing{" "}
            {visibleStart}
            {" - "}
            {visibleEnd}
            {" of "}
            {filteredReports.length}
            {" submissions"}

          </span>


          <div
            className="history-pagination"
            aria-label="Submission history pagination"
          >

            {/* PREVIOUS */}

            <button
              type="button"
              onClick={() =>
                setPage(
                  (value) =>
                    Math.max(
                      1,
                      value - 1
                    )
                )
              }
              disabled={
                page === 1
              }
              aria-label="Previous page"
            >

              <ChevronLeft
                size={16}
              />

            </button>


            {/* PAGE NUMBERS */}

            {Array.from(
              {
                length:
                  totalPages,
              },
              (
                _,
                index
              ) =>
                index + 1
            )
              .slice(
                0,
                5
              )
              .map(
                (pageNumber) => (

                  <button
                    type="button"
                    key={
                      pageNumber
                    }
                    className={
                      pageNumber ===
                      page
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      setPage(
                        pageNumber
                      )
                    }
                    aria-current={
                      pageNumber ===
                      page
                        ? "page"
                        : undefined
                    }
                  >

                    {pageNumber}

                  </button>

                )
              )}


            {/* NEXT */}

            <button
              type="button"
              onClick={() =>
                setPage(
                  (value) =>
                    Math.min(
                      totalPages,
                      value + 1
                    )
                )
              }
              disabled={
                page ===
                totalPages
              }
              aria-label="Next page"
            >

              <ChevronRight
                size={16}
              />

            </button>

          </div>

        </div>

      </section>


      {/* ====================================================
          VIEW ONLY MODAL
      ==================================================== */}

      <ViewReportModal
        report={
          selectedReport
        }
        onClose={() =>
          setSelectedReport(
            null
          )
        }
      />

    </div>

  );
}


/* ============================================================
   CURRENT WEEK RANGE
============================================================ */

function getCurrentWeekRange() {

  const today =
    new Date();


  const monday =
    new Date(
      today
    );


  const day =
    monday.getDay();


  const diff =
    day === 0
      ? -6
      : 1 - day;


  monday.setDate(
    monday.getDate() +
      diff
  );


  const sunday =
    new Date(
      monday
    );


  sunday.setDate(
    sunday.getDate() +
      6
  );


  const format =
    (
      date,
      includeYear = false
    ) =>

      date.toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          ...(includeYear
            ? {
                year: "numeric",
              }
            : {}),
        }
      );


  return (
    `${format(
      monday
    )} – ${format(
      sunday,
      true
    )}`
  );
}