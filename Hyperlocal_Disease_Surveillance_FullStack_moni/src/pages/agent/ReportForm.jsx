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
  RefreshCw,
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
  const now = new Date();

  const date = now.toISOString().split("T")[0];

  const time = now.toTimeString().slice(0, 5);

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

function mapReportToForm(report) {
  if (!report) {
    return createEmptyDisease();
  }

  const createdAt = report.created_at
    ? new Date(report.created_at)
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
      createdAt.toISOString().split("T")[0],

    observation_time:
      report.observation_time ||
      createdAt.toTimeString().slice(0, 5),
  };
}


/* ============================================================
   MAP FORM -> BACKEND
============================================================ */

function mapFormToBackend(item) {
  return {
    disease:
      item.disease?.trim() ||
      "",

    cases:
      item.confirmed_cases === "" ||
      item.confirmed_cases === null ||
      item.confirmed_cases === undefined
        ? 0
        : Number(item.confirmed_cases),

    suspected_cases:
      item.suspected_cases === "" ||
      item.suspected_cases === null ||
      item.suspected_cases === undefined
        ? 0
        : Number(item.suspected_cases),

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

function formatReportDate(value) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(date.getDate()).padStart(2, "0");

  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ][date.getMonth()];

  return `${day} ${month} ${date.getFullYear()}`;
}


/* ============================================================
   TIME FORMAT
============================================================ */

function formatReportTime(value) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date
    .toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .toUpperCase();
}


/* ============================================================
   COMPONENT
============================================================ */

export default function ReportForm({
  weekNumber,
  cycleDates,
  talukName = "Assigned Taluk",
  districtName = "Assigned District",
  onRefresh,
}) {


  /* ==========================================================
     STATE
  ========================================================== */

  const [items, setItems] = useState([
    createEmptyDisease(),
  ]);

  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(false);

  const [loadingExisting, setLoadingExisting] =
    useState(true);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  /* Used by the View icon/modal. */
  const [viewReport, setViewReport] = useState(null);

  /* Used by the inline Edit Weekly Report panel. */
  const [editReport, setEditReport] = useState(null);

  const [editDraft, setEditDraft] = useState(null);

  const [showAllReports, setShowAllReports] =
    useState(false);


  /* ==========================================================
     LOAD REPORTS
  ========================================================== */

  const loadReports = async () => {
    try {
      setLoadingExisting(true);

      setError("");

      const history = await api.getAgentHistory();

      const data = Array.isArray(history)
        ? history
        : [];

      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.created_at) -
          new Date(a.created_at)
      );

      setReports(sorted);

      /*
       * Existing reports stay in the right-side table.
       * The main form remains a fresh "New Weekly Report"
       * form; editing is handled by the inline editor.
       */
    } catch (err) {
      setError(
        err.message ||
          "Unable to load weekly reports."
      );
    } finally {
      setLoadingExisting(false);
    }
  };


  useEffect(() => {
    loadReports();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  /* ==========================================================
     CURRENT WEEK REPORTS
  ========================================================== */

  const currentWeekReports = useMemo(() => {
    if (!reports.length) {
      return [];
    }

    if (
      weekNumber === undefined ||
      weekNumber === null
    ) {
      return reports.slice(0, 4);
    }

    const matching = reports.filter(
      (report) =>
        Number(
          report.week_number ??
          report.week ??
          report.reporting_week ??
          report.current_week
        ) === Number(weekNumber)
    );

    return matching.length
      ? matching
      : reports.slice(0, 4);
  }, [reports, weekNumber]);


  /* ==========================================================
     FORM UPDATE
  ========================================================== */

  const updateDisease = (
    index,
    field,
    value
  ) => {
    setItems((previous) =>
      previous.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      )
    );
  };


  /* ==========================================================
     ADD DISEASE
  ========================================================== */

  const addDisease = () => {
    setItems((previous) => [
      ...previous,
      createEmptyDisease(),
    ]);
  };


  /* ==========================================================
     REMOVE DISEASE
  ========================================================== */

  const removeDisease = (index) => {
    setItems((previous) => {
      if (previous.length === 1) {
        return [createEmptyDisease()];
      }

      return previous.filter(
        (_, itemIndex) =>
          itemIndex !== index
      );
    });
  };


  /* ==========================================================
     VALIDATION
  ========================================================== */

  const validate = (validItems) => {
    if (!validItems.length) {
      return (
        "Please enter at least one disease before submitting."
      );
    }

    for (const item of validItems) {
      if (!item.disease?.trim()) {
        return (
          "Please select a disease for every entry."
        );
      }

      if (
        item.confirmed_cases === "" ||
        item.confirmed_cases === null ||
        item.confirmed_cases === undefined
      ) {
        return `Please enter confirmed cases for ${item.disease}.`;
      }

      if (Number(item.confirmed_cases) < 0) {
        return `Confirmed cases for ${item.disease} cannot be negative.`;
      }

      if (
        item.suspected_cases !== "" &&
        Number(item.suspected_cases) < 0
      ) {
        return `Suspected cases for ${item.disease} cannot be negative.`;
      }

      if (!item.severity) {
        return `Please select severity for ${item.disease}.`;
      }

      if (!item.observation_date) {
        return `Please enter the observation date for ${item.disease}.`;
      }

      if (!item.observation_time) {
        return `Please enter the observation time for ${item.disease}.`;
      }
    }

    return "";
  };


  /* ============================================================
     SUBMIT MAIN WEEKLY REPORT
  ============================================================ */

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    setSuccess("");

    const validItems = items.filter(
      (item) =>
        item.disease?.trim() ||
        item.confirmed_cases !== "" ||
        item.suspected_cases !== "" ||
        item.severity ||
        item.remarks?.trim() ||
        item.preventive_measures?.trim()
    );

    const validation =
      validate(validItems);

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setLoading(true);

      const status =
        await api.getAgentStatus();

      const currentWeek =
        status?.current_week;

      if (
        currentWeek === undefined ||
        currentWeek === null
      ) {
        throw new Error(
          "Unable to determine the current surveillance week."
        );
      }

      const currentYear =
        new Date().getFullYear();

      const backendItems =
        validItems.map(mapFormToBackend);

      /*
       * The backend endpoint already performs
       * create/update/removal for the entire
       * current-week set.
       */

      await api.submitWeeklyReport(
        backendItems,
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


  /* ============================================================
     INLINE EDIT PANEL
  ============================================================ */

  const openEditReport = (report) => {
    setViewReport(null);

    setEditReport(report);

    setEditDraft(
      mapReportToForm(report)
    );

    /*
     * Move the inline editor into view so the user
     * immediately sees the panel represented in
     * the reference design.
     */

    window.requestAnimationFrame(() => {
      document
        .querySelector(
          ".weekly-inline-edit-card"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
    });
  };


  const updateEditDraft = (
    field,
    value
  ) => {
    setEditDraft((previous) =>
      previous
        ? {
            ...previous,
            [field]: value,
          }
        : previous
    );
  };


  const handleInlineEdit = async (
    event
  ) => {
    event.preventDefault();

    if (!editDraft || !editReport) {
      return;
    }

    setError("");

    setSuccess("");

    const validation =
      validate([editDraft]);

    if (validation) {
      setError(validation);
      return;
    }

    try {
      setLoading(true);

      const status =
        await api.getAgentStatus();

      const currentWeek =
        status?.current_week;

      if (
        currentWeek === undefined ||
        currentWeek === null
      ) {
        throw new Error(
          "Unable to determine the current surveillance week."
        );
      }

      const currentYear =
        new Date().getFullYear();

      /*
       * The API accepts the complete current-week
       * collection and reconciles it by disease.
       *
       * Preserve every other report while replacing
       * the edited entry.
       */

      const editedId =
        editReport.id;

      const editedOriginalDisease =
        (
          editReport.disease ||
          editReport.disease_name ||
          ""
        )
          .trim()
          .toLowerCase();

      const preserved =
        currentWeekReports
          .filter(
            (report) =>
              report.id !== editedId &&
              (
                report.disease ||
                report.disease_name ||
                ""
              )
                .trim()
                .toLowerCase() !==
              editedOriginalDisease
          )
          .map(mapReportToForm)
          .map(mapFormToBackend);

      const newDiseaseKey =
        editDraft.disease
          .trim()
          .toLowerCase();

      const duplicate =
        preserved.some(
          (report) =>
            report.disease
              .trim()
              .toLowerCase() ===
            newDiseaseKey
        );

      if (duplicate) {
        throw new Error(
          "That disease already exists in this week's report. Edit the existing entry instead."
        );
      }

      await api.submitWeeklyReport(
        [
          ...preserved,
          mapFormToBackend(editDraft),
        ],
        currentWeek,
        currentYear
      );

      setSuccess(
        "Weekly report updated successfully."
      );

      setEditReport(null);

      setEditDraft(null);

      await loadReports();

      onRefresh?.();

    } catch (err) {
      setError(
        err.message ||
          "Unable to update the weekly report."
      );
    } finally {
      setLoading(false);
    }
  };


  /* ============================================================
     LOADING
  ============================================================ */

  if (loadingExisting) {
    return (
      <section className="weekly-report-page">

        <div className="weekly-report-loading">

          <RefreshCw size={22} />

          <p>
            Loading weekly disease report...
          </p>

        </div>

      </section>
    );
  }


  /* ============================================================
     REPORTS TO DISPLAY
  ============================================================ */

  const displayReports =
    showAllReports
      ? currentWeekReports
      : currentWeekReports.slice(
          0,
          4
        );


  /* ============================================================
     RENDER
  ============================================================ */

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
            Report disease cases and field observations for the current week
          </p>

          <div className="weekly-report-cycle">

            <div className="weekly-report-cycle-icon">

              <CalendarDays
                size={20}
              />

            </div>

            <div>

              <strong>
                Current Surveillance Cycle
              </strong>

              <span>
                Week{" "}
                {weekNumber ?? "—"}{" "}
                <b>•</b>{" "}
                {cycleDates ||
                  "Current surveillance cycle"}
              </span>

            </div>

          </div>

        </div>


        <div className="weekly-report-location-card">

          <MapPin size={22} />

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


      {/* ======================================================
          MAIN TWO-COLUMN CONTENT
      ====================================================== */}

      <div className="weekly-report-main-grid">

        {/* ====================================================
            LEFT: NEW WEEKLY REPORT
        ==================================================== */}

        <form
          className="weekly-report-form-card"
          onSubmit={handleSubmit}
        >

          <div className="weekly-report-form-heading">

            <div className="weekly-report-title-wrap">

              <div className="weekly-report-title-icon">

                <FileText
                  size={18}
                />

              </div>

              <div>

                <h2>
                  New Weekly Report
                </h2>

                <p>
                  Add new disease(s) and submit your weekly report
                </p>

              </div>

            </div>

          </div>


          {/* ALERTS */}

          {error && (
            <div className="weekly-report-alert error">

              <span>
                {error}
              </span>

            </div>
          )}


          {success && (
            <div className="weekly-report-alert success">

              <CheckCircle2
                size={16}
              />

              <span>
                {success}
              </span>

            </div>
          )}


          <div className="weekly-report-form-inner">

            {items.map(
              (item, index) => (

                <div
                  className="weekly-disease-entry-card"
                  key={index}
                >

                  <div className="weekly-entry-strip">

                    <div className="weekly-entry-number">
                      {index + 1}
                    </div>

                    <RefreshCw
                      size={12}
                    />

                    <button
                      type="button"
                      className="weekly-entry-remove"
                      title="Clear disease entry"
                      onClick={() =>
                        removeDisease(index)
                      }
                    >

                      <Trash2
                        size={15}
                      />

                    </button>

                  </div>


                  <div className="weekly-disease-entry-body">

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
                            size={15}
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
                            size={15}
                          />

                        </div>

                      </div>

                    </div>


                    {/* OBSERVATIONS + PRECAUTIONS */}

                    <div className="weekly-form-observation-grid">

                      {/* REMARKS */}

                      <div className="weekly-field">

                        <label>
                          Field Observations / Remarks
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
                            placeholder="Enter field observations and remarks..."
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


                      {/* PRECAUTIONARY MEASURES */}

                      <div className="weekly-field">

                        <label>
                          Precautionary Measures
                        </label>

                        <div className="weekly-textarea-wrapper">

                          <textarea
                            rows={4}
                            maxLength={500}
                            value={
                              item.preventive_measures
                            }
                            onChange={(
                              event
                            ) =>
                              updateDisease(
                                index,
                                "preventive_measures",
                                event.target
                                  .value
                              )
                            }
                            placeholder="Enter precautionary measures for this disease..."
                          />

                          <span>
                            {
                              item
                                .preventive_measures
                                ?.length ||
                              0
                            }
                            /500
                          </span>

                        </div>

                      </div>

                    </div>


                    {/* OBSERVATION DATE + TIME */}

                    <div className="weekly-date-time-row">

                      {/* DATE */}

                      <div className="weekly-field">

                        <label>
                          Observation Date{" "}
                          <span>*</span>
                        </label>

                        <div className="weekly-input-icon">

                          <CalendarDays
                            size={16}
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

                      </div>


                      {/* TIME */}

                      <div className="weekly-field">

                        <label>
                          Observation Time{" "}
                          <span>*</span>
                        </label>

                        <div className="weekly-input-icon">

                          <Clock3
                            size={16}
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

              <Plus
                size={15}
              />

              Add Another Disease

            </button>


            {/* BOTTOM SUBMIT */}

            <div className="weekly-form-footer">

              <button
                type="submit"
                className="weekly-submit-button"
                disabled={loading}
              >

                <Send
                  size={15}
                />

                {loading
                  ? "Submitting..."
                  : "Submit Weekly Report"}

              </button>

            </div>

          </div>

        </form>


        {/* ====================================================
            RIGHT COLUMN
        ==================================================== */}

        <div className="weekly-report-right-column">

          {/* ==================================================
              THIS WEEK'S REPORTS
          ================================================== */}

          <div className="weekly-reports-card">

            <div className="weekly-card-header">

              <div className="weekly-card-title">

                <div className="weekly-card-icon green">

                  <FileText
                    size={16}
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
                              {severity}
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
                              {status}
                            </span>

                          </td>


                          <td>

                            <div className="weekly-action-buttons">

                              {/* VIEW */}

                              <button
                                type="button"
                                title="View report"
                                onClick={() =>
                                  setViewReport(
                                    report
                                  )
                                }
                              >

                                <Eye
                                  size={15}
                                />

                              </button>


                              {/* EDIT */}

                              <button
                                type="button"
                                title="Edit report"
                                onClick={() =>
                                  openEditReport(
                                    report
                                  )
                                }
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
                          size={24}
                        />

                        <span>
                          No reports have been submitted
                          for this cycle yet.
                        </span>

                      </td>

                    </tr>
                  )}

                </tbody>

              </table>

            </div>

          </div>


          {/* ==================================================
              INFORMATION NOTE
          ================================================== */}

          <div className="weekly-report-edit-note">

            <div className="weekly-report-note-icon">

              <span>
                i
              </span>

            </div>

            <p>
              Click on the edit icon to modify an existing report.
              The form will be populated with the selected report details.
            </p>

          </div>


          {/* ==================================================
              INLINE EDIT PANEL
          ================================================== */}

          {editReport && editDraft && (
            <form
              className="weekly-inline-edit-card"
              onSubmit={
                handleInlineEdit
              }
            >

              <div className="weekly-inline-edit-header">

                <div className="weekly-inline-edit-title">

                  <div className="weekly-inline-edit-icon">

                    <Edit3
                      size={17}
                    />

                  </div>

                  <h2>

                    Edit Weekly Report

                    <span>
                      {" "}
                      (When Edit is Clicked)
                    </span>

                  </h2>

                </div>

              </div>


              <div className="weekly-inline-edit-body">

                {/* TOP EDIT FIELDS */}

                <div className="weekly-inline-grid four-columns">

                  {/* DISEASE */}

                  <div className="weekly-field">

                    <label>
                      Disease{" "}
                      <span>*</span>
                    </label>

                    <div className="weekly-select-wrapper">

                      <select
                        value={
                          editDraft.disease
                        }
                        onChange={(
                          event
                        ) =>
                          updateEditDraft(
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
                        size={14}
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
                        editDraft.confirmed_cases
                      }
                      onChange={(
                        event
                      ) =>
                        updateEditDraft(
                          "confirmed_cases",
                          event.target
                            .value
                        )
                      }
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
                        editDraft.suspected_cases
                      }
                      onChange={(
                        event
                      ) =>
                        updateEditDraft(
                          "suspected_cases",
                          event.target
                            .value
                        )
                      }
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
                          editDraft.severity
                        }
                        onChange={(
                          event
                        ) =>
                          updateEditDraft(
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
                        size={14}
                      />

                    </div>

                  </div>

                </div>


                {/* EDIT TEXT AREAS */}

                <div className="weekly-inline-text-grid">

                  {/* REMARKS */}

                  <div className="weekly-field">

                    <label>
                      Field Observations / Remarks
                    </label>

                    <div className="weekly-textarea-wrapper">

                      <textarea
                        rows={2}
                        maxLength={500}
                        value={
                          editDraft.remarks
                        }
                        onChange={(
                          event
                        ) =>
                          updateEditDraft(
                            "remarks",
                            event.target
                              .value
                          )
                        }
                      />

                      <span>
                        {
                          editDraft.remarks
                            ?.length ||
                          0
                        }
                        /500
                      </span>

                    </div>

                  </div>


                  {/* PRECAUTIONS */}

                  <div className="weekly-field">

                    <label>
                      Precautionary Measures
                    </label>

                    <div className="weekly-textarea-wrapper">

                      <textarea
                        rows={2}
                        maxLength={500}
                        value={
                          editDraft
                            .preventive_measures
                        }
                        onChange={(
                          event
                        ) =>
                          updateEditDraft(
                            "preventive_measures",
                            event.target
                              .value
                          )
                        }
                      />

                      <span>
                        {
                          editDraft
                            .preventive_measures
                            ?.length ||
                          0
                        }
                        /500
                      </span>

                    </div>

                  </div>

                </div>


                {/* DATE / TIME / BUTTONS */}

                <div className="weekly-inline-bottom-row">

                  {/* DATE */}

                  <div className="weekly-field">

                    <label>
                      Observation Date{" "}
                      <span>*</span>
                    </label>

                    <div className="weekly-input-icon">

                      <CalendarDays
                        size={15}
                      />

                      <input
                        type="date"
                        value={
                          editDraft
                            .observation_date
                        }
                        onChange={(
                          event
                        ) =>
                          updateEditDraft(
                            "observation_date",
                            event.target
                              .value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* TIME */}

                  <div className="weekly-field">

                    <label>
                      Observation Time{" "}
                      <span>*</span>
                    </label>

                    <div className="weekly-input-icon">

                      <Clock3
                        size={15}
                      />

                      <input
                        type="time"
                        value={
                          editDraft
                            .observation_time
                        }
                        onChange={(
                          event
                        ) =>
                          updateEditDraft(
                            "observation_time",
                            event.target
                              .value
                          )
                        }
                      />

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div className="weekly-inline-actions">

                    <button
                      type="button"
                      className="weekly-cancel-button"
                      onClick={() => {
                        setEditReport(null);
                        setEditDraft(null);
                      }}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="weekly-update-button"
                      disabled={loading}
                    >

                      <Send
                        size={14}
                      />

                      {loading
                        ? "Updating..."
                        : "Update Weekly Report"}

                    </button>

                  </div>

                </div>

              </div>

            </form>
          )}

        </div>

      </div>


      {/* ======================================================
          VIEW REPORT MODAL
      ====================================================== */}

      {viewReport && (
        <div
          className="weekly-report-modal-backdrop"
          onMouseDown={() =>
            setViewReport(null)
          }
        >

          <div
            className="weekly-report-modal"
            onMouseDown={(event) =>
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
                    viewReport.disease ||
                    viewReport.disease_name
                  }
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setViewReport(null)
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
                  {
                    viewReport.confirmed_cases ??
                    viewReport.cases ??
                    0
                  }
                </strong>

              </div>


              <div>

                <span>
                  Suspected Cases
                </span>

                <strong>
                  {
                    viewReport.suspected_cases ??
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
                    viewReport.severity ||
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
                    viewReport.remarks ||
                    "No observations provided."
                  }
                </p>

              </div>


              <div className="full">

                <span>
                  Precautionary Measures
                </span>

                <p>
                  {
                    viewReport.preventive_measures ||
                    "No precautionary measures provided."
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