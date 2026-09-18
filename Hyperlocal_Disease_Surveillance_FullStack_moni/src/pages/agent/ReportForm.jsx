import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Edit3,
  Eye,
  FileText,
  MapPin,
  Plus,
  Send,
  Trash2,
} from "lucide-react";

import { api } from "../../api";

import "./WeeklyDiseaseReport.css";


/* ============================================================
   DISEASE MASTER LIST
============================================================ */

const DISEASES = [
  "Dengue",
  "Malaria",
  "Typhoid",
  "Influenza",
  "Chikungunya",
  "Tuberculosis",
  "COVID-19",
  "Other",
];


/* ============================================================
   SEVERITY
============================================================ */

const SEVERITIES = [
  "Low",
  "Moderate",
  "High",
  "Critical",
];


/* ============================================================
   EMPTY FORM
============================================================ */

function createEmptyDisease() {
  const now =
    new Date();

  const date =
    now.toISOString()
      .split("T")[0];

  const time =
    now.toTimeString()
      .slice(0, 5);

  return {
    disease: "",
    confirmed_cases: "",
    suspected_cases: "",
    severity: "",
    remarks: "",
    preventive_measures: "",
    observation_date: date,
    observation_time: time,
  };
}


/* ============================================================
   MAP BACKEND -> FORM
============================================================ */

function mapReportToForm(
  report
) {
  if (!report) {
    return createEmptyDisease();
  }

  const createdAt =
    report.created_at
      ? new Date(
          report.created_at
        )
      : new Date();

  return {
    disease:
      report.disease ||
      report.disease_name ||
      "",

    confirmed_cases:
      report.confirmed_cases ??
      report.cases ??
      "",

    suspected_cases:
      report.suspected_cases ??
      "",

    severity:
      report.severity ||
      "",

    remarks:
      report.remarks ||
      "",

    preventive_measures:
      report.preventive_measures ||
      "",

    observation_date:
      report.observation_date ||
      createdAt
        .toISOString()
        .split("T")[0],

    observation_time:
      report.observation_time ||
      createdAt
        .toTimeString()
        .slice(0, 5),
  };
}


/* ============================================================
   MAP FORM -> BACKEND
============================================================ */

function mapFormToBackend(
  item
) {
  return {
    disease:
      item.disease?.trim() ||
      "",

    cases:
      item.confirmed_cases ===
        "" ||
      item.confirmed_cases ===
        null ||
      item.confirmed_cases ===
        undefined
        ? 0
        : Number(
            item.confirmed_cases
          ),

    suspected_cases:
      item.suspected_cases ===
        "" ||
      item.suspected_cases ===
        null ||
      item.suspected_cases ===
        undefined
        ? 0
        : Number(
            item.suspected_cases
          ),

    severity:
      item.severity ||
      "",

    remarks:
      item.remarks?.trim() ||
      "",

    preventive_measures:
      item.preventive_measures?.trim() ||
      "",
  };
}


/* ============================================================
   DATE FORMAT
============================================================ */

function formatReportDate(
  value
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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


/* ============================================================
   TIME FORMAT
============================================================ */

function formatReportTime(
  value
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  );
}


/* ============================================================
   COMPONENT
============================================================ */

export default function ReportForm({
  mode = "add",
  weekNumber,
  cycleDates,
  talukName = "Assigned Taluk",
  districtName = "Assigned District",
  onRefresh,
}) {
  const isEditMode =
    mode === "edit";


  /* ==========================================================
     STATE
  ========================================================== */

  const [
    items,
    setItems,
  ] = useState([
    createEmptyDisease(),
  ]);

  const [
    reports,
    setReports,
  ] = useState([]);

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    loadingExisting,
    setLoadingExisting,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    selectedReport,
    setSelectedReport,
  ] = useState(null);

  const [
    showAllReports,
    setShowAllReports,
  ] = useState(false);


  /* ==========================================================
     LOAD REPORTS
  ========================================================== */

  const loadReports =
    async () => {
      try {
        setLoadingExisting(
          true
        );

        setError("");

        const history =
          await api.getAgentHistory();

        const data =
          Array.isArray(
            history
          )
            ? history
            : [];

        const sorted =
          [...data].sort(
            (a, b) =>
              new Date(
                b.created_at
              ) -
              new Date(
                a.created_at
              )
          );

        setReports(
          sorted
        );


        /* ------------------------------------------------------
           EDIT MODE
        ------------------------------------------------------ */

        if (
          isEditMode &&
          sorted.length
        ) {
          const latest =
            sorted[0];

          const latestWeek =
            latest.week_number ??
            latest.week ??
            latest.reporting_week ??
            latest.current_week;

          let currentCycle;

          if (
            latestWeek !==
              undefined &&
            latestWeek !==
              null
          ) {
            currentCycle =
              sorted.filter(
                (report) =>
                  (
                    report.week_number ??
                    report.week ??
                    report.reporting_week ??
                    report.current_week
                  ) ===
                  latestWeek
              );
          } else {
            currentCycle =
              [latest];
          }

          const mapped =
            currentCycle.map(
              mapReportToForm
            );

          if (
            mapped.length
          ) {
            setItems(
              mapped
            );
          }
        }
      } catch (err) {
        setError(
          err.message ||
            "Unable to load weekly reports."
        );
      } finally {
        setLoadingExisting(
          false
        );
      }
    };


  useEffect(() => {
    loadReports();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditMode]);


  /* ==========================================================
     CURRENT WEEK REPORTS
  ========================================================== */

  const currentWeekReports =
    useMemo(() => {
      if (!reports.length) {
        return [];
      }

      if (
        weekNumber ===
        undefined ||
        weekNumber ===
          null
      ) {
        return reports.slice(
          0,
          4
        );
      }

      const matching =
        reports.filter(
          (report) =>
            Number(
              report.week_number ??
                report.week ??
                report.reporting_week ??
                report.current_week
            ) ===
            Number(
              weekNumber
            )
        );

      return matching.length
        ? matching
        : reports.slice(
            0,
            4
          );
    }, [
      reports,
      weekNumber,
    ]);


  /* ==========================================================
     SUMMARY
  ========================================================== */

  const summary =
    useMemo(() => {
      const source =
        currentWeekReports;

      const confirmed =
        source.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.confirmed_cases ??
                item.cases ??
                0
            ),
          0
        );

      const suspected =
        source.reduce(
          (
            total,
            item
          ) =>
            total +
            Number(
              item.suspected_cases ??
                0
            ),
          0
        );


      const diseaseCounts =
        {};

      source.forEach(
        (item) => {
          const name =
            item.disease ||
            item.disease_name;

          if (!name) {
            return;
          }

          diseaseCounts[
            name
          ] =
            (
              diseaseCounts[
                name
              ] || 0
            ) +
            Number(
              item.confirmed_cases ??
                item.cases ??
                0
            );
        }
      );


      let mostReported =
        "—";

      let mostReportedCases =
        0;

      Object.entries(
        diseaseCounts
      ).forEach(
        ([
          disease,
          count,
        ]) => {
          if (
            count >
            mostReportedCases
          ) {
            mostReported =
              disease;

            mostReportedCases =
              count;
          }
        }
      );


      const severityRank = {
        Low: 1,
        Moderate: 2,
        High: 3,
        Critical: 4,
      };

      let highestSeverity =
        "—";

      let highestRank =
        0;

      source.forEach(
        (item) => {
          const severity =
            item.severity;

          const rank =
            severityRank[
              severity
            ] || 0;

          if (
            rank >
            highestRank
          ) {
            highestRank =
              rank;

            highestSeverity =
              severity;
          }
        }
      );


      return {
        confirmed,
        suspected,
        mostReported,
        mostReportedCases,
        highestSeverity,
      };
    }, [
      currentWeekReports,
    ]);


  /* ==========================================================
     FORM UPDATE
  ========================================================== */

  const updateDisease = (
    index,
    field,
    value
  ) => {
    setItems(
      (previous) =>
        previous.map(
          (
            item,
            itemIndex
          ) =>
            itemIndex ===
            index
              ? {
                  ...item,
                  [field]:
                    value,
                }
              : item
        )
    );
  };


  /* ==========================================================
     ADD DISEASE
  ========================================================== */

  const addDisease = () => {
    setItems(
      (previous) => [
        ...previous,
        createEmptyDisease(),
      ]
    );
  };


  /* ==========================================================
     REMOVE DISEASE
  ========================================================== */

  const removeDisease = (
    index
  ) => {
    setItems(
      (previous) =>
        previous.filter(
          (
            _,
            itemIndex
          ) =>
            itemIndex !==
            index
        )
    );
  };


  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate =
    (validItems) => {
      if (
        !validItems.length
      ) {
        return "Please enter at least one disease before submitting.";
      }

      for (
        const item of validItems
      ) {
        if (
          !item.disease?.trim()
        ) {
          return "Please select a disease for every entry.";
        }

        if (
          item.confirmed_cases ===
            "" ||
          item.confirmed_cases ===
            null ||
          item.confirmed_cases ===
            undefined
        ) {
          return `Please enter confirmed cases for ${item.disease}.`;
        }

        if (
          Number(
            item.confirmed_cases
          ) < 0
        ) {
          return `Confirmed cases for ${item.disease} cannot be negative.`;
        }

        if (
          item.suspected_cases !==
            "" &&
          Number(
            item.suspected_cases
          ) < 0
        ) {
          return `Suspected cases for ${item.disease} cannot be negative.`;
        }

        if (
          !item.severity
        ) {
          return `Please select severity for ${item.disease}.`;
        }
      }

      return "";
    };


  /* ==========================================================
     SUBMIT
  ========================================================== */

  const handleSubmit =
    async (event) => {
      event.preventDefault();

      setError("");
      setSuccess("");

      const validItems =
        items.filter(
          (item) =>
            item.disease?.trim() ||
            item.confirmed_cases !==
              "" ||
            item.suspected_cases !==
              "" ||
            item.severity ||
            item.remarks?.trim() ||
            item.preventive_measures?.trim()
        );

      const validation =
        validate(
          validItems
        );

      if (validation) {
        setError(
          validation
        );

        return;
      }

      try {
        setLoading(true);


        /* ------------------------------------------------------
           CURRENT WEEK
        ------------------------------------------------------ */

        const status =
          await api.getAgentStatus();

        const currentWeek =
          status?.current_week;

        if (
          currentWeek ===
            undefined ||
          currentWeek ===
            null
        ) {
          throw new Error(
            "Unable to determine the current surveillance week."
          );
        }

        const currentYear =
          new Date().getFullYear();


        /* ------------------------------------------------------
           EDIT
        ------------------------------------------------------ */

        if (isEditMode) {
          const backendItems =
            validItems.map(
              mapFormToBackend
            );

          await api.submitWeeklyReport(
            backendItems,
            currentWeek,
            currentYear
          );

          setSuccess(
            "Weekly report updated successfully."
          );

          await loadReports();

          onRefresh?.();

          return;
        }


        /* ------------------------------------------------------
           ADD
        ------------------------------------------------------ */

        const currentReports =
          await api.getCurrentAgentReport();

        const existing =
          Array.isArray(
            currentReports
          )
            ? currentReports.map(
                (report) => ({
                  disease:
                    report.disease ||
                    "",

                  cases:
                    Number(
                      report.cases ||
                        0
                    ),

                  suspected_cases:
                    Number(
                      report.suspected_cases ||
                        0
                    ),

                  severity:
                    report.severity ||
                    "Low",

                  remarks:
                    report.remarks ||
                    "",

                  preventive_measures:
                    report.preventive_measures ||
                    "",
                })
              )
            : [];


        const incoming =
          validItems.map(
            mapFormToBackend
          );


        const merged =
          new Map();

        existing.forEach(
          (item) => {
            const key =
              item.disease
                .trim()
                .toLowerCase();

            merged.set(
              key,
              item
            );
          }
        );

        incoming.forEach(
          (item) => {
            const key =
              item.disease
                .trim()
                .toLowerCase();

            merged.set(
              key,
              item
            );
          }
        );


        await api.submitWeeklyReport(
          Array.from(
            merged.values()
          ),
          currentWeek,
          currentYear
        );


        setSuccess(
          "Weekly report submitted successfully."
        );


        setItems([
          createEmptyDisease(),
        ]);


        await loadReports();

        onRefresh?.();

      } catch (err) {
        setError(
          err.message ||
            "Unable to submit the weekly report."
        );
      } finally {
        setLoading(false);
      }
    };


  /* ==========================================================
     LOADING
  ========================================================== */

  if (loadingExisting) {
    return (
      <section className="weekly-report-page">

        <div className="weekly-report-loading">

          <RefreshIcon />

          <p>
            Loading weekly
            disease report...
          </p>

        </div>

      </section>
    );
  }


  /* ==========================================================
     REPORTS TO DISPLAY
  ========================================================== */

  const displayReports =
    showAllReports
      ? currentWeekReports
      : currentWeekReports.slice(
          0,
          4
        );


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <section className="weekly-report-page">


      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="weekly-report-hero">

        <div className="weekly-report-hero-overlay" />

        <div className="weekly-report-hero-content">

          <h1>
            Weekly Disease Report
          </h1>

          <p>
            Report disease cases
            and field observations
            for the current week
          </p>


          <div className="weekly-report-cycle">

            <div className="weekly-report-cycle-icon">
              <CalendarDays
                size={21}
              />
            </div>

            <div>

              <strong>
                Current Surveillance
                Cycle
              </strong>

              <span>
                Week{" "}
                {weekNumber ??
                  "—"}{" "}
                <b>•</b>{" "}
                {cycleDates ||
                  "Current surveillance cycle"}
              </span>

            </div>

          </div>

        </div>


        <div className="weekly-report-location-card">

          <MapPin size={23} />

          <div>

            <strong>
              Assigned Location
            </strong>

            <div>
              <span>
                Taluk
              </span>

              <b>:</b>

              <em>
                {talukName}
              </em>
            </div>

            <div>
              <span>
                District
              </span>

              <b>:</b>

              <em>
                {districtName}
              </em>
            </div>

            <div>
              <span>
                Role
              </span>

              <b>:</b>

              <em>
                Field Surveillance
                Agent
              </em>
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          NEW REPORT
      ====================================================== */}

      <form
        className="weekly-report-form-card"
        onSubmit={
          handleSubmit
        }
      >

        <div className="weekly-report-form-heading">

          <div className="weekly-report-title-wrap">

            <div className="weekly-report-title-icon">
              <FileText
                size={19}
              />
            </div>

            <h2>
              New Weekly Report
            </h2>

          </div>


          <button
            type="submit"
            className="weekly-submit-top-button"
            disabled={loading}
          >

            <Plus size={17} />

            {loading
              ? "Submitting..."
              : "Submit Report"}

          </button>

        </div>


        {/* ERROR */}

        {error && (
          <div className="weekly-report-alert error">
            <span>
              {error}
            </span>
          </div>
        )}


        {/* SUCCESS */}

        {success && (
          <div className="weekly-report-alert success">

            <CheckCircle2
              size={17}
            />

            <span>
              {success}
            </span>

          </div>
        )}


        <div className="weekly-report-form-inner">

          {items.map(
            (
              item,
              index
            ) => (

              <div
                className="weekly-disease-entry"
                key={index}
              >

                {items.length >
                  1 && (
                  <div className="weekly-entry-header">

                    <strong>
                      Disease{" "}
                      {index + 1}
                    </strong>

                    <button
                      type="button"
                      onClick={() =>
                        removeDisease(
                          index
                        )
                      }
                    >
                      <Trash2
                        size={14}
                      />

                      Remove
                    </button>

                  </div>
                )}


                {/* TOP FIELDS */}

                <div className="weekly-form-grid four-columns">

                  {/* DISEASE */}

                  <div className="weekly-field">

                    <label>
                      Disease{" "}
                      <span>*</span>
                    </label>

                    <div className="weekly-select-wrapper">

                      <select
                        value={
                          item.disease
                        }
                        onChange={(
                          event
                        ) =>
                          updateDisease(
                            index,
                            "disease",
                            event.target
                              .value
                          )
                        }
                      >

                        <option value="">
                          Select disease
                        </option>

                        {DISEASES.map(
                          (
                            disease
                          ) => (
                            <option
                              key={
                                disease
                              }
                              value={
                                disease
                              }
                            >
                              {disease}
                            </option>
                          )
                        )}

                      </select>

                      <ChevronDown
                        size={16}
                      />

                    </div>

                  </div>


                  {/* CONFIRMED */}

                  <div className="weekly-field">

                    <label>
                      Confirmed Cases{" "}
                      <span>*</span>
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        item.confirmed_cases
                      }
                      onChange={(
                        event
                      ) =>
                        updateDisease(
                          index,
                          "confirmed_cases",
                          event.target
                            .value
                        )
                      }
                      placeholder="0"
                    />

                  </div>


                  {/* SUSPECTED */}

                  <div className="weekly-field">

                    <label>
                      Suspected Cases{" "}
                      <span>*</span>
                    </label>

                    <input
                      type="number"
                      min="0"
                      value={
                        item.suspected_cases
                      }
                      onChange={(
                        event
                      ) =>
                        updateDisease(
                          index,
                          "suspected_cases",
                          event.target
                            .value
                        )
                      }
                      placeholder="0"
                    />

                  </div>


                  {/* SEVERITY */}

                  <div className="weekly-field">

                    <label>
                      Severity{" "}
                      <span>*</span>
                    </label>

                    <div className="weekly-select-wrapper">

                      <select
                        value={
                          item.severity
                        }
                        onChange={(
                          event
                        ) =>
                          updateDisease(
                            index,
                            "severity",
                            event.target
                              .value
                          )
                        }
                      >

                        <option value="">
                          Select severity
                        </option>

                        {SEVERITIES.map(
                          (
                            severity
                          ) => (
                            <option
                              key={
                                severity
                              }
                              value={
                                severity
                              }
                            >
                              {severity}
                            </option>
                          )
                        )}

                      </select>

                      <ChevronDown
                        size={16}
                      />

                    </div>

                  </div>

                </div>


                {/* SECOND ROW */}

                <div className="weekly-form-observation-grid">

                  {/* REMARKS */}

                  <div className="weekly-field">

                    <label>
                      Field Observations
                      {" / "}Remarks
                    </label>

                    <div className="weekly-textarea-wrapper">

                      <textarea
                        rows={4}
                        maxLength={500}
                        value={
                          item.remarks
                        }
                        onChange={(
                          event
                        ) =>
                          updateDisease(
                            index,
                            "remarks",
                            event.target
                              .value
                          )
                        }
                        placeholder="Enter any additional observations, symptoms, affected areas, etc."
                      />

                      <span>
                        {
                          item.remarks
                            ?.length ||
                          0
                        }
                        /500
                      </span>

                    </div>

                  </div>


                  {/* DATE + TIME */}

                  <div className="weekly-observation-side">

                    <div className="weekly-field">

                      <label>
                        Observation Date
                        {" & "}Time
                      </label>

                      <div className="weekly-date-time-grid">

                        <div className="weekly-input-icon">

                          <CalendarDays
                            size={17}
                          />

                          <input
                            type="date"
                            value={
                              item.observation_date
                            }
                            onChange={(
                              event
                            ) =>
                              updateDisease(
                                index,
                                "observation_date",
                                event.target
                                  .value
                              )
                            }
                          />

                        </div>


                        <div className="weekly-input-icon">

                          <Clock3
                            size={17}
                          />

                          <input
                            type="time"
                            value={
                              item.observation_time
                            }
                            onChange={(
                              event
                            ) =>
                              updateDisease(
                                index,
                                "observation_time",
                                event.target
                                  .value
                              )
                            }
                          />

                        </div>

                      </div>

                    </div>

                  </div>

                </div>

              </div>

            )
          )}


          {/* ADD DISEASE */}

          <button
            type="button"
            className="weekly-add-disease"
            onClick={
              addDisease
            }
          >

            <Plus size={16} />

            Add Another Disease

          </button>


          {/* BOTTOM SUBMIT */}

          <div className="weekly-form-footer">

            <button
              type="submit"
              className="weekly-submit-button"
              disabled={loading}
            >

              <Send size={16} />

              {loading
                ? isEditMode
                  ? "Updating..."
                  : "Submitting..."
                : isEditMode
                  ? "Update Weekly Report"
                  : "Submit Report"}

            </button>

          </div>

        </div>

      </form>


      {/* ======================================================
          BOTTOM CONTENT
      ====================================================== */}

      <section className="weekly-report-bottom-grid">


        {/* ====================================================
            REPORT TABLE
        ==================================================== */}

        <div className="weekly-reports-card">

          <div className="weekly-card-header">

            <div className="weekly-card-title">

              <div className="weekly-card-icon green">
                <FileText
                  size={17}
                />
              </div>

              <h2>
                This Week's Reports
              </h2>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowAllReports(
                  (value) =>
                    !value
                )
              }
            >
              {showAllReports
                ? "Show Less"
                : "View All"}
            </button>

          </div>


          <div className="weekly-reports-table-wrapper">

            <table className="weekly-reports-table">

              <thead>

                <tr>

                  <th>
                    Date &amp; Time
                  </th>

                  <th>
                    Disease
                  </th>

                  <th>
                    Confirmed
                  </th>

                  <th>
                    Suspected
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

                {displayReports.map(
                  (
                    report,
                    index
                  ) => {

                    const reportDate =
                      report.created_at;

                    const severity =
                      report.severity ||
                      "Low";

                    const status =
                      report.status ||
                      "Submitted";

                    return (
                      <tr
                        key={
                          report.id ??
                          index
                        }
                      >

                        <td>

                          <div className="weekly-date-cell">

                            <strong>
                              {formatReportDate(
                                reportDate
                              )}
                            </strong>

                            <span>
                              {formatReportTime(
                                reportDate
                              )}
                            </span>

                          </div>

                        </td>


                        <td>
                          {
                            report.disease ||
                            report.disease_name ||
                            "—"
                          }
                        </td>


                        <td>
                          {Number(
                            report.confirmed_cases ??
                              report.cases ??
                              0
                          )}
                        </td>


                        <td>
                          {Number(
                            report.suspected_cases ??
                              0
                          )}
                        </td>


                        <td>

                          <span
                            className={`weekly-severity-pill ${severity.toLowerCase()}`}
                          >
                            {
                              severity
                            }
                          </span>

                        </td>


                        <td>

                          <span
                            className={`weekly-status-pill ${
                              status
                                .toLowerCase()
                                .includes(
                                  "draft"
                                )
                                ? "draft"
                                : "submitted"
                            }`}
                          >
                            {
                              status
                            }
                          </span>

                        </td>


                        <td>

                          <div className="weekly-action-buttons">

                            <button
                              type="button"
                              title="View report"
                              onClick={() =>
                                setSelectedReport(
                                  report
                                )
                              }
                            >
                              <Eye
                                size={15}
                              />
                            </button>

                            <button
                              type="button"
                              title="Edit report"
                              onClick={() => {
                                const mapped =
                                  mapReportToForm(
                                    report
                                  );

                                setItems([
                                  mapped,
                                ]);

                                setSelectedReport(
                                  null
                                );

                                window.scrollTo(
                                  {
                                    top: 0,
                                    behavior:
                                      "smooth",
                                  }
                                );
                              }}
                            >
                              <Edit3
                                size={15}
                              />
                            </button>

                          </div>

                        </td>

                      </tr>
                    );
                  }
                )}


                {!displayReports.length && (
                  <tr>

                    <td
                      colSpan="7"
                      className="weekly-empty-table"
                    >

                      <FileText
                        size={25}
                      />

                      <span>
                        No reports have
                        been submitted
                        for this cycle
                        yet.
                      </span>

                    </td>

                  </tr>
                )}

              </tbody>

            </table>

          </div>

        </div>


        {/* ====================================================
            QUICK SUMMARY
        ==================================================== */}

        <div className="weekly-summary-card">

          <div className="weekly-card-header">

            <div className="weekly-card-title">

              <div className="weekly-card-icon summary">
                <CheckCircle2
                  size={17}
                />
              </div>

              <h2>
                Quick Summary
              </h2>

            </div>

          </div>


          <div className="weekly-summary-grid">

            {/* CONFIRMED */}

            <div className="weekly-summary-tile confirmed">

              <div className="weekly-summary-icon">
                <span>
                  +
                </span>
              </div>

              <div>

                <span>
                  Total Confirmed
                  Cases
                </span>

                <strong>
                  {
                    summary.confirmed
                  }
                </strong>

                <small>
                  Current cycle
                </small>

              </div>

            </div>


            {/* SUSPECTED */}

            <div className="weekly-summary-tile suspected">

              <div className="weekly-summary-icon">
                !
              </div>

              <div>

                <span>
                  Total Suspected
                  Cases
                </span>

                <strong>
                  {
                    summary.suspected
                  }
                </strong>

                <small>
                  Current cycle
                </small>

              </div>

            </div>


            {/* MOST REPORTED */}

            <div className="weekly-summary-tile disease">

              <div className="weekly-summary-icon">
                <CheckCircle2
                  size={16}
                />
              </div>

              <div>

                <span>
                  Most Reported
                  Disease
                </span>

                <strong className="summary-text">
                  {
                    summary.mostReported
                  }
                </strong>

                <small>
                  {summary.mostReportedCases
                    ? `(${summary.mostReportedCases} cases)`
                    : "Current cycle"}
                </small>

              </div>

            </div>


            {/* HIGHEST SEVERITY */}

            <div className="weekly-summary-tile severity">

              <div className="weekly-summary-icon">
                ↑
              </div>

              <div>

                <span>
                  Highest Severity
                </span>

                <strong className="summary-text">
                  {
                    summary.highestSeverity
                  }
                </strong>

                <small>
                  Current cycle
                </small>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          VIEW REPORT MODAL
      ====================================================== */}

      {selectedReport && (
        <div
          className="weekly-report-modal-backdrop"
          onMouseDown={() =>
            setSelectedReport(
              null
            )
          }
        >

          <div
            className="weekly-report-modal"
            onMouseDown={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="weekly-report-modal-header">

              <div>

                <h3>
                  Report Details
                </h3>

                <p>
                  {
                    selectedReport.disease
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedReport(
                    null
                  )
                }
              >
                ×
              </button>

            </div>


            <div className="weekly-report-modal-body">

              <div>
                <span>
                  Confirmed Cases
                </span>

                <strong>
                  {selectedReport.confirmed_cases ??
                    selectedReport.cases ??
                    0}
                </strong>
              </div>


              <div>
                <span>
                  Suspected Cases
                </span>

                <strong>
                  {
                    selectedReport.suspected_cases ??
                    0
                  }
                </strong>
              </div>


              <div>
                <span>
                  Severity
                </span>

                <strong>
                  {
                    selectedReport.severity ||
                    "—"
                  }
                </strong>
              </div>


              <div className="full">

                <span>
                  Field Observations
                </span>

                <p>
                  {
                    selectedReport.remarks ||
                    "No observations provided."
                  }
                </p>

              </div>

            </div>

          </div>

        </div>
      )}

    </section>
  );
}


/* ============================================================
   LOADING ICON
============================================================ */

function RefreshIcon() {
  return (
    <div className="weekly-loading-spinner">
      <Clock3 size={22} />
    </div>
  );
}