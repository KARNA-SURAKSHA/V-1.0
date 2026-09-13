import { useEffect, useMemo, useState } from "react";

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
   FALLBACK DISEASE DATA
============================================================ */

const FALLBACK_DISEASES = [
  {
    disease: "Dengue",
    cases_this_week: 35,
    change_percent: 37,
    risk_level: "High",
    status: "Watch",
  },
  {
    disease: "Malaria",
    cases_this_week: 12,
    change_percent: -14,
    risk_level: "Low",
    status: "Stable",
  },
  {
    disease: "Typhoid",
    cases_this_week: 7,
    change_percent: 34,
    risk_level: "Moderate",
    status: "Monitor",
  },
  {
    disease: "Influenza",
    cases_this_week: 4,
    change_percent: -80,
    risk_level: "Low",
    status: "Stable",
  },
  {
    disease: "Chikungunya",
    cases_this_week: 2,
    change_percent: 0,
    risk_level: "Low",
    status: "Stable",
  },
];


/* ============================================================
   FALLBACK ALERT DATA
============================================================ */

const FALLBACK_ALERTS = [
  {
    title: "High dengue activity in Virajpet",
    message:
      "Cases increased by 27% compared to last week.",
    severity: "High",
    created_at: "2026-08-26T12:10:00",
  },
  {
    title: "3 agents missed weekly reports",
    message:
      "Follow-up required for timely reporting.",
    severity: "Medium",
    created_at: "2026-08-26T11:30:00",
  },
];


/* ============================================================
   FALLBACK SURVEILLANCE PULSE
============================================================ */

const FALLBACK_PULSE = [
  {
    time: "2026-08-26T08:30:00",
    title: "Agent report submitted in Virajpet",
    detail: "Dengue - 4 cases",
  },
  {
    time: "2026-08-26T10:15:00",
    title: "Emerging disease report received",
    detail: "Pending review",
  },
  {
    time: "2026-08-26T11:40:00",
    title: "Weekly report submitted by 3 agents",
    detail: "Virajpet, Madikeri, Somwarpet",
  },
  {
    time: "2026-08-26T13:05:00",
    title: "Risk level updated for 2 taluks",
    detail: "Virajpet (High), Madikeri (Moderate)",
  },
];


/* ============================================================
   GREETING
============================================================ */

function getGreeting(date) {
  const hour = date.getHours();

  if (hour >= 5 && hour < 12) {
    return "Good morning";
  }

  if (hour >= 12 && hour < 17) {
    return "Good afternoon";
  }

  if (hour >= 17 && hour < 21) {
    return "Good evening";
  }

  return "Good night";
}


/* ============================================================
   TIME FORMATTER
============================================================ */

function formatTime(
  value,
  fallbackDate = new Date(),
) {
  const date = value
    ? new Date(value)
    : fallbackDate;

  if (Number.isNaN(date.getTime())) {
    return "--:--";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}


/* ============================================================
   RISK CLASS
============================================================ */

function riskClass(level) {
  const value = String(
    level || "Low",
  ).toLowerCase();

  if (value === "moderate") {
    return "bg-[#FFF4DD] text-[#D88B0D]";
  }

  if (value === "high") {
    return "bg-[#FDEBEC] text-[#D23A3A]";
  }

  if (
    value === "very high" ||
    value === "critical"
  ) {
    return "bg-[#FFE5E5] text-[#C62828]";
  }

  return "bg-[#EAF6EE] text-[#177341]";
}


/* ============================================================
   STATUS DOT
============================================================ */

function statusDot(value) {
  const normalized = String(
    value || "Stable",
  ).toLowerCase();

  if (normalized === "watch") {
    return "bg-[#E31E2B]";
  }

  if (normalized === "monitor") {
    return "bg-[#F59E0B]";
  }

  return "bg-[#087A32]";
}


/* ============================================================
   ALERT CARD
============================================================ */

function AlertCard({
  alert,
  onOpen,
}) {
  const high = [
    "high",
    "critical",
    "very high",
  ].includes(
    String(
      alert?.severity || "",
    ).toLowerCase(),
  );

  return (
    <button
      type="button"
      onClick={onOpen}
      className={`
        group
        flex
        h-[116px]
        w-full
        rounded-[10px]
        border
        p-[14px]
        text-left
        transition
        hover:-translate-y-[1px]
        hover:shadow-[0_5px_18px_rgba(20,70,45,.06)]

        ${
          high
            ? "border-[#F2D7D8] bg-[#FFF5F5]"
            : "border-[#F4E8CD] bg-[#FFFAF0]"
        }
      `}
    >

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

      <div className="ml-[10px] min-w-0 flex-1">

        <div className="flex items-start justify-between gap-[8px]">

          <p className="min-w-0 flex-1 truncate pr-[4px] text-[10px] font-semibold leading-[15px] text-[#17233D]">
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
            {alert?.severity || "Medium"}
          </span>

        </div>

        <p className="mt-[8px] text-[8px] leading-[13px] text-[#718096]">
          {alert?.message ||
            "Follow-up required for timely surveillance."}
        </p>

        <p className="mt-[6px] text-[8px] text-[#718096]">
          Today,{" "}
          {formatTime(
            alert?.created_at,
          )}
        </p>

      </div>
    </button>
  );
}


/* ============================================================
   SURVEILLANCE PULSE ITEM
============================================================ */

function PulseItem({
  item,
  index,
}) {
  return (
    <div
      className="
        relative
        min-w-0
      "
    >

      {/* DOT + TIME */}
      <div className="flex items-center gap-[7px]">

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

        <span className="text-[8px] font-bold text-[#087A32]">
          {formatTime(item?.time)}
        </span>

      </div>


      {/* CONTENT */}
      <div className="ml-[18px] mt-[8px]">

        <div className="max-w-[180px] text-[9px] font-semibold leading-[13px] text-[#202A39]">
          {item?.title ||
            "Surveillance event"}
        </div>

        <div className="mt-[6px] max-w-[180px] text-[8px] leading-[12px] text-[#718096]">
          {item?.detail || ""}
        </div>

        {item?.meta && (
          <div className="mt-[4px] max-w-[180px] text-[8px] leading-[12px] text-[#52627D]">
            {item.meta}
          </div>
        )}

      </div>

    </div>
  );
}


/* ============================================================
   MAIN OVERVIEW
============================================================ */

export default function Overview({
  data,
  onReports,
  onMonitoring,
  onRiskMap,
  onAlerts,
  onActivity,
}) {

  const [now, setNow] =
    useState(() => new Date());


  /* ==========================================================
     LIVE CLOCK
  ========================================================== */

  useEffect(() => {
    const timer = window.setInterval(
      () => {
        setNow(new Date());
      },
      60 * 1000,
    );

    return () =>
      window.clearInterval(timer);
  }, []);


  /* ==========================================================
     DATA
  ========================================================== */

  const reports =
    Array.isArray(
      data?.disease_overview,
    ) &&
    data.disease_overview.length
      ? data.disease_overview
      : FALLBACK_DISEASES;


  const alerts =
    Array.isArray(
      data?.recent_alerts,
    ) &&
    data.recent_alerts.length
      ? data.recent_alerts
      : FALLBACK_ALERTS;


  /*
   * Always guarantee four pulse events.
   * If the backend provides fewer than four,
   * fill the remaining positions with fallback events.
   */
  const pulse = useMemo(() => {

    const apiPulse =
      Array.isArray(
        data?.surveillance_pulse,
      )
        ? data.surveillance_pulse
        : [];

    const result = [];

    for (let i = 0; i < 4; i += 1) {

      if (apiPulse[i]) {
        result.push(apiPulse[i]);
      } else {
        result.push(
          FALLBACK_PULSE[i],
        );
      }
    }

    return result;

  }, [
    data?.surveillance_pulse,
  ]);


  /* ==========================================================
     KPI VALUES
  ========================================================== */

  const current = Number(
    data?.total_cases_this_week ??
      60,
  );

  const previous = Number(
    data?.total_cases_previous_week ??
      49,
  );

  const trend =
    previous > 0
      ? Math.round(
          ((current - previous) /
            previous) *
            100,
        )
      : 0;

  const highRisk = Number(
    data?.high_risk_alerts ??
      2,
  );

  const activeDiseases = Number(
    data?.diseases_tracked ??
      reports.length ??
      5,
  );

  const reportsThisWeek = Number(
    data?.reports_this_week ??
      18,
  );


  /* ==========================================================
     LOCATION
  ========================================================== */

  const location =
    data?.selected_location
      ?.taluk_name ||
    data?.taluk_name ||
    "Virajpet";

  const district =
    data?.supervisor_district
      ?.name ||
    data?.district?.name ||
    "Kodagu";

  const supervisor =
    data?.supervisor_name ||
    "Dr. Monish";

  const updated =
    data?.updated_at
      ? formatTime(
          data.updated_at,
          now,
        )
      : formatTime(now);


  const trendIsPositive =
    trend > 0;


  /* ==========================================================
     KPI DATA
  ========================================================== */

  const kpis = useMemo(
    () => [
      {
        label: "Active Diseases",
        value: activeDiseases,
        note: "Under Surveillance",
        icon: Users,
        iconClass:
          "bg-[#26965B]",
      },

      {
        label: "Total Cases (This Week)",
        value: current,
        note: `${Math.abs(
          trend,
        )}% vs last week`,
        icon: ClipboardList,
        iconClass:
          "bg-[#6E9BDF]",
        trend,
      },

      {
        label: "High Risk Alerts",
        value: highRisk,
        note: "Require Attention",
        icon: AlertTriangle,
        iconClass:
          "bg-[#FFE9C8] text-[#F39A08]",
        danger: true,
      },

      {
        label: "Reports This Week",
        value: reportsThisWeek,
        note: "Submitted by Agents",
        icon: BarChart3,
        iconClass:
          "bg-[#F0E7FB] text-[#7D4AC0]",
      },
    ],
    [
      activeDiseases,
      current,
      trend,
      highRisk,
      reportsThisWeek,
    ],
  );


  return (
    <div className="w-full text-[#101B38]">

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="relative mb-[20px] h-[106px] w-full overflow-hidden rounded-[13px] bg-white">

        <div className="relative z-10 px-[8px] pt-[3px]">

          <h1 className="m-0 text-[24px] font-semibold leading-[32px] tracking-[-0.035em] text-[#101B38]">

            {getGreeting(now)},{" "}
            {supervisor}

            <span className="ml-[6px]">
              👋
            </span>

          </h1>

          <p className="mt-0 text-[11px] leading-[18px] text-[#66727D]">
            Here's your surveillance summary for{" "}
            {location}, {district}.
          </p>

          <div className="mt-[13px] flex items-center gap-[7px] text-[9px] text-[#697587]">

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


        {/* SKYLINE */}
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
            w-[90%]
            object-contain
            object-right-bottom
          "
        />

      </section>


      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <section className="mb-[18px] grid w-full grid-cols-4 gap-[14px]">

        {kpis.map((item) => {

          const Icon = item.icon;

          const clickable =
            item.label ===
              "High Risk Alerts" ||
            item.label ===
              "Reports This Week";

          return (
            <button
              key={item.label}
              type="button"
              onClick={
                item.label ===
                "High Risk Alerts"
                  ? onAlerts
                  : item.label ===
                    "Reports This Week"
                  ? onReports
                  : undefined
              }
              className={`
                flex
                h-[154px]
                items-center
                gap-[18px]
                rounded-[13px]
                border
                border-[#E8ECEA]
                bg-white
                px-[20px]
                text-left
                shadow-[0_2px_10px_rgba(25,50,40,.025)]

                ${
                  clickable
                    ? "cursor-pointer transition hover:-translate-y-[1px] hover:shadow-[0_6px_18px_rgba(25,50,40,.06)]"
                    : "cursor-default"
                }
              `}
            >

              <div
                className={`
                  flex
                  h-[52px]
                  w-[52px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  text-white
                  ${item.iconClass}
                `}
              >
                <Icon
                  size={26}
                  strokeWidth={1.9}
                />
              </div>


              <div className="min-w-0">

                <div className="text-[10px] font-medium text-[#101820]">
                  {item.label}
                </div>

                <div className="mt-[4px] text-[28px] font-semibold leading-none tracking-[-.04em] text-[#101B38]">
                  {item.value}
                </div>


                {item.trend !==
                undefined ? (

                  <div
                    className={`
                      mt-[7px]
                      flex
                      items-center
                      gap-[3px]
                      text-[9px]
                      font-semibold

                      ${
                        trendIsPositive
                          ? "text-[#D33D47]"
                          : "text-[#087A32]"
                      }
                    `}
                  >

                    {trendIsPositive ? (
                      <ArrowUpRight
                        size={11}
                      />
                    ) : (
                      <ArrowDownRight
                        size={11}
                      />
                    )}

                    {Math.abs(
                      item.trend,
                    )}%

                    <span className="font-normal text-[#52627D]">
                      vs last week
                    </span>

                  </div>

                ) : (

                  <div
                    className={`
                      mt-[7px]
                      text-[9px]

                      ${
                        item.danger
                          ? "font-medium text-[#D33D47]"
                          : "text-[#52627D]"
                      }
                    `}
                  >
                    {item.note}
                  </div>

                )}

              </div>

            </button>
          );
        })}

      </section>


      {/* ======================================================
          THREE COLUMN CONTENT
      ====================================================== */}

      <section className="mb-[15px] grid h-[382px] w-full grid-cols-[1.43fr_.99fr_.92fr] gap-[14px]">


        {/* ====================================================
            DISEASE OVERVIEW
        ==================================================== */}

        <section className="overflow-hidden rounded-[13px] border border-[#E7ECEA] bg-white">

          <div className="flex h-[51px] items-center justify-between px-[20px]">

            <h2 className="text-[11px] font-medium tracking-[-.01em] text-[#111820]">
              DISEASE OVERVIEW
            </h2>

            <button
              type="button"
              onClick={onReports}
              className="flex items-center gap-[3px] text-[9px] font-semibold text-[#087A32] hover:text-[#055D26]"
            >
              View All Reports
              <ChevronRight size={12} />
            </button>

          </div>


          <div className="px-[18px]">

            <table className="w-full table-fixed border-collapse text-left">

              <thead>

                <tr className="border-b border-[#EDF0EF] text-[8px] text-[#6D7887]">

                  <th className="w-[31%] pb-[8px] font-medium">
                    Disease
                  </th>

                  <th className="w-[22%] pb-[8px] font-medium">
                    Cases (This Week)
                  </th>

                  <th className="w-[15%] pb-[8px] font-medium">
                    Change
                  </th>

                  <th className="w-[17%] pb-[8px] font-medium">
                    Risk Level
                  </th>

                  <th className="w-[15%] pb-[8px] font-medium">
                    Status
                  </th>

                </tr>

              </thead>


              <tbody>

                {reports
                  .slice(0, 5)
                  .map(
                    (
                      row,
                      index,
                    ) => {

                      const change =
                        Number(
                          row?.change_percent ||
                            0,
                        );

                      const visual =
                        getDiseaseVisual(
                          row?.disease,
                        )?.diseaseImage;

                      return (
                        <tr
                          key={`${row?.disease || "disease"}-${index}`}
                          className="h-[49px] border-b border-[#EEF1EF] last:border-b-0 hover:bg-[#FCFDFC]"
                        >

                          <td className="pr-2">

                            <div className="flex items-center gap-[8px]">

                              <span className="flex h-[25px] w-[25px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#F5F7F6]">

                                {visual ? (
                                  <img
                                    src={visual}
                                    alt=""
                                    draggable="false"
                                    className="h-[24px] w-[24px] object-contain"
                                  />
                                ) : (
                                  <Activity
                                    size={13}
                                    className="text-[#16884A]"
                                  />
                                )}

                              </span>

                              <span className="truncate text-[9px] font-semibold text-[#202A39]">
                                {row?.disease ||
                                  "Unknown"}
                              </span>

                            </div>

                          </td>


                          <td className="text-[9px] font-semibold text-[#172033]">
                            {row?.cases_this_week ??
                              0}
                          </td>


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
                                className="mr-[1px] inline"
                              />
                            ) : change < 0 ? (
                              <ArrowDownRight
                                size={10}
                                className="mr-[1px] inline"
                              />
                            ) : null}

                            {Math.abs(
                              change,
                            )}%

                          </td>


                          <td>

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
                                ${riskClass(
                                  row?.risk_level,
                                )}
                              `}
                            >
                              {row?.risk_level ||
                                "Low"}
                            </span>

                          </td>


                          <td>

                            <span className="inline-flex items-center gap-[7px] whitespace-nowrap text-[9px] font-medium text-[#263246]">

                              <span
                                className={`
                                  h-[8px]
                                  w-[8px]
                                  rounded-full
                                  ${statusDot(
                                    row?.status,
                                  )}
                                `}
                              />

                              {row?.status ||
                                "Stable"}

                            </span>

                          </td>

                        </tr>
                      );
                    },
                  )}

              </tbody>

            </table>


            <button
              type="button"
              onClick={onReports}
              className="mt-[8px] flex w-full items-center justify-center gap-[3px] text-[9px] font-semibold text-[#087A32] hover:text-[#055D26]"
            >
              View All Disease Reports
              <ChevronRight size={12} />
            </button>

          </div>

        </section>


        {/* ====================================================
            RECENT ALERTS
        ==================================================== */}

        <section className="overflow-hidden rounded-[13px] border border-[#E7ECEA] bg-white">

          <div className="flex h-[51px] items-center justify-between px-[20px]">

            <h2 className="text-[11px] font-medium tracking-[-.01em] text-[#111820]">
              RECENT ALERTS
            </h2>

            <button
              type="button"
              onClick={onAlerts}
              className="flex items-center gap-[3px] text-[9px] font-semibold text-[#087A32] hover:text-[#055D26]"
            >
              View All
              <ChevronRight size={12} />
            </button>

          </div>


          <div className="space-y-[10px] px-[11px]">

            {alerts
              .slice(0, 2)
              .map(
                (
                  alert,
                  index,
                ) => (
                  <AlertCard
                    key={`${alert?.title || "alert"}-${index}`}
                    alert={alert}
                    onOpen={onAlerts}
                  />
                ),
              )}

          </div>

        </section>


        {/* ====================================================
            RISK MAP
        ==================================================== */}

        <section className="overflow-hidden rounded-[13px] border border-[#E7ECEA] bg-white">

          <div className="flex h-[51px] items-center justify-between px-[13px] pl-[15px]">

            <h2 className="flex items-center gap-[6px] text-[11px] font-medium tracking-[-.01em] text-[#111820]">

              <MapPin
                size={14}
                strokeWidth={1.8}
              />

              RISK MAP

            </h2>


            <button
              type="button"
              onClick={onRiskMap}
              className="flex items-center gap-[3px] text-[9px] font-semibold text-[#087A32] hover:text-[#055D26]"
            >
              View Full Map
              <ChevronRight size={12} />
            </button>

          </div>


          <button
            type="button"
            onClick={onRiskMap}
            aria-label="Open full risk map"
            className="mx-[9px] block h-[230px] w-[calc(100%-18px)] overflow-hidden rounded-[7px] bg-[#F8FAF9] text-left"
          >
            <img
              src={referenceRiskMap}
              alt="Kodagu disease risk map"
              draggable="false"
              className="h-full w-full object-cover object-center"
            />
          </button>


          <div className="flex items-center justify-between px-[15px] pt-[9px] text-[8px] text-[#52627D]">

            {[
              "Low",
              "Moderate",
              "High",
              "Very High",
            ].map(
              (label) => (
                <span
                  key={label}
                  className="flex items-center gap-[5px]"
                >

                  <i
                    className={`
                      h-[8px]
                      w-[8px]
                      rounded-[2px]

                      ${
                        label === "Low"
                          ? "bg-[#3B9860]"
                          : label ===
                            "Moderate"
                          ? "bg-[#F2A51B]"
                          : label ===
                            "High"
                          ? "bg-[#F37B1B]"
                          : "bg-[#E63232]"
                      }
                    `}
                  />

                  {label}

                </span>
              ),
            )}

          </div>

        </section>

      </section>


      {/* ======================================================
          SURVEILLANCE PULSE
      ====================================================== */}

      <section
        className="
          relative
          h-[200px]
          w-full
          overflow-hidden
          rounded-[13px]
          border
          border-[#E7ECEA]
          bg-white
        "
      >

        {/* HEADER */}

        <div className="flex h-[52px] items-center justify-between px-[20px]">

          <h2 className="flex items-center gap-[7px] text-[11px] font-medium tracking-[-.01em] text-[#111820]">

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
            className="flex items-center gap-[3px] text-[9px] font-semibold text-[#087A32] hover:text-[#055D26]"
          >
            View All Activity
            <ChevronRight size={12} />
          </button>

        </div>


        {/* TIMELINE */}

        <div className="relative h-[148px] px-[20px]">

          {/* HORIZONTAL DOTTED LINE */}

          <div
            className="
              pointer-events-none
              absolute
              left-[31px]
              right-[205px]
              top-[16px]
              border-t
              border-dashed
              border-[#BFCFC5]
            "
          />


          {/* EVENTS */}

          <div
            className="
              relative
              grid
              grid-cols-4
              gap-[18px]
              pr-[190px]
            "
          >

            {pulse.map(
              (
                item,
                index,
              ) => (
                <PulseItem
                  key={`${item?.title || "event"}-${index}`}
                  item={item}
                  index={index}
                />
              ),
            )}

          </div>


          {/* ILLUSTRATION */}

          <img
            src={pulseIllustration}
            alt=""
            draggable="false"
            className="
              pointer-events-none
              absolute
              bottom-[-13px]
              right-[17px]
              z-[5]
              h-[143px]
              w-[220px]
              object-contain
              object-right-bottom
            "
          />

        </div>

      </section>

    </div>
  );
}