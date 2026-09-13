import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  MapPin,
  Users,
  ChevronRight,
} from "lucide-react";

import skyline from "../../../assets/ui/medical-dashboard-skyline.png";
import pulseIllustration from "../../../assets/ui/medical-pulse-illustration.png";
import referenceRiskMap from "../../../assets/ui/medical-reference-risk-map.png";

import { getDiseaseVisual } from "../../../data/diseaseVisuals";

/* ============================================================
   FALLBACK DATA
   ============================================================ */

const fallbackDiseases = [
  {
    disease: "Dengue",
    cases_this_week: 150,
    change_percent: 14,
    risk_level: "High",
    status: "Watch",
  },
  {
    disease: "Malaria",
    cases_this_week: 52,
    change_percent: 30,
    risk_level: "Moderate",
    status: "Monitor",
  },
  {
    disease: "Influenza",
    cases_this_week: 19,
    change_percent: -37,
    risk_level: "Low",
    status: "Stable",
  },
  {
    disease: "Typhoid",
    cases_this_week: 18,
    change_percent: -5,
    risk_level: "Low",
    status: "Stable",
  },
  {
    disease: "Chikungunya",
    cases_this_week: 17,
    change_percent: 55,
    risk_level: "Low",
    status: "Stable",
  },
];

const fallbackAlerts = [
  {
    title: "High Dengue activity in Kushalnagar",
    message: "Current cases: 56; predicted: 58. Trend: stable.",
    severity: "High",
    created_at: "2026-08-26T11:59:00",
  },
  {
    title: "High Dengue activity in Madikeri",
    message: "Current cases: 47; predicted: 51. Trend: stable.",
    severity: "High",
    created_at: "2026-08-26T11:59:00",
  },
];

const fallbackPulse = [
  {
    time: "2026-08-26T11:59:00",
    title: "Disease report submitted",
    detail: "Anitha Pooviah submitted Dengue surveillance data.",
    meta: "47 cases · Madikeri",
  },
  {
    time: "2026-08-26T11:59:00",
    title: "Risk level updated",
    detail: "Dengue classified as High risk.",
    meta: "Predicted 58 cases · Kushalnagar",
  },
  {
    time: "2026-08-26T11:59:00",
    title: "Weekly reporting coverage",
    detail: "4 of 4 active monitored agents have submitted this week.",
    meta: "100% coverage",
  },
];

/* ============================================================
   HELPERS
   ============================================================ */

const formatTime = (value) => {
  if (!value) return "06:57 PM";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "06:57 PM";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const formatAlertTime = (value) => {
  if (!value) return "11:59 AM";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "11:59 AM";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

/* ============================================================
   RISK BADGE
   ============================================================ */

function RiskBadge({ level }) {
  const normalized = String(level || "Low").toLowerCase();

  let className =
    "bg-[#EAF6EE] text-[#177341]";

  if (
    normalized === "high" ||
    normalized === "critical" ||
    normalized === "very high"
  ) {
    className =
      "bg-[#FDEBEC] text-[#D23A3A]";
  }

  if (normalized === "moderate") {
    className =
      "bg-[#FFF4DD] text-[#D88B0D]";
  }

  return (
    <span
      className={`
        inline-flex
        items-center
        justify-center
        rounded-[7px]
        px-[10px]
        py-[6px]
        text-[9px]
        font-semibold
        leading-none
        ${className}
      `}
    >
      {level || "Low"}
    </span>
  );
}

/* ============================================================
   STATUS
   ============================================================ */

function Status({ value }) {
  const normalized = String(value || "Stable").toLowerCase();

  const isWatch =
    normalized === "watch";

  const isMonitor =
    normalized === "monitor";

  const dotClass =
    isWatch
      ? "bg-[#E31E2B]"
      : isMonitor
        ? "bg-[#F59E0B]"
        : "bg-[#087A32]";

  return (
    <span className="inline-flex items-center gap-[7px] whitespace-nowrap text-[9px] font-medium text-[#263246]">
      <span
        className={`
          h-[8px]
          w-[8px]
          rounded-full
          ${dotClass}
        `}
      />

      {value || "Stable"}
    </span>
  );
}

/* ============================================================
   ALERT CARD
   ============================================================ */

function AlertCard({
  alert,
  onOpen,
}) {
  const high =
    alert?.severity === "High" ||
    alert?.severity === "Critical";

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`
        group
        block
        h-[116px]
        w-full
        rounded-[10px]
        border
        p-[14px]
        text-left
        transition-all
        duration-200
        hover:-translate-y-[1px]
        hover:shadow-[0_5px_18px_rgba(20,70,45,.06)]
        ${
          high
            ? "border-[#F2D7D8] bg-[#FFF5F5]"
            : "border-[#F4E8CD] bg-[#FFFAF0]"
        }
      `}
    >
      <div className="flex items-start gap-[10px]">

        {/* DOT */}

        <span
          className={`
            mt-[6px]
            h-[8px]
            w-[8px]
            shrink-0
            rounded-full
            ${
              high
                ? "bg-[#E31E2B]"
                : "bg-[#F59E0B]"
            }
          `}
        />

        <div className="min-w-0 flex-1">

          {/* TITLE + BADGE */}

          <div className="flex items-start justify-between gap-[8px]">

            <p
              className="
                min-w-0
                flex-1
                truncate
                pr-[4px]
                text-[10px]
                font-semibold
                leading-[15px]
                text-[#17233D]
              "
            >
              {alert?.title ||
                "Surveillance alert"}
            </p>

            <span
              className={`
                shrink-0
                rounded-[6px]
                px-[8px]
                py-[5px]
                text-[8px]
                font-semibold
                leading-none
                ${
                  high
                    ? "bg-[#FCE3E4] text-[#D23A3A]"
                    : "bg-[#FFF0D2] text-[#D88B0D]"
                }
              `}
            >
              {alert?.severity ||
                "Medium"}
            </span>

          </div>

          {/* MESSAGE */}

          <p
            className="
              mt-[8px]
              text-[8px]
              leading-[13px]
              text-[#718096]
            "
          >
            {alert?.message ||
              "Follow-up required for timely surveillance."}
          </p>

          {/* TIME */}

          <p
            className="
              mt-[6px]
              text-[8px]
              text-[#718096]
            "
          >
            Today,{" "}
            {formatAlertTime(
              alert?.created_at
            )}
          </p>

        </div>
      </div>
    </button>
  );
}

/* ============================================================
   OVERVIEW
   ============================================================ */

export default function Overview({
  data,
  onReports,
  onMonitoring,
  onRiskMap,
  onAlerts,
  onActivity,
}) {
  if (!data) {
    return (
      <div className="flex min-h-[500px] items-center justify-center text-[12px] text-[#718096]">
        Loading surveillance data…
      </div>
    );
  }

  /* ==========================================================
     DATA
     ========================================================== */

  const reports =
    Array.isArray(data?.disease_overview) &&
    data.disease_overview.length
      ? data.disease_overview
      : fallbackDiseases;

  const alerts =
    Array.isArray(data?.recent_alerts) &&
    data.recent_alerts.length
      ? data.recent_alerts
      : fallbackAlerts;

  const pulse =
    Array.isArray(data?.surveillance_pulse) &&
    data.surveillance_pulse.length
      ? data.surveillance_pulse
      : fallbackPulse;

  const current =
    Number(
      data?.total_cases_this_week
    ) || 256;

  const previous =
    Number(
      data?.total_cases_previous_week
    ) || 233;

  const trend =
    previous
      ? Math.round(
          ((current - previous) /
            previous) *
            100
        )
      : 10;

  const highRisk =
    Number(
      data?.high_risk_alerts
    ) || 3;

  const activeDiseases =
    Number(
      data?.diseases_tracked
    ) ||
    reports.length ||
    5;

  const reportsThisWeek =
    Number(
      data?.reports_this_week
    ) || 20;

  const updated =
    formatTime(
      data?.updated_at
    );

  const location =
    data?.selected_location
      ?.taluk_name ||
    "Virajpet";

  const district =
    data?.supervisor_district
      ?.name ||
    data?.district?.name ||
    "Kodagu";

  const supervisor =
    data?.supervisor_name ||
    "Dr. Monish";

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <div
      className="
        medical-overview
        w-full
        max-w-none
        space-y-[12px]
      "
    >

      {/* ======================================================
          HERO
          ====================================================== */}

      <section
        className="
          relative
          h-[106px]
          w-full
          overflow-hidden
          rounded-[13px]
          bg-white
        "
      >

        {/* HERO TEXT */}

        <div
          className="
            relative
            z-10
            px-[8px]
            pt-[3px]
          "
        >

          <h1
            className="
              m-0
              text-[24px]
              font-semibold
              leading-[32px]
              tracking-[-0.035em]
              text-[#101B38]
            "
          >
            Good afternoon, {supervisor}
            <span className="ml-[6px]">
              👋
            </span>
          </h1>

          <p
            className="
              mt-[0px]
              text-[11px]
              leading-[18px]
              text-[#66727D]
            "
          >
            Here's your surveillance
            summary for {location},{" "}
            {district}.
          </p>

          <div
            className="
              mt-[13px]
              flex
              items-center
              gap-[7px]
              text-[9px]
              text-[#697587]
            "
          >
            <Activity
              size={13}
              strokeWidth={1.8}
            />

            <span>
              Last updated: Today,{" "}
              {updated}
            </span>
          </div>

        </div>

        {/* HERO SKYLINE */}

        <img
          src={skyline}
          alt=""
          draggable="false"
          className="
            pointer-events-none
            absolute
            bottom-0
            right-0
            z-[1]
            h-[105px]
            w-[57%]
            object-contain
            object-right-bottom
          "
        />

      </section>


      {/* ======================================================
          KPI CARDS
          ====================================================== */}

      <section
        className="
          grid
          w-full
          grid-cols-4
          gap-[12px]
        "
      >

        {/* ACTIVE DISEASES */}

        <div
          className="
            flex
            h-[132px]
            items-center
            gap-[16px]
            rounded-[13px]
            border
            border-[#E8ECEA]
            bg-white
            px-[20px]
            shadow-[0_2px_10px_rgba(25,50,40,.025)]
          "
        >

          <div
            className="
              flex
              h-[52px]
              w-[52px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#26965B]
              text-white
            "
          >
            <Users
              size={26}
              strokeWidth={1.9}
            />
          </div>

          <div className="min-w-0">

            <div
              className="
                text-[10px]
                font-medium
                text-[#101820]
              "
            >
              Active Diseases
            </div>

            <div
              className="
                mt-[4px]
                text-[28px]
                font-semibold
                leading-none
                tracking-[-.04em]
                text-[#101B38]
              "
            >
              {activeDiseases}
            </div>

            <div
              className="
                mt-[7px]
                text-[9px]
                text-[#52627D]
              "
            >
              Under Surveillance
            </div>

          </div>

        </div>


        {/* TOTAL CASES */}

        <div
          className="
            flex
            h-[132px]
            items-center
            gap-[16px]
            rounded-[13px]
            border
            border-[#E8ECEA]
            bg-white
            px-[20px]
            shadow-[0_2px_10px_rgba(25,50,40,.025)]
          "
        >

          <div
            className="
              flex
              h-[52px]
              w-[52px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#6E9BDF]
              text-white
            "
          >
            <ClipboardList
              size={25}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">

            <div
              className="
                text-[10px]
                font-medium
                text-[#101820]
              "
            >
              Total Cases (This Week)
            </div>

            <div
              className="
                mt-[4px]
                text-[28px]
                font-semibold
                leading-none
                tracking-[-.04em]
                text-[#101B38]
              "
            >
              {current}
            </div>

            <div
              className="
                mt-[7px]
                flex
                items-center
                gap-[3px]
                text-[9px]
                font-semibold
                text-[#D33D47]
              "
            >

              <ArrowUpRight
                size={11}
              />

              {Math.abs(trend)}%

              <span
                className="
                  font-normal
                  text-[#52627D]
                "
              >
                vs last week
              </span>

            </div>

          </div>

        </div>


        {/* HIGH RISK */}

        <div
          className="
            flex
            h-[132px]
            items-center
            gap-[16px]
            rounded-[13px]
            border
            border-[#E8ECEA]
            bg-white
            px-[20px]
            shadow-[0_2px_10px_rgba(25,50,40,.025)]
          "
        >

          <div
            className="
              flex
              h-[52px]
              w-[52px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#FFE9C8]
              text-[#F39A08]
            "
          >
            <AlertTriangle
              size={26}
              strokeWidth={1.9}
            />
          </div>

          <div className="min-w-0">

            <div
              className="
                text-[10px]
                font-medium
                text-[#101820]
              "
            >
              High Risk Alerts
            </div>

            <div
              className="
                mt-[4px]
                text-[28px]
                font-semibold
                leading-none
                tracking-[-.04em]
                text-[#101B38]
              "
            >
              {highRisk}
            </div>

            <div
              className="
                mt-[7px]
                text-[9px]
                font-medium
                text-[#D33D47]
              "
            >
              Require Attention
            </div>

          </div>

        </div>


        {/* REPORTS */}

        <div
          className="
            flex
            h-[132px]
            items-center
            gap-[16px]
            rounded-[13px]
            border
            border-[#E8ECEA]
            bg-white
            px-[20px]
            shadow-[0_2px_10px_rgba(25,50,40,.025)]
          "
        >

          <div
            className="
              flex
              h-[52px]
              w-[52px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#F0E7FB]
              text-[#7D4AC0]
            "
          >
            <BarChart3
              size={27}
              strokeWidth={1.8}
            />
          </div>

          <div className="min-w-0">

            <div
              className="
                text-[10px]
                font-medium
                text-[#101820]
              "
            >
              Reports This Week
            </div>

            <div
              className="
                mt-[4px]
                text-[28px]
                font-semibold
                leading-none
                tracking-[-.04em]
                text-[#101B38]
              "
            >
              {reportsThisWeek}
            </div>

            <div
              className="
                mt-[7px]
                text-[9px]
                text-[#52627D]
              "
            >
              Submitted by Agents
            </div>

          </div>

        </div>

      </section>


      {/* ======================================================
          MAIN THREE COLUMN ROW
          ====================================================== */}

      <section
        className="
          grid
          h-[292px]
          w-full
          grid-cols-[1.48fr_1fr_.96fr]
          gap-[12px]
        "
      >

        {/* ====================================================
            DISEASE OVERVIEW
            ==================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[13px]
            border
            border-[#E7ECEA]
            bg-white
          "
        >

          <div
            className="
              flex
              h-[51px]
              items-center
              justify-between
              px-[20px]
            "
          >

            <h2
              className="
                text-[11px]
                font-medium
                tracking-[-.01em]
                text-[#111820]
              "
            >
              DISEASE OVERVIEW
            </h2>

            <button
              type="button"
              onClick={onReports}
              className="
                flex
                items-center
                gap-[3px]
                text-[9px]
                font-semibold
                text-[#087A32]
                transition
                hover:text-[#055D26]
              "
            >
              View All Reports

              <ChevronRight
                size={12}
              />
            </button>

          </div>


          <div
            className="
              px-[18px]
            "
          >

            <table
              className="
                w-full
                table-fixed
                border-collapse
                text-left
              "
            >

              <thead>

                <tr
                  className="
                    border-b
                    border-[#EDF0EF]
                    text-[8px]
                    text-[#6D7887]
                  "
                >

                  <th
                    className="
                      w-[31%]
                      pb-[8px]
                      font-medium
                    "
                  >
                    Disease
                  </th>

                  <th
                    className="
                      w-[22%]
                      pb-[8px]
                      font-medium
                    "
                  >
                    Cases (This Week)
                  </th>

                  <th
                    className="
                      w-[15%]
                      pb-[8px]
                      font-medium
                    "
                  >
                    Change
                  </th>

                  <th
                    className="
                      w-[17%]
                      pb-[8px]
                      font-medium
                    "
                  >
                    Risk Level
                  </th>

                  <th
                    className="
                      w-[15%]
                      pb-[8px]
                      font-medium
                    "
                  >
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports
                  .slice(0, 5)
                  .map((row, index) => {

                    const visual =
                      getDiseaseVisual(
                        row?.disease
                      )?.diseaseImage;

                    const change =
                      Number(
                        row?.change_percent || 0
                      );

                    return (
                      <tr
                        key={
                          row?.disease ||
                          index
                        }
                        className="
                          h-[39px]
                          border-b
                          border-[#EEF1EF]
                          last:border-b-0
                          hover:bg-[#FCFDFC]
                        "
                      >

                        {/* DISEASE */}

                        <td className="pr-2">

                          <div
                            className="
                              flex
                              items-center
                              gap-[8px]
                            "
                          >

                            <span
                              className="
                                flex
                                h-[25px]
                                w-[25px]
                                shrink-0
                                items-center
                                justify-center
                                overflow-hidden
                                rounded-full
                                bg-[#F5F7F6]
                              "
                            >
                              {visual ? (
                                <img
                                  src={visual}
                                  alt=""
                                  draggable="false"
                                  className="
                                    h-[24px]
                                    w-[24px]
                                    object-contain
                                  "
                                />
                              ) : (
                                <Activity
                                  size={13}
                                  className="text-[#16884A]"
                                />
                              )}
                            </span>

                            <span
                              className="
                                truncate
                                text-[9px]
                                font-semibold
                                text-[#202A39]
                              "
                            >
                              {row?.disease ||
                                "Unknown"}
                            </span>

                          </div>

                        </td>


                        {/* CASES */}

                        <td
                          className="
                            text-[9px]
                            font-semibold
                            text-[#172033]
                          "
                        >
                          {row?.cases_this_week ??
                            0}
                        </td>


                        {/* CHANGE */}

                        <td
                          className={`
                            text-[9px]
                            font-semibold
                            ${
                              change > 0
                                ? "text-[#D33D47]"
                                : change < 0
                                  ? "text-[#087A32]"
                                  : "text-[#52627D]"
                            }
                          `}
                        >

                          {change > 0 ? (
                            <ArrowUpRight
                              size={10}
                              className="
                                mr-[1px]
                                inline
                              "
                            />
                          ) : change < 0 ? (
                            <ArrowDownRight
                              size={10}
                              className="
                                mr-[1px]
                                inline
                              "
                            />
                          ) : null}

                          {Math.abs(change)}%

                        </td>


                        {/* RISK */}

                        <td>
                          <RiskBadge
                            level={
                              row?.risk_level
                            }
                          />
                        </td>


                        {/* STATUS */}

                        <td>
                          <Status
                            value={
                              row?.status
                            }
                          />
                        </td>

                      </tr>
                    );
                  })}

              </tbody>

            </table>


            <button
              type="button"
              onClick={onReports}
              className="
                mt-[8px]
                flex
                w-full
                items-center
                justify-center
                gap-[3px]
                text-[9px]
                font-semibold
                text-[#087A32]
                hover:text-[#055D26]
              "
            >
              View All Disease Reports

              <ChevronRight
                size={12}
              />
            </button>

          </div>

        </section>


        {/* ====================================================
            RECENT ALERTS
            ==================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[13px]
            border
            border-[#E7ECEA]
            bg-white
          "
        >

          <div
            className="
              flex
              h-[51px]
              items-center
              justify-between
              px-[20px]
            "
          >

            <h2
              className="
                text-[11px]
                font-medium
                tracking-[-.01em]
                text-[#111820]
              "
            >
              RECENT ALERTS
            </h2>

            <button
              type="button"
              onClick={onAlerts}
              className="
                flex
                items-center
                gap-[3px]
                text-[9px]
                font-semibold
                text-[#087A32]
                hover:text-[#055D26]
              "
            >
              View All

              <ChevronRight
                size={12}
              />
            </button>

          </div>


          <div
            className="
              space-y-[10px]
              px-[11px]
            "
          >

            {alerts
              .slice(0, 2)
              .map(
                (alert, index) => (
                  <AlertCard
                    key={`
                      ${alert?.title || "alert"}
                      -
                      ${index}
                    `}
                    alert={alert}
                    onOpen={onAlerts}
                  />
                )
              )}

          </div>

        </section>


        {/* ====================================================
            RISK MAP
            ==================================================== */}

        <section
          className="
            overflow-hidden
            rounded-[13px]
            border
            border-[#E7ECEA]
            bg-white
          "
        >

          <div
            className="
              flex
              h-[51px]
              items-center
              justify-between
              px-[13px]
              pl-[15px]
            "
          >

            <h2
              className="
                flex
                items-center
                gap-[6px]
                text-[11px]
                font-medium
                tracking-[-.01em]
                text-[#111820]
              "
            >

              <MapPin
                size={14}
                strokeWidth={1.8}
              />

              RISK MAP

            </h2>


            <button
              type="button"
              onClick={onRiskMap}
              className="
                flex
                items-center
                gap-[3px]
                text-[9px]
                font-semibold
                text-[#087A32]
                hover:text-[#055D26]
              "
            >
              View Full Map

              <ChevronRight
                size={12}
              />
            </button>

          </div>


          <button
            type="button"
            onClick={onRiskMap}
            aria-label="Open full risk map"
            className="
              mx-[9px]
              block
              h-[201px]
              w-[calc(100%-18px)]
              overflow-hidden
              rounded-[7px]
              bg-[#F8FAF9]
              text-left
            "
          >

            <img
              src={referenceRiskMap}
              alt="Kodagu disease risk map"
              draggable="false"
              className="
                h-full
                w-full
                object-cover
                object-center
              "
            />

          </button>


          <div
            className="
              flex
              items-center
              justify-between
              px-[15px]
              pt-[9px]
              text-[8px]
              text-[#52627D]
            "
          >

            <span
              className="
                flex
                items-center
                gap-[5px]
              "
            >
              <i
                className="
                  h-[8px]
                  w-[8px]
                  rounded-[2px]
                  bg-[#3B9860]
                "
              />
              Low
            </span>

            <span
              className="
                flex
                items-center
                gap-[5px]
              "
            >
              <i
                className="
                  h-[8px]
                  w-[8px]
                  rounded-[2px]
                  bg-[#F2A51B]
                "
              />
              Moderate
            </span>

            <span
              className="
                flex
                items-center
                gap-[5px]
              "
            >
              <i
                className="
                  h-[8px]
                  w-[8px]
                  rounded-[2px]
                  bg-[#F37B1B]
                "
              />
              High
            </span>

            <span
              className="
                flex
                items-center
                gap-[5px]
              "
            >
              <i
                className="
                  h-[8px]
                  w-[8px]
                  rounded-[2px]
                  bg-[#E63232]
                "
              />
              Very High
            </span>

          </div>

        </section>

      </section>


      {/* ======================================================
          SURVEILLANCE PULSE
          ====================================================== */}

      <section
        className="
          relative
          h-[181px]
          w-full
          overflow-hidden
          rounded-[13px]
          border
          border-[#E7ECEA]
          bg-white
        "
      >

        {/* HEADER */}

        <div
          className="
            flex
            h-[48px]
            items-center
            justify-between
            px-[20px]
          "
        >

          <h2
            className="
              flex
              items-center
              gap-[7px]
              text-[11px]
              font-medium
              tracking-[-.01em]
              text-[#111820]
            "
          >

            <Activity
              size={19}
              strokeWidth={1.7}
              className="text-[#087A32]"
            />

            SURVEILLANCE PULSE

          </h2>


          <button
            type="button"
            onClick={
              onActivity ||
              onAlerts
            }
            className="
              flex
              items-center
              gap-[3px]
              text-[9px]
              font-semibold
              text-[#087A32]
              hover:text-[#055D26]
            "
          >
            View All Activity

            <ChevronRight
              size={12}
            />
          </button>

        </div>


        {/* CONTENT */}

        <div
          className="
            relative
            h-[133px]
            px-[20px]
          "
        >

          {/* DASHED TIMELINE */}

          <div
            className="
              pointer-events-none
              absolute
              left-[28px]
              right-[190px]
              top-[10px]
              hidden
              border-t
              border-dashed
              border-[#BFCFC5]
              xl:block
            "
          />


          {/* EVENTS */}

          <div
            className="
              relative
              grid
              grid-cols-3
              gap-[20px]
              pr-[180px]
            "
          >

            {pulse
              .slice(0, 3)
              .map(
                (item, index) => (
                  <div
                    key={`
                      ${item?.title || "event"}
                      -
                      ${index}
                    `}
                    className="
                      relative
                      min-w-0
                    "
                  >

                    {/* TIME */}

                    <div
                      className="
                        flex
                        items-center
                        gap-[7px]
                      "
                    >

                      <span
                        className="
                          relative
                          z-[2]
                          h-[11px]
                          w-[11px]
                          shrink-0
                          rounded-full
                          border-[3px]
                          border-white
                          bg-[#16884A]
                          shadow-[0_0_0_1px_#B8D5C1]
                        "
                      />

                      <span
                        className="
                          text-[8px]
                          font-bold
                          text-[#087A32]
                        "
                      >
                        {formatTime(
                          item?.time
                        )}
                      </span>

                    </div>


                    {/* EVENT TEXT */}

                    <div
                      className="
                        ml-[18px]
                        mt-[8px]
                      "
                    >

                      <div
                        className="
                          max-w-[190px]
                          text-[9px]
                          font-semibold
                          leading-[13px]
                          text-[#202A39]
                        "
                      >
                        {item?.title ||
                          "Surveillance event"}
                      </div>


                      <div
                        className="
                          mt-[6px]
                          max-w-[190px]
                          text-[8px]
                          leading-[12px]
                          text-[#718096]
                        "
                      >
                        {item?.detail ||
                          ""}
                      </div>


                      {item?.meta && (
                        <div
                          className="
                            mt-[4px]
                            max-w-[190px]
                            text-[8px]
                            leading-[12px]
                            text-[#52627D]
                          "
                        >
                          {item.meta}
                        </div>
                      )}

                    </div>

                  </div>
                )
              )}

          </div>


          {/* PULSE ILLUSTRATION */}

          <img
            src={pulseIllustration}
            alt=""
            draggable="false"
            className="
              pointer-events-none
              absolute
              bottom-[-10px]
              right-[12px]
              z-[5]
              h-[128px]
              w-[205px]
              object-contain
              object-right-bottom
            "
          />

        </div>

      </section>

    </div>
  );
}