import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import api from "../../api";


// ============================================================
// MEDICAL SUPERVISOR COMPONENTS
// ============================================================

import MedicalSupervisorLayout from "./components/MedicalSupervisorLayout";

import Overview from "./components/Overview";

import DiseaseReports from "./components/DiseaseReports";

import RiskMap from "./components/RiskMap";

import SurveillanceAnalytics from "./components/SurveillanceAnalytics";

import AgentOversight from "./components/AgentOversight";

import Alerts from "./components/Alerts";

import ActivityLogs from "./components/ActivityLogs";

import HomeReliefManagement from "./HomeReliefManagement";

import {
  Loading,
} from "./components/MedicalUi";


// ============================================================
// WEEK HELPERS
// ============================================================

function normalizeWeekNumber(
  weekNumber,
  year
) {
  if (
    weekNumber === undefined ||
    weekNumber === null ||
    weekNumber === ""
  ) {
    return null;
  }

  const numericWeek =
    Number(
      weekNumber
    );

  if (
    !Number.isFinite(
      numericWeek
    )
  ) {
    return null;
  }

  /*
   * Backend normally stores:
   *
   * YYYYWW
   *
   * Example:
   *
   * 202635
   *
   * Older records may contain:
   *
   * 35
   */

  if (
    numericWeek >= 1000
  ) {
    return numericWeek;
  }

  const numericYear =
    Number(
      year
    );

  if (
    Number.isFinite(
      numericYear
    ) &&
    numericYear >= 2000
  ) {
    return (
      numericYear * 100 +
      numericWeek
    );
  }

  return null;
}


// ============================================================
// GET ISO WEEK FROM DATE
// ============================================================

function getISOWeekFromDate(
  value
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  const utcDate =
    new Date(
      Date.UTC(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
      )
    );

  const day =
    utcDate.getUTCDay() || 7;

  utcDate.setUTCDate(
    utcDate.getUTCDate() +
      4 -
      day
  );

  const yearStart =
    new Date(
      Date.UTC(
        utcDate.getUTCFullYear(),
        0,
        1
      )
    );

  const week =
    Math.ceil(
      (
        (
          (
            utcDate -
            yearStart
          ) /
          86400000
        ) +
        1
      ) /
        7
    );

  return (
    utcDate.getUTCFullYear() *
      100 +
    week
  );
}


// ============================================================
// BUILD AVAILABLE REPORTING WEEKS
// ============================================================

function buildAvailableWeeks(
  reports
) {
  if (
    !Array.isArray(
      reports
    )
  ) {
    return [];
  }

  const map =
    new Map();

  for (
    const report of reports
  ) {
    let value =
      normalizeWeekNumber(
        report?.week_number,
        report?.year
      );

    /*
     * Fallback for older records.
     */

    if (!value) {
      value =
        getISOWeekFromDate(
          report?.created_at
        );
    }

    if (!value) {
      continue;
    }

    const numericValue =
      Number(
        value
      );

    const year =
      Math.floor(
        numericValue /
          100
      );

    const week =
      numericValue %
      100;

    if (
      week < 1 ||
      week > 53
    ) {
      continue;
    }

    if (
      !map.has(
        numericValue
      )
    ) {
      map.set(
        numericValue,
        {
          value:
            numericValue,

          year,

          week,
        }
      );
    }
  }

  return Array.from(
    map.values()
  ).sort(
    (
      a,
      b
    ) =>
      b.value -
      a.value
  );
}


// ============================================================
// CREATE ACTIVITY LOG DATA
// ============================================================

function buildActivityLogs(
  overview,
  reports
) {
  /*
   * If the backend eventually provides a dedicated
   * activity_logs array, use it directly.
   */

  if (
    Array.isArray(
      overview?.activity_logs
    ) &&
    overview.activity_logs.length
  ) {
    return overview.activity_logs;
  }

  /*
   * Otherwise use surveillance pulse data.
   */

  if (
    Array.isArray(
      overview?.surveillance_pulse
    ) &&
    overview.surveillance_pulse.length
  ) {
    return overview.surveillance_pulse;
  }

  /*
   * Final fallback:
   * build activity entries from reports.
   */

  if (
    Array.isArray(
      reports
    )
  ) {
    return reports
      .slice(
        0,
        12
      )
      .map(
        (
          report
        ) => ({
          time:
            report?.created_at,

          title:
            `${report?.disease || "Disease"} report received`,

          detail:
            `${report?.taluk_name || "Kodagu"} · ${
              report?.cases_this_week ??
              report?.current_cases ??
              0
            } cases`,
        })
      );
  }

  return [];
}


// ============================================================
// MAIN MEDICAL SUPERVISOR PORTAL
// ============================================================

export default function MedicalSupervisorPortal({
  onExit,
}) {
  // ==========================================================
  // ACTIVE TAB
  // ==========================================================

  const [
    tab,
    setTab,
  ] = useState(
    "overview"
  );


  // ==========================================================
  // LOADING
  // ==========================================================

  const [
    loading,
    setLoading,
  ] = useState(
    true
  );


  const [
    refreshing,
    setRefreshing,
  ] = useState(
    false
  );



  // ==========================================================
  // ERROR
  // ==========================================================

  const [
    error,
    setError,
  ] = useState(
    ""
  );



  // ==========================================================
  // DASHBOARD DATA
  // ==========================================================

  const [
    data,
    setData,
  ] = useState({
    overview:
      null,

    reports:
      [],


    analytics:
      null,

    riskMap:
      [],

    emerging:
      [],

    agents:
      [],

    issues:
      [],

    diseases:
      [],
  });


  // ==========================================================
  // FULL PAGE LOAD
  // ==========================================================

  const load =
    useCallback(
      async (
        showSpinner = true
      ) => {
        try {
          setError("");

          if (
            showSpinner
          ) {
            setRefreshing(
              true
            );
          }


          // ==================================================
          // LOAD ALL DISEASE REPORTS
          // ==================================================

          /*
           * Reports are also used by:
           *
           * - Agent Oversight
           * - Activity Logs
           * - Weekly reporting history
           * - Compliance calculations
           */

          const reports =
            await api.getMedicalReports(
              {
                limit:
                  1000,
              }
            );


          const normalizedReports =
            Array.isArray(
              reports
            )
              ? reports
              : [];


          // ==================================================
          // LOAD REMAINING MEDICAL SUPERVISOR DATA
          // ==================================================

          const [
            overview,
            analytics,
            riskMap,
            emerging,
            agents,
            issues,
            diseases,
          ] =
            await Promise.all([
              api.getMedicalOverview(),

              api.getMedicalAnalytics(
                8
              ),

              api.getMedicalRiskMap(),

              api.getMedicalEmergingDiseases(),

              api.getSupervisorAgents(),

              api.getSupervisorAgentIssues(),

              api.getMedicalDiseases(),

            ]);


          // ==================================================
          // STORE DATA
          // ==================================================

          setData({
            overview,

            reports:
              normalizedReports,

            analytics,

            riskMap:
              Array.isArray(
                riskMap
              )
                ? riskMap
                : [],

            emerging:
              Array.isArray(
                emerging
              )
                ? emerging
                : [],

            agents:
              Array.isArray(
                agents
              )
                ? agents
                : [],

            issues:
              Array.isArray(
                issues
              )
                ? issues
                : [],

            diseases:
              Array.isArray(
                diseases
              )
                ? diseases
                : [],
          });
        } catch (
          e
        ) {
          console.error(
            "Medical Supervisor portal load error:",
            e
          );

          setError(
            e?.message ||
              "Unable to load Medical Supervisor data."
          );
        } finally {
          setLoading(
            false
          );

          setRefreshing(
            false
          );
        }
      },
      []
    );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(
    () => {
      load(
        true
      );
    },
    []
  );


  // ==========================================================
  // SUBMIT AGENT ISSUE
  // ==========================================================

  const submitIssue =
    async (
      payload
    ) => {
      await api.submitAgentIssue(
        payload
      );

      /*
       * Reload all data so the newly submitted
       * complaint immediately appears.
       */

      await load(
        false
      );
    };


  // ==========================================================
  // REVIEW EMERGING DISEASE
  // ==========================================================

  const reviewEmerging =
    async (
      id,
      decision,
      notes,
      extra = {}
    ) => {
      await api.reviewEmergingDisease(
        id,
        {
          decision,

          review_notes:
            notes ||
            "",

          ...extra,
        }
      );


      await load(
        false
      );
    };


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const navigateTo =
    useCallback(
      (
        destination
      ) => {
        setTab(
          destination
        );

        window.scrollTo(
          {
            top: 0,
            behavior:
              "smooth",
          }
        );
      },
      []
    );


  // ==========================================================
  // ALERT COUNT
  // ==========================================================

  const alertCount =
    Number(
      data.overview
        ?.high_risk_alerts ||
        0
    ) +
    Number(
      data.overview
        ?.pending_emerging_reviews ||
        0
    ) +
    Number(
      data.overview
        ?.pending_agent_submissions ||
        0
    );


  // ==========================================================
  // DISTRICT
  // ==========================================================

  const districtName =
    data.overview
      ?.supervisor_district
      ?.name ||
    data.overview
      ?.district
      ?.name ||
    "Kodagu";


  // ==========================================================
  // TALUK / LOCATION
  // ==========================================================

  const talukName =
    data.overview
      ?.selected_location
      ?.taluk_name ||
    data.overview
      ?.taluk_name ||
    "Virajpet";


  const locationName =
    `${talukName}, ${districtName}`;


  // ==========================================================
  // SUPERVISOR NAME
  // ==========================================================

  const supervisorName =
    data.overview
      ?.supervisor_name ||
    "Dr. Monish";


  // ==========================================================
  // ACTIVITY LOGS
  // ==========================================================

  const activityLogs =
    buildActivityLogs(
      data.overview,
      data.reports
    );


  // ==========================================================
  // LOADING SCREEN
  // ==========================================================

  if (
    loading
  ) {
    return (
      <MedicalSupervisorLayout
        activeTab={
          tab
        }
        onTabChange={
          setTab
        }
        onExit={
          onExit
        }
        alertCount={
          0
        }
        districtName={
          districtName
        }
        locationName={
          locationName
        }
      >

        <Loading />

      </MedicalSupervisorLayout>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <MedicalSupervisorLayout

      activeTab={
        tab
      }

      onTabChange={
        setTab
      }

      onExit={
        onExit
      }

      alertCount={
        alertCount
      }

      districtName={
        districtName
      }

      locationName={
        locationName
      }


    >


      {/* ====================================================
          ERROR MESSAGE
          ==================================================== */}

      {
        error && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-xl border border-[#F0CACA] bg-[#FFF5F5] px-4 py-3 text-[11px] text-[#C62828]">

            <div className="flex items-center gap-2">

              <AlertCircle
                size={
                  15
                }
              />

              <span>
                {
                  error
                }
              </span>

            </div>


            <button
              type="button"
              onClick={() =>
                load(
                  true
                )
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-lg border border-[#F0CACA] bg-white px-3 py-2 font-semibold transition hover:bg-[#FFF9F9] disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                size={
                  13
                }
                className={
                  refreshing
                    ? "animate-spin"
                    : ""
                }
              />

              Retry

            </button>

          </div>
        )
      }


      {/* ====================================================
          OVERVIEW
          ==================================================== */}

      {
        tab ===
          "overview" && (

          <Overview

            data={
              data.overview
            }

            onReports={() =>
              navigateTo(
                "reports"
              )
            }

            onAlerts={() =>
              navigateTo(
                "alerts"
              )
            }

            onRiskMap={() =>
              navigateTo(
                "risk-map"
              )
            }

            onActivity={() =>
              navigateTo(
                "activity"
              )
            }

          />

        )
      }


      {/* ====================================================
          DISEASE REPORTS
          ==================================================== */}

      {
        tab ===
          "reports" && (

          <DiseaseReports

            reports={
              data.reports
            }

            onRefresh={() =>
              load(
                true
              )
            }

          />

        )
      }


      {/* ====================================================
          RISK MAP
          ==================================================== */}

      {
        tab ===
          "risk-map" && (

          <RiskMap

            data={
              data.riskMap
            }

          />

        )
      }


      {/* ====================================================
          SURVEILLANCE ANALYTICS
          ==================================================== */}

      {
        tab ===
          "analytics" && (

          <SurveillanceAnalytics

            data={
              data.analytics
            }

          />

        )
      }


      {/* ====================================================
          AGENT OVERSIGHT
          ==================================================== */}

      {
        tab ===
          "agents" && (

          <AgentOversight

            agents={
              data.agents
            }

            issues={
              data.issues
            }

            reports={
              data.reports
            }

            onSubmitIssue={
              submitIssue
            }

          />

        )
      }


      {/* ====================================================
          ALERTS
          ==================================================== */}

      {
        tab ===
          "alerts" && (

          <Alerts

            alerts={
              data.overview
                ?.recent_alerts ||
              []
            }

            emerging={
              data.emerging
            }

            diseases={
              data.diseases
            }

            onReviewEmerging={
              reviewEmerging
            }

          />

        )
      }


      {/* ====================================================
          ACTIVITY LOGS
          ==================================================== */}

      {
        tab ===
          "activity" && (

          <ActivityLogs

            logs={
              activityLogs
            }

            reports={
              data.reports
            }

          />

        )
      }


      {/* ====================================================
          HOME RELIEF
          ==================================================== */}

      {
        tab ===
          "home-relief" && (

          <HomeReliefManagement />

        )
      }


    </MedicalSupervisorLayout>
  );
}