import { useEffect, useMemo, useState } from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Clock3,
  Download,
  FileText,
  Info,
  Loader2,
  MoreHorizontal,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  getAdminReportManagementReports,
} from "../../api/reportManagement";


/* ============================================================
   HERO IMAGE
   IMPORTANT:
   Using new URL() makes Vite resolve the JPEG correctly.
============================================================ */

const reportHero = new URL(
  "../../assets/ui/report_management_hero.png",
  import.meta.url
).href;


/* ============================================================
   CONSTANTS
============================================================ */

const PAGE_SIZE = 7;

const STATUS_OPTIONS = [
  "All Status",
  "Approved",
  "Pending Review",
  "Rejected",
  "Draft",
];

const FALLBACK_DISEASES = [
  "All Diseases",
  "Dengue",
  "Chikungunya",
  "Malaria",
  "Leptospirosis",
  "Typhoid",
  "Influenza",
];


/* ============================================================
   HELPERS
============================================================ */

const formatNumber = (value) => {
  return Number(value || 0).toLocaleString("en-IN");
};


const normalizeStatus = (value) => {
  const text = String(value || "Pending Review")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");

  if (
    text === "APPROVED" ||
    text === "APPROVE"
  ) {
    return "Approved";
  }

  if (
    text === "REJECTED" ||
    text === "REJECT"
  ) {
    return "Rejected";
  }

  if (text === "DRAFT") {
    return "Draft";
  }

  return "Pending Review";
};


const statusClass = (status) => {
  switch (normalizeStatus(status)) {
    case "Approved":
      return "bg-[#E8F6EC] text-[#087A32]";

    case "Rejected":
      return "bg-[#FDEBEC] text-[#C62828]";

    case "Draft":
      return "bg-[#EEF1F4] text-[#667085]";

    default:
      return "bg-[#FFF1E4] text-[#D96B16]";
  }
};


const diseaseMeta = (disease) => {
  const name = String(disease || "").toLowerCase();

  if (name.includes("dengue")) {
    return {
      symbol: "✣",
      className: "bg-[#FFF0F1] text-[#D83B3B]",
    };
  }

  if (name.includes("chikungunya")) {
    return {
      symbol: "✺",
      className: "bg-[#F1EBFF] text-[#8258C9]",
    };
  }

  if (name.includes("malaria")) {
    return {
      symbol: "✥",
      className: "bg-[#FFF4E5] text-[#D97706]",
    };
  }

  if (name.includes("lepto")) {
    return {
      symbol: "⌁",
      className: "bg-[#FFF0E8] text-[#D96B16]",
    };
  }

  if (name.includes("typhoid")) {
    return {
      symbol: "◇",
      className: "bg-[#EAF8EF] text-[#16814B]",
    };
  }

  if (name.includes("influenza")) {
    return {
      symbol: "✦",
      className: "bg-[#EDF3FF] text-[#315EA8]",
    };
  }

  return {
    symbol: "✦",
    className: "bg-[#EDF3FF] text-[#315EA8]",
  };
};


const initials = (name = "") => {
  return (
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "AG"
  );
};


const toDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};


const formatDate = (value) => {
  const date = toDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
};


const formatShortDate = (value) => {
  const date = toDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
  }).format(date);
};


const formatTime = (value) => {
  const date = toDate(value);

  if (!date) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};


const dateFromInput = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};


const sameDayOrAfter = (date, from) => {
  if (!date || !from) {
    return true;
  }

  const d = new Date(date);
  const f = new Date(from);

  d.setHours(0, 0, 0, 0);
  f.setHours(0, 0, 0, 0);

  return d >= f;
};


const sameDayOrBefore = (date, to) => {
  if (!date || !to) {
    return true;
  }

  const d = new Date(date);
  const t = new Date(to);

  d.setHours(0, 0, 0, 0);
  t.setHours(0, 0, 0, 0);

  return d <= t;
};


const getWeekStart = (value) => {
  const date = toDate(value) || new Date();

  const result = new Date(date);

  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);

  result.setHours(0, 0, 0, 0);

  return result;
};


/* ============================================================
   STATUS BADGE
============================================================ */

function StatusBadge({ status }) {
  const value = normalizeStatus(status);

  return (
    <span
      className={`
        inline-flex
        items-center
        gap-[5px]
        whitespace-nowrap
        rounded-[5px]
        px-[8px]
        py-[4px]
        text-[8px]
        font-semibold
        ${statusClass(value)}
      `}
    >
      <span
        className="
          h-[5px]
          w-[5px]
          rounded-full
          bg-current
        "
      />

      {value}
    </span>
  );
}


/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon: Icon,
  label,
  value,
  helper,
  tone = "green",
}) {
  const tones = {
    green: "bg-[#EAF7EE] text-[#087A32]",
    orange: "bg-[#FFF0E0] text-[#E98216]",
    purple: "bg-[#F1EBFF] text-[#673AB7]",
    red: "bg-[#FDEBEC] text-[#D92D20]",
  };

  return (
    <div
      className="
        min-h-[118px]
        rounded-[11px]
        border
        border-[#E5EAE7]
        bg-white
        px-[17px]
        py-[16px]
        shadow-[0_2px_8px_rgba(31,49,68,.025)]
      "
    >
      <div
        className="
          flex
          items-start
          gap-[11px]
        "
      >
        <div
          className={`
            flex
            h-[43px]
            w-[43px]
            shrink-0
            items-center
            justify-center
            rounded-full
            ${tones[tone]}
          `}
        >
          <Icon
            size={20}
            strokeWidth={1.7}
          />
        </div>

        <div className="min-w-0">
          <p
            className="
              text-[9px]
              font-semibold
              uppercase
              tracking-[.015em]
              text-[#687386]
            "
          >
            {label}
          </p>

          <p
            className="
              mt-[4px]
              text-[22px]
              font-semibold
              leading-none
              text-[#101A30]
            "
          >
            {value}
          </p>

          <p
            className="
              mt-[7px]
              text-[8px]
              text-[#6E7886]
            "
          >
            {helper}
          </p>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   SELECT FILTER
============================================================ */

function SelectFilter({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="relative block min-w-0">
      <span
        className="
          mb-[4px]
          block
          text-[8px]
          font-medium
          text-[#667085]
        "
      >
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="
          h-[35px]
          w-full
          appearance-none
          rounded-[6px]
          border
          border-[#DCE2DF]
          bg-white
          px-[10px]
          pr-[27px]
          text-[9px]
          font-medium
          text-[#344054]
          outline-none
          focus:border-[#75B98B]
          focus:ring-1
          focus:ring-[#E4F1E8]
        "
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>

      <ChevronDown
        size={12}
        className="
          pointer-events-none
          absolute
          bottom-[11px]
          right-[9px]
          text-[#667085]
        "
      />
    </label>
  );
}


/* ============================================================
   DATE RANGE
============================================================ */

function DateRangeFilter({
  from,
  to,
  onFromChange,
  onToChange,
}) {
  return (
    <div className="min-w-0">
      <p
        className="
          mb-[4px]
          text-[8px]
          font-medium
          text-[#667085]
        "
      >
        Date Range
      </p>

      <div
        className="
          flex
          h-[35px]
          items-center
          gap-[5px]
          rounded-[6px]
          border
          border-[#DCE2DF]
          bg-white
          px-[8px]
        "
      >
        <CalendarDays
          size={12}
          className="
            shrink-0
            text-[#667085]
          "
        />

        <input
          aria-label="Date from"
          type="date"
          value={from}
          onChange={(event) =>
            onFromChange(event.target.value)
          }
          className="
            min-w-0
            flex-1
            bg-transparent
            text-[8px]
            font-medium
            text-[#344054]
            outline-none
          "
        />

        <span className="text-[8px] text-[#98A2B3]">
          –
        </span>

        <input
          aria-label="Date to"
          type="date"
          value={to}
          onChange={(event) =>
            onToChange(event.target.value)
          }
          className="
            min-w-0
            flex-1
            bg-transparent
            text-[8px]
            font-medium
            text-[#344054]
            outline-none
          "
        />
      </div>
    </div>
  );
}


/* ============================================================
   DONUT CHART
============================================================ */

function DonutChart({
  approved,
  pending,
  rejected,
  draft,
  total,
}) {
  const safeTotal = Math.max(Number(total || 0), 1);

  const approvedPct =
    (Number(approved || 0) / safeTotal) * 100;

  const pendingPct =
    (Number(pending || 0) / safeTotal) * 100;

  const rejectedPct =
    (Number(rejected || 0) / safeTotal) * 100;

  const first = approvedPct;

  const second =
    first + pendingPct;

  const third =
    second + rejectedPct;

  const background = `
    conic-gradient(
      #41A85F 0 ${first}%,
      #F2B75E ${first}% ${second}%,
      #E86A75 ${second}% ${third}%,
      #C5CBD3 ${third}% 100%
    )
  `;

  return (
    <div
      className="
        flex
        items-center
        gap-[17px]
      "
    >
      <div
        className="
          relative
          flex
          h-[100px]
          w-[100px]
          shrink-0
          items-center
          justify-center
          rounded-full
        "
        style={{
          background,
        }}
      >
        <div
          className="
            flex
            h-[68px]
            w-[68px]
            flex-col
            items-center
            justify-center
            rounded-full
            bg-white
          "
        >
          <span
            className="
              text-[16px]
              font-semibold
              leading-none
              text-[#172337]
            "
          >
            {formatNumber(total)}
          </span>

          <span
            className="
              mt-[3px]
              text-[8px]
              text-[#667085]
            "
          >
            Total
          </span>
        </div>
      </div>

      <div
        className="
          min-w-0
          flex-1
          space-y-[9px]
        "
      >
        <LegendRow
          dot="bg-[#41A85F]"
          label="Approved"
          value={approved}
          total={total}
        />

        <LegendRow
          dot="bg-[#F2B75E]"
          label="Pending Review"
          value={pending}
          total={total}
        />

        <LegendRow
          dot="bg-[#E86A75]"
          label="Rejected"
          value={rejected}
          total={total}
        />

        <LegendRow
          dot="bg-[#C5CBD3]"
          label="Draft"
          value={draft}
          total={total}
        />
      </div>
    </div>
  );
}


function LegendRow({
  dot,
  label,
  value,
  total,
}) {
  const percent = total
    ? (
        (Number(value || 0) /
          Number(total || 1)) *
        100
      ).toFixed(1)
    : "0.0";

  return (
    <div
      className="
        flex
        items-center
        gap-[7px]
      "
    >
      <span
        className={`
          h-[7px]
          w-[7px]
          shrink-0
          rounded-full
          ${dot}
        `}
      />

      <span
        className="
          min-w-0
          flex-1
          truncate
          text-[8px]
          text-[#475467]
        "
      >
        {label}
      </span>

      <span
        className="
          shrink-0
          text-[8px]
          font-medium
          text-[#344054]
        "
      >
        {formatNumber(value)}
        {" "}
        ({percent}%)
      </span>
    </div>
  );
}


/* ============================================================
   DISEASE BARS
============================================================ */

function DiseaseBars({ reports }) {
  const data = useMemo(() => {
    const counts = new Map();

    reports.forEach((report) => {
      const disease =
        report.disease || "Unknown";

      const current =
        counts.get(disease) || 0;

      counts.set(
        disease,
        current +
          Number(report.cases || 0)
      );
    });

    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);
  }, [reports]);

  const totalCases = Math.max(
    reports.reduce(
      (sum, report) =>
        sum + Number(report.cases || 0),
      0
    ),
    1
  );

  const max = data[0]?.[1] || 1;

  if (!data.length) {
    return (
      <p
        className="
          py-[15px]
          text-center
          text-[9px]
          text-[#98A2B3]
        "
      >
        No disease data available.
      </p>
    );
  }

  return (
    <div className="space-y-[11px]">
      {data.map(([disease, count]) => (
        <div key={disease}>
          <div
            className="
              mb-[4px]
              flex
              items-center
              justify-between
              gap-[8px]
            "
          >
            <span
              className="
                truncate
                text-[9px]
                font-medium
                text-[#344054]
              "
            >
              {disease}
            </span>

            <span
              className="
                shrink-0
                text-[8px]
                text-[#667085]
              "
            >
              {formatNumber(count)}
              {" "}
              (
              {(
                (count / totalCases) *
                100
              ).toFixed(1)}
              %)
            </span>
          </div>

          <div
            className="
              h-[6px]
              overflow-hidden
              rounded-full
              bg-[#EEF1F2]
            "
          >
            <div
              className="
                h-full
                rounded-full
                bg-[#14844B]
              "
              style={{
                width: `${(count / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}


/* ============================================================
   DETAIL FIELD
============================================================ */

function Detail({
  label,
  value,
  plain = false,
}) {
  return (
    <div
      className={
        plain
          ? ""
          : `
            rounded-[8px]
            border
            border-[#E6EBE8]
            bg-[#FBFCFB]
            px-[10px]
            py-[9px]
          `
      }
    >
      <p
        className="
          text-[7px]
          font-semibold
          uppercase
          tracking-[.04em]
          text-[#8A94A3]
        "
      >
        {label}
      </p>

      <p
        className="
          mt-[4px]
          text-[9px]
          font-semibold
          text-[#344054]
        "
      >
        {value}
      </p>
    </div>
  );
}


/* ============================================================
   REPORT DETAILS MODAL
============================================================ */

function ReportDetailsModal({
  report,
  onClose,
}) {
  if (!report) {
    return null;
  }

  const meta = diseaseMeta(report.disease);

  const reportId =
    report.report_id ||
    `RPT-2025-${String(
      report.id
    ).padStart(4, "0")}`;

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-[#0E1B2D]/35
        px-[18px]
        py-[25px]
        backdrop-blur-[2px]
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="
          max-h-[90vh]
          w-full
          max-w-[610px]
          overflow-y-auto
          rounded-[12px]
          border
          border-[#DDE5E0]
          bg-white
          shadow-[0_25px_70px_rgba(16,36,58,.24)]
        "
      >
        <div
          className="
            sticky
            top-0
            z-10
            flex
            items-center
            justify-between
            border-b
            border-[#E7ECE9]
            bg-white
            px-[20px]
            py-[15px]
          "
        >
          <div>
            <p
              className="
                text-[8px]
                font-semibold
                uppercase
                tracking-[.08em]
                text-[#087A32]
              "
            >
              Report Details
            </p>

            <h2
              className="
                mt-[3px]
                text-[17px]
                font-semibold
                text-[#10243A]
              "
            >
              {reportId}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex
              h-[30px]
              w-[30px]
              items-center
              justify-center
              rounded-full
              text-[#667085]
              hover:bg-[#F2F5F3]
            "
          >
            <X size={17} />
          </button>
        </div>

        <div
          className="
            space-y-[13px]
            p-[20px]
          "
        >
          <div
            className="
              flex
              items-center
              justify-between
              gap-[10px]
              rounded-[9px]
              border
              border-[#E4EAE6]
              bg-[#FBFCFB]
              px-[13px]
              py-[11px]
            "
          >
            <div
              className="
                flex
                min-w-0
                items-center
                gap-[9px]
              "
            >
              <div
                className={`
                  flex
                  h-[36px]
                  w-[36px]
                  shrink-0
                  items-center
                  justify-center
                  rounded-[8px]
                  ${meta.className}
                `}
              >
                <span className="text-[17px]">
                  {meta.symbol}
                </span>
              </div>

              <div className="min-w-0">
                <p
                  className="
                    truncate
                    text-[11px]
                    font-semibold
                    text-[#263447]
                  "
                >
                  {report.disease ||
                    "Unknown disease"}
                </p>

                <p
                  className="
                    mt-[2px]
                    text-[8px]
                    text-[#8A94A3]
                  "
                >
                  Submitted by{" "}
                  {report.agent_name ||
                    "Unknown agent"}
                </p>
              </div>
            </div>

            <StatusBadge
              status={report.status}
            />
          </div>

          <div
            className="
              grid
              grid-cols-2
              gap-[9px]
              md:grid-cols-3
            "
          >
            <Detail
              label="District"
              value={
                report.district_name ||
                "—"
              }
            />

            <Detail
              label="Taluk"
              value={
                report.taluk_name ||
                "—"
              }
            />

            <Detail
              label="Cases"
              value={formatNumber(
                report.cases
              )}
            />

            <Detail
              label="Severity"
              value={
                report.severity ||
                "Not specified"
              }
            />

            <Detail
              label="Reporting Week"
              value={
                report.week_number
                  ? `Week ${report.week_number}`
                  : "—"
              }
            />

            <Detail
              label="Submitted On"
              value={formatDate(
                report.created_at
              )}
            />
          </div>

          <div
            className="
              rounded-[9px]
              border
              border-[#DCEBE1]
              bg-[#F5FAF7]
              px-[13px]
              py-[12px]
            "
          >
            <p
              className="
                text-[9px]
                font-semibold
                text-[#173A28]
              "
            >
              Review Information
            </p>

            <div
              className="
                mt-[7px]
                grid
                grid-cols-2
                gap-[8px]
              "
            >
              <Detail
                label="Reviewed By"
                value={
                  report.reviewed_by_name ||
                  "Not reviewed"
                }
                plain
              />

              <Detail
                label="Reviewed On"
                value={
                  report.reviewed_at
                    ? formatDate(
                        report.reviewed_at
                      )
                    : "Not reviewed"
                }
                plain
              />
            </div>
          </div>

          {report.remarks && (
            <div
              className="
                rounded-[9px]
                border
                border-[#E6EBE8]
                bg-white
                px-[13px]
                py-[11px]
              "
            >
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[.04em]
                  text-[#8A94A3]
                "
              >
                Remarks
              </p>

              <p
                className="
                  mt-[5px]
                  text-[9px]
                  leading-[1.65]
                  text-[#52606D]
                "
              >
                {report.remarks}
              </p>
            </div>
          )}

          {report.preventive_measures && (
            <div
              className="
                rounded-[9px]
                border
                border-[#E6EBE8]
                bg-white
                px-[13px]
                py-[11px]
              "
            >
              <p
                className="
                  text-[8px]
                  font-semibold
                  uppercase
                  tracking-[.04em]
                  text-[#8A94A3]
                "
              >
                Preventive Measures
              </p>

              <p
                className="
                  mt-[5px]
                  whitespace-pre-line
                  text-[9px]
                  leading-[1.65]
                  text-[#52606D]
                "
              >
                {report.preventive_measures}
              </p>
            </div>
          )}

          <div
            className="
              flex
              items-start
              gap-[8px]
              rounded-[8px]
              border
              border-[#E1E9F1]
              bg-[#F5F8FB]
              px-[11px]
              py-[10px]
            "
          >
            <Info
              size={14}
              className="
                mt-[1px]
                shrink-0
                text-[#3974B7]
              "
            />

            <p
              className="
                text-[8px]
                leading-[1.6]
                text-[#52606D]
              "
            >
              This is a read-only System
              Administrator view. Report
              verification and
              approval/rejection are performed
              by Medical Supervisors.
            </p>
          </div>
        </div>

        <div
          className="
            flex
            justify-end
            border-t
            border-[#E7ECE9]
            px-[20px]
            py-[12px]
          "
        >
          <button
            type="button"
            onClick={onClose}
            className="
              rounded-[6px]
              bg-[#087A32]
              px-[16px]
              py-[8px]
              text-[9px]
              font-semibold
              text-white
              hover:bg-[#066A2B]
            "
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/* ============================================================
   EMPTY / LOADING STATE
============================================================ */

function EmptyState({
  loading,
  onClear,
  hasFilters,
}) {
  if (loading) {
    return (
      <div
        className="
          flex
          min-h-[300px]
          flex-col
          items-center
          justify-center
        "
      >
        <Loader2
          size={24}
          className="
            animate-spin
            text-[#087A32]
          "
        />

        <p
          className="
            mt-[10px]
            text-[10px]
            font-medium
            text-[#667085]
          "
        >
          Loading surveillance reports...
        </p>
      </div>
    );
  }

  return (
    <div
      className="
        flex
        min-h-[300px]
        flex-col
        items-center
        justify-center
        px-[20px]
      "
    >
      <div
        className="
          flex
          h-[52px]
          w-[52px]
          items-center
          justify-center
          rounded-full
          bg-[#EDF7F0]
          text-[#087A32]
        "
      >
        <FileText
          size={24}
          strokeWidth={1.5}
        />
      </div>

      <p
        className="
          mt-[12px]
          text-[11px]
          font-semibold
          text-[#344054]
        "
      >
        No reports found
      </p>

      <p
        className="
          mt-[4px]
          max-w-[360px]
          text-center
          text-[9px]
          leading-[1.6]
          text-[#7B8794]
        "
      >
        {hasFilters
          ? "Try changing the selected filters or clear the filters to view all submitted reports."
          : "Disease surveillance reports submitted by field agents will appear here."}
      </p>

      {hasFilters && (
        <button
          type="button"
          onClick={onClear}
          className="
            mt-[12px]
            rounded-[6px]
            border
            border-[#CFE1D5]
            bg-white
            px-[12px]
            py-[7px]
            text-[9px]
            font-semibold
            text-[#087A32]
            hover:bg-[#F4FAF6]
          "
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}


/* ============================================================
   MAIN COMPONENT
============================================================ */

export default function DiseaseReports() {
  const [reports, setReports] = useState([]);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [district, setDistrict] =
    useState("All Districts");

  const [taluk, setTaluk] =
    useState("All Taluks");

  const [disease, setDisease] =
    useState("All Diseases");

  const [status, setStatus] =
    useState("All Status");

  const [dateFrom, setDateFrom] =
    useState("");

  const [dateTo, setDateTo] =
    useState("");

  const [page, setPage] =
    useState(1);

  const [selectedReport, setSelectedReport] =
    useState(null);


  /* ==========================================================
     LOAD REPORTS
  ========================================================== */

  const loadReports = async (
    showRefresh = false
  ) => {
    setError("");

    if (showRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const data =
        await getAdminReportManagementReports();

      const rows = Array.isArray(data)
        ? data
        : data?.reports;

      setReports(
        Array.isArray(rows)
          ? rows
          : []
      );
    } catch (err) {
      console.error(
        "Failed to load report management data:",
        err
      );

      setReports([]);

      setError(
        err?.message ||
          "Unable to load surveillance reports."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };


  useEffect(() => {
    loadReports();
  }, []);


  /* ==========================================================
     DISTRICTS
  ========================================================== */

  const districts = useMemo(() => {
    const values = [
      ...new Set(
        reports
          .map(
            (report) =>
              report.district_name
          )
          .filter(Boolean)
      ),
    ].sort();

    return [
      "All Districts",
      ...values,
    ];
  }, [reports]);


  /* ==========================================================
     TALUKS
  ========================================================== */

  const taluks = useMemo(() => {
    const source =
      district === "All Districts"
        ? reports
        : reports.filter(
            (report) =>
              report.district_name ===
              district
          );

    const values = [
      ...new Set(
        source
          .map(
            (report) =>
              report.taluk_name
          )
          .filter(Boolean)
      ),
    ].sort();

    return [
      "All Taluks",
      ...values,
    ];
  }, [
    reports,
    district,
  ]);


  useEffect(() => {
    if (!taluks.includes(taluk)) {
      setTaluk("All Taluks");
    }
  }, [
    taluks,
    taluk,
  ]);


  /* ==========================================================
     DISEASES
  ========================================================== */

  const diseases = useMemo(() => {
    const values = [
      ...new Set(
        reports
          .map(
            (report) =>
              report.disease
          )
          .filter(Boolean)
      ),
    ].sort();

    if (!values.length) {
      return FALLBACK_DISEASES;
    }

    return [
      "All Diseases",
      ...values,
    ];
  }, [reports]);


  /* ==========================================================
     FILTERED REPORTS
  ========================================================== */

  const filteredReports = useMemo(() => {
    const query =
      search
        .trim()
        .toLowerCase();

    const from =
      dateFromInput(dateFrom);

    const to =
      dateFromInput(dateTo);

    return reports.filter(
      (report) => {
        const haystack = [
          report.id,
          report.report_id,
          report.disease,
          report.district_name,
          report.taluk_name,
          report.agent_name,
        ]
          .map((value) =>
            String(
              value || ""
            ).toLowerCase()
          )
          .join(" ");

        const matchesSearch =
          !query ||
          haystack.includes(query);

        const matchesDistrict =
          district ===
            "All Districts" ||
          report.district_name ===
            district;

        const matchesTaluk =
          taluk ===
            "All Taluks" ||
          report.taluk_name ===
            taluk;

        const matchesDisease =
          disease ===
            "All Diseases" ||
          String(
            report.disease || ""
          ).toLowerCase() ===
            disease.toLowerCase();

        const matchesStatus =
          status ===
            "All Status" ||
          normalizeStatus(
            report.status
          ) === status;

        const created =
          toDate(
            report.created_at
          );

        const matchesFrom =
          sameDayOrAfter(
            created,
            from
          );

        const matchesTo =
          sameDayOrBefore(
            created,
            to
          );

        return (
          matchesSearch &&
          matchesDistrict &&
          matchesTaluk &&
          matchesDisease &&
          matchesStatus &&
          matchesFrom &&
          matchesTo
        );
      }
    );
  }, [
    reports,
    search,
    district,
    taluk,
    disease,
    status,
    dateFrom,
    dateTo,
  ]);


  /* ==========================================================
     SORT
  ========================================================== */

  const sortedReports = useMemo(() => {
    return [...filteredReports].sort(
      (a, b) => {
        const dateA =
          toDate(
            a.created_at
          )?.getTime() || 0;

        const dateB =
          toDate(
            b.created_at
          )?.getTime() || 0;

        return (
          dateB - dateA ||
          Number(b.id || 0) -
            Number(a.id || 0)
        );
      }
    );
  }, [filteredReports]);


  /* ==========================================================
     PAGINATION
  ========================================================== */

  const totalPages = Math.max(
    1,
    Math.ceil(
      sortedReports.length /
        PAGE_SIZE
    )
  );


  useEffect(() => {
    setPage(1);
  }, [
    search,
    district,
    taluk,
    disease,
    status,
    dateFrom,
    dateTo,
  ]);


  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [
    page,
    totalPages,
  ]);


  const paginatedReports =
    sortedReports.slice(
      (page - 1) *
        PAGE_SIZE,
      page *
        PAGE_SIZE
    );


  /* ==========================================================
     STATISTICS
  ========================================================== */

  const stats = useMemo(() => {
    const total =
      reports.length;

    const approved =
      reports.filter(
        (report) =>
          normalizeStatus(
            report.status
          ) === "Approved"
      ).length;

    const pending =
      reports.filter(
        (report) =>
          normalizeStatus(
            report.status
          ) ===
          "Pending Review"
      ).length;

    const rejected =
      reports.filter(
        (report) =>
          normalizeStatus(
            report.status
          ) === "Rejected"
      ).length;

    const draft =
      reports.filter(
        (report) =>
          normalizeStatus(
            report.status
          ) === "Draft"
      ).length;

    const latest =
      [...reports].sort(
        (a, b) =>
          (
            toDate(
              b.created_at
            )?.getTime() || 0
          ) -
          (
            toDate(
              a.created_at
            )?.getTime() || 0
          )
      )[0];

    const weekStart =
      getWeekStart(
        latest?.created_at
      );

    const newThisWeek =
      reports.filter(
        (report) => {
          const date =
            toDate(
              report.created_at
            );

          return (
            date &&
            date >= weekStart
          );
        }
      ).length;

    return {
      total,
      approved,
      pending,
      rejected,
      draft,
      newThisWeek,
      approvalRate:
        total
          ? (
              (approved /
                total) *
              100
            ).toFixed(1)
          : "0.0",
    };
  }, [reports]);


  /* ==========================================================
     REPORT DATE RANGE
  ========================================================== */

  const reportDateRange =
    useMemo(() => {
      const dates =
        reports
          .map(
            (report) =>
              toDate(
                report.created_at
              )
          )
          .filter(Boolean)
          .sort(
            (a, b) =>
              a - b
          );

      return {
        min:
          dates[0] || null,
        max:
          dates[
            dates.length - 1
          ] || null,
      };
    }, [reports]);


  /* ==========================================================
     RECENT ACTIVITY
  ========================================================== */

  const activity =
    useMemo(() => {
      return [...reports]
        .sort(
          (a, b) =>
            (
              toDate(
                b.created_at
              )?.getTime() || 0
            ) -
            (
              toDate(
                a.created_at
              )?.getTime() || 0
            )
        )
        .slice(0, 4);
    }, [reports]);


  /* ==========================================================
     CLEAR FILTERS
  ========================================================== */

  const clearFilters = () => {
    setSearch("");
    setDistrict("All Districts");
    setTaluk("All Taluks");
    setDisease("All Diseases");
    setStatus("All Status");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };


  const hasFilters =
    Boolean(search.trim()) ||
    district !== "All Districts" ||
    taluk !== "All Taluks" ||
    disease !== "All Diseases" ||
    status !== "All Status" ||
    Boolean(dateFrom) ||
    Boolean(dateTo);


  /* ==========================================================
     CSV EXPORT
  ========================================================== */

  const exportCsv = () => {
    if (!sortedReports.length) {
      return;
    }

    const headers = [
      "Report ID",
      "Disease",
      "District",
      "Taluk",
      "Submitted By",
      "Submitted On",
      "Cases",
      "Severity",
      "Status",
      "Reviewed By",
      "Reviewed On",
    ];

    const escapeCsv = (value) =>
      `"${String(
        value ?? ""
      ).replace(
        /"/g,
        '""'
      )}"`;

    const rows =
      sortedReports.map(
        (report) =>
          [
            report.report_id ||
              `RPT-2025-${String(
                report.id
              ).padStart(
                4,
                "0"
              )}`,

            report.disease,

            report.district_name,

            report.taluk_name,

            report.agent_name,

            report.created_at
              ? formatDate(
                  report.created_at
                )
              : "",

            report.cases ?? 0,

            report.severity || "",

            normalizeStatus(
              report.status
            ),

            report.reviewed_by_name ||
              "",

            report.reviewed_at
              ? formatDate(
                  report.reviewed_at
                )
              : "",
          ]
            .map(escapeCsv)
            .join(",")
      );

    const csv = [
      headers
        .map(escapeCsv)
        .join(","),
      ...rows,
    ].join("\n");

    const blob =
      new Blob(
        [csv],
        {
          type:
            "text/csv;charset=utf-8;",
        }
      );

    const url =
      URL.createObjectURL(
        blob
      );

    const link =
      document.createElement(
        "a"
      );

    link.href = url;

    link.download =
      `surveillance-reports-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`;

    document.body.appendChild(
      link
    );

    link.click();

    document.body.removeChild(
      link
    );

    URL.revokeObjectURL(
      url
    );
  };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="
        w-full
        pb-[10px]
      "
    >

      {/* ======================================================
          HERO
      ======================================================= */}

      <section
        className="
          relative
          mb-[10px]
          min-h-[166px]
          overflow-hidden
          rounded-[11px]
          border
          border-[#E6EBE8]
          bg-white
        "
      >
        {/* LEFT CONTENT */}

        <div
          className="
            relative
            z-[3]
            flex
            min-h-[166px]
            w-[58%]
            flex-col
            justify-center
            px-[30px]
            py-[22px]
          "
        >
          <div
            className="
              flex
              items-center
              gap-[7px]
            "
          >
            <h1
              className="
                text-[25px]
                font-semibold
                leading-none
                tracking-[-.035em]
                text-[#0C1830]
              "
            >
              Report Management
            </h1>

            <span
              className="
                flex
                h-[16px]
                w-[16px]
                items-center
                justify-center
                rounded-full
                border
                border-[#98A2B3]
                text-[#667085]
              "
            >
              <Info size={10} />
            </span>
          </div>

          <p
            className="
              mt-[9px]
              max-w-[520px]
              text-[10px]
              leading-[1.7]
              text-[#52606D]
            "
          >
            View disease surveillance
            reports submitted by field
            agents across all taluks in
            the assigned districts. As
            System Administrator, you can
            review status and track progress
            only.{" "}

            <span
              className="
                font-semibold
                text-[#087A32]
              "
            >
              No modifications are allowed.
            </span>
          </p>

          <div
            className="
              mt-[14px]
              flex
              items-center
              gap-[7px]
            "
          >
            <span
              className="
                inline-flex
                items-center
                gap-[6px]
                rounded-[6px]
                border
                border-[#DDE9E0]
                bg-[#F5FAF7]
                px-[9px]
                py-[6px]
                text-[8px]
                font-semibold
                text-[#087A32]
              "
            >
              <ShieldCheck size={11} />

              Read-only view
            </span>

            <span
              className="
                inline-flex
                items-center
                gap-[6px]
                rounded-[6px]
                border
                border-[#E3E7EA]
                bg-white
                px-[9px]
                py-[6px]
                text-[8px]
                font-medium
                text-[#667085]
              "
            >
              <FileText size={11} />

              {formatNumber(
                stats.total
              )}{" "}
              reports
            </span>
          </div>
        </div>


        {/* RIGHT HERO IMAGE */}

        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            right-0
            z-[1]
            w-[49%]
            overflow-hidden
          "
        >
          <img
            src={reportHero}
            alt="Disease surveillance report management"
            draggable="false"
            className="
              block
              h-full
              w-full
              select-none
              object-cover
              object-right
            "
            onError={(event) => {
              console.error(
                "Report Management hero image failed to load:",
                event.currentTarget.src
              );
            }}
          />
        </div>

        {/* SOFT WHITE FADE OVER IMAGE */}

        <div
          className="
            pointer-events-none
            absolute
            inset-y-0
            left-[48%]
            z-[2]
            w-[12%]
            bg-gradient-to-r
            from-white
            to-transparent
          "
        />
      </section>


      {/* ======================================================
          STAT CARDS
      ======================================================= */}

      <section
        className="
          grid
          grid-cols-2
          gap-[10px]
          xl:grid-cols-5
        "
      >
        <StatCard
          icon={FileText}
          label="Total Reports"
          value={formatNumber(
            stats.total
          )}
          helper="All time"
          tone="green"
        />

        <StatCard
          icon={CalendarDays}
          label="New Reports"
          value={formatNumber(
            stats.newThisWeek
          )}
          helper="This week"
          tone="green"
        />

        <StatCard
          icon={Clock3}
          label="Pending Review"
          value={formatNumber(
            stats.pending
          )}
          helper="Awaiting review"
          tone="orange"
        />

        <StatCard
          icon={CheckCircle2}
          label="Approved"
          value={formatNumber(
            stats.approved
          )}
          helper={`${stats.approvalRate}% approval rate`}
          tone="purple"
        />

        <StatCard
          icon={X}
          label="Rejected"
          value={formatNumber(
            stats.rejected
          )}
          helper="Reports rejected"
          tone="red"
        />
      </section>


      {/* ======================================================
          MAIN CONTENT
      ======================================================= */}

      <section
        className="
          mt-[10px]
          grid
          grid-cols-1
          gap-[10px]
          xl:grid-cols-[minmax(0,1fr)_340px]
        "
      >

        {/* ====================================================
            REPORT TABLE
        ===================================================== */}

        <div
          className="
            min-w-0
            overflow-hidden
            rounded-[11px]
            border
            border-[#E3E8E5]
            bg-white
            shadow-[0_2px_8px_rgba(31,49,68,.025)]
          "
        >

          {/* FILTER AREA */}

          <div
            className="
              border-b
              border-[#E7ECE9]
              px-[12px]
              py-[12px]
            "
          >
            <div
              className="
                grid
                grid-cols-1
                gap-[9px]
                md:grid-cols-[minmax(190px,1.5fr)_minmax(175px,1.15fr)_minmax(120px,.75fr)_minmax(120px,.75fr)_minmax(120px,.75fr)]
              "
            >

              {/* SEARCH */}

              <div className="min-w-0">
                <p
                  className="
                    mb-[4px]
                    text-[8px]
                    font-medium
                    text-[#667085]
                  "
                >
                  Search
                </p>

                <div className="relative">

                  <Search
                    size={13}
                    className="
                      pointer-events-none
                      absolute
                      left-[9px]
                      top-1/2
                      z-[2]
                      -translate-y-1/2
                      text-[#8A94A3]
                    "
                  />

                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="Search reports by ID, disease, district, taluk..."
                    className="
                      h-[35px]
                      w-full
                      rounded-[6px]
                      border
                      border-[#DCE2DF]
                      bg-white
                      pl-[29px]
                      pr-[8px]
                      text-[9px]
                      text-[#344054]
                      outline-none
                      placeholder:text-[#98A2B3]
                      focus:border-[#75B98B]
                      focus:ring-1
                      focus:ring-[#E4F1E8]
                    "
                  />
                </div>
              </div>


              {/* DATE */}

              <DateRangeFilter
                from={dateFrom}
                to={dateTo}
                onFromChange={
                  setDateFrom
                }
                onToChange={
                  setDateTo
                }
              />


              {/* DISTRICT */}

              <SelectFilter
                label="District"
                value={district}
                options={districts}
                onChange={
                  setDistrict
                }
              />


              {/* TALUK */}

              <SelectFilter
                label="Taluk"
                value={taluk}
                options={taluks}
                onChange={
                  setTaluk
                }
              />


              {/* DISEASE */}

              <SelectFilter
                label="Disease"
                value={disease}
                options={diseases}
                onChange={
                  setDisease
                }
              />
            </div>


            {/* SECOND FILTER ROW */}

            <div
              className="
                mt-[8px]
                flex
                flex-wrap
                items-end
                justify-between
                gap-[8px]
              "
            >
              <SelectFilter
                label="Status"
                value={status}
                options={
                  STATUS_OPTIONS
                }
                onChange={
                  setStatus
                }
              />

              <div
                className="
                  flex
                  items-center
                  gap-[6px]
                "
              >
                <div
                  className="
                    hidden
                    pt-[13px]
                    text-[8px]
                    text-[#98A2B3]
                    md:block
                  "
                >
                  {dateFrom || dateTo
                    ? `${dateFrom || "All"} – ${
                        dateTo || "All"
                      }`
                    : "All dates"}
                </div>

                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  disabled={
                    !hasFilters
                  }
                  className="
                    h-[31px]
                    rounded-[6px]
                    border
                    border-transparent
                    px-[9px]
                    text-[8px]
                    font-semibold
                    text-[#087A32]
                    hover:bg-[#F2F8F4]
                    disabled:cursor-default
                    disabled:text-[#B7BEB9]
                  "
                >
                  Clear Filters
                </button>

                <button
                  type="button"
                  onClick={() =>
                    loadReports(
                      true
                    )
                  }
                  disabled={
                    loading ||
                    refreshing
                  }
                  className="
                    flex
                    h-[31px]
                    items-center
                    gap-[5px]
                    rounded-[6px]
                    border
                    border-[#DCE3DE]
                    bg-white
                    px-[9px]
                    text-[8px]
                    font-semibold
                    text-[#344054]
                    hover:bg-[#F7F9F8]
                    disabled:opacity-50
                  "
                >
                  <RefreshCw
                    size={11}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>

                <button
                  type="button"
                  onClick={
                    exportCsv
                  }
                  disabled={
                    !sortedReports.length
                  }
                  className="
                    flex
                    h-[31px]
                    items-center
                    gap-[5px]
                    rounded-[6px]
                    bg-[#087A32]
                    px-[10px]
                    text-[8px]
                    font-semibold
                    text-white
                    hover:bg-[#066A2B]
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  <Download
                    size={11}
                  />

                  Export
                </button>
              </div>
            </div>
          </div>


          {/* READ ONLY MESSAGE */}

          <div
            className="
              mx-[12px]
              mt-[10px]
              flex
              items-center
              gap-[7px]
              rounded-[7px]
              border
              border-[#DCE8F4]
              bg-[#F4F8FC]
              px-[10px]
              py-[8px]
            "
          >
            <Info
              size={13}
              className="
                shrink-0
                text-[#3D76B4]
              "
            />

            <p
              className="
                text-[8px]
                font-medium
                text-[#52606D]
              "
            >
              You are viewing reports in
              read-only mode. No changes can
              be made.
            </p>
          </div>


          {/* ERROR */}

          {error && (
            <div
              className="
                mx-[12px]
                mt-[8px]
                flex
                items-center
                gap-[8px]
                rounded-[7px]
                border
                border-[#F2CECA]
                bg-[#FFF7F6]
                px-[10px]
                py-[8px]
                text-[8px]
                text-[#B42318]
              "
            >
              <Info size={12} />

              <span className="flex-1">
                {error}
              </span>

              <button
                type="button"
                onClick={() =>
                  loadReports(
                    true
                  )
                }
                className="font-semibold underline"
              >
                Retry
              </button>
            </div>
          )}


          {/* TABLE */}

          <div
            className="
              mt-[8px]
              overflow-x-auto
            "
          >
            <table
              className="
                min-w-[930px]
                w-full
                border-collapse
              "
            >
              <thead>
                <tr
                  className="
                    border-y
                    border-[#E7ECE9]
                    bg-[#FBFCFB]
                  "
                >
                  <th className="table-head">
                    Report ID
                  </th>

                  <th className="table-head">
                    Disease
                  </th>

                  <th className="table-head">
                    District
                  </th>

                  <th className="table-head">
                    Taluk
                  </th>

                  <th className="table-head">
                    Submitted By
                  </th>

                  <th className="table-head">
                    Submitted On
                  </th>

                  <th
                    className="
                      px-[8px]
                      py-[9px]
                      text-center
                      text-[7px]
                      font-semibold
                      uppercase
                      tracking-[.025em]
                      text-[#667085]
                    "
                  >
                    Status
                  </th>

                  <th
                    className="
                      px-[7px]
                      py-[9px]
                      text-center
                      text-[7px]
                      font-semibold
                      uppercase
                      tracking-[.025em]
                      text-[#667085]
                    "
                  >
                    Reviewed By
                  </th>

                  <th
                    className="
                      w-[35px]
                      px-[5px]
                      py-[9px]
                      text-center
                      text-[7px]
                      font-semibold
                      uppercase
                      tracking-[.025em]
                      text-[#667085]
                    "
                  >
                    View
                  </th>
                </tr>
              </thead>


              <tbody>
                {loading ||
                paginatedReports.length ===
                  0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="p-0"
                    >
                      <EmptyState
                        loading={
                          loading
                        }
                        hasFilters={
                          hasFilters
                        }
                        onClear={
                          clearFilters
                        }
                      />
                    </td>
                  </tr>
                ) : (
                  paginatedReports.map(
                    (
                      report,
                      index
                    ) => {
                      const meta =
                        diseaseMeta(
                          report.disease
                        );

                      const reportId =
                        report.report_id ||
                        `RPT-2025-${String(
                          report.id
                        ).padStart(
                          4,
                          "0"
                        )}`;

                      return (
                        <tr
                          key={`${report.id}-${index}`}
                          onClick={() =>
                            setSelectedReport(
                              report
                            )
                          }
                          className="
                            cursor-pointer
                            border-b
                            border-[#EEF1EF]
                            hover:bg-[#FAFCFB]
                          "
                        >

                          {/* REPORT ID */}

                          <td
                            className="
                              px-[12px]
                              py-[10px]
                            "
                          >
                            <p
                              className="
                                text-[8px]
                                font-semibold
                                text-[#263447]
                              "
                            >
                              {reportId}
                            </p>

                            <button
                              type="button"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                setSelectedReport(
                                  report
                                );
                              }}
                              className="
                                mt-[2px]
                                text-[7px]
                                font-medium
                                text-[#087A32]
                                hover:underline
                              "
                            >
                              View Details
                            </button>
                          </td>


                          {/* DISEASE */}

                          <td
                            className="
                              px-[8px]
                              py-[10px]
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-[7px]
                              "
                            >
                              <div
                                className={`
                                  flex
                                  h-[25px]
                                  w-[25px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  ${meta.className}
                                `}
                              >
                                <span className="text-[12px]">
                                  {meta.symbol}
                                </span>
                              </div>

                              <span
                                className="
                                  text-[8px]
                                  font-medium
                                  text-[#344054]
                                "
                              >
                                {report.disease ||
                                  "—"}
                              </span>
                            </div>
                          </td>


                          {/* DISTRICT */}

                          <td
                            className="
                              px-[8px]
                              py-[10px]
                            "
                          >
                            <span
                              className="
                                text-[8px]
                                text-[#475467]
                              "
                            >
                              {report.district_name ||
                                "—"}
                            </span>
                          </td>


                          {/* TALUK */}

                          <td
                            className="
                              px-[8px]
                              py-[10px]
                            "
                          >
                            <span
                              className="
                                text-[8px]
                                text-[#475467]
                              "
                            >
                              {report.taluk_name ||
                                "—"}
                            </span>
                          </td>


                          {/* AGENT */}

                          <td
                            className="
                              px-[8px]
                              py-[10px]
                            "
                          >
                            <div
                              className="
                                flex
                                items-center
                                gap-[6px]
                              "
                            >
                              <div
                                className="
                                  flex
                                  h-[24px]
                                  w-[24px]
                                  shrink-0
                                  items-center
                                  justify-center
                                  rounded-full
                                  bg-[#EAF6EE]
                                  text-[7px]
                                  font-semibold
                                  text-[#087A32]
                                "
                              >
                                {initials(
                                  report.agent_name
                                )}
                              </div>

                              <div className="min-w-0">
                                <p
                                  className="
                                    truncate
                                    text-[8px]
                                    font-medium
                                    text-[#344054]
                                  "
                                >
                                  {report.agent_name ||
                                    "—"}
                                </p>

                                <p
                                  className="
                                    text-[7px]
                                    text-[#98A2B3]
                                  "
                                >
                                  Field Agent
                                </p>
                              </div>
                            </div>
                          </td>


                          {/* SUBMITTED */}

                          <td
                            className="
                              px-[8px]
                              py-[10px]
                            "
                          >
                            <p
                              className="
                                text-[8px]
                                font-medium
                                text-[#344054]
                              "
                            >
                              {formatDate(
                                report.created_at
                              )}
                            </p>

                            <p
                              className="
                                mt-[2px]
                                text-[7px]
                                text-[#98A2B3]
                              "
                            >
                              {formatTime(
                                report.created_at
                              )}
                            </p>
                          </td>


                          {/* STATUS */}

                          <td
                            className="
                              px-[8px]
                              py-[10px]
                              text-center
                            "
                          >
                            <StatusBadge
                              status={
                                report.status
                              }
                            />
                          </td>


                          {/* REVIEWER */}

                          <td
                            className="
                              px-[7px]
                              py-[10px]
                              text-center
                            "
                          >
                            <div
                              className="
                                mx-auto
                                max-w-[90px]
                              "
                            >
                              <p
                                className="
                                  truncate
                                  text-[7px]
                                  font-medium
                                  text-[#344054]
                                "
                              >
                                {report.reviewed_by_name ||
                                  "—"}
                              </p>

                              <p
                                className="
                                  mt-[2px]
                                  text-[6px]
                                  text-[#98A2B3]
                                "
                              >
                                {report.reviewed_at
                                  ? formatDate(
                                      report.reviewed_at
                                    )
                                  : "—"}
                              </p>
                            </div>
                          </td>


                          {/* VIEW */}

                          <td
                            className="
                              px-[5px]
                              py-[10px]
                              text-center
                            "
                          >
                            <button
                              type="button"
                              title="View report"
                              onClick={(
                                event
                              ) => {
                                event.stopPropagation();

                                setSelectedReport(
                                  report
                                );
                              }}
                              className="
                                inline-flex
                                h-[26px]
                                w-[26px]
                                items-center
                                justify-center
                                rounded-[6px]
                                text-[#667085]
                                hover:bg-[#EEF5F0]
                                hover:text-[#087A32]
                              "
                            >
                              <MoreHorizontal
                                size={14}
                              />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>


          {/* PAGINATION */}

          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-[8px]
              border-t
              border-[#E7ECE9]
              px-[12px]
              py-[9px]
            "
          >
            <p
              className="
                text-[7px]
                text-[#667085]
              "
            >
              {sortedReports.length ===
              0
                ? "Showing 0 of 0 reports"
                : `Showing ${
                    (page - 1) *
                      PAGE_SIZE +
                    1
                  } to ${Math.min(
                    page *
                      PAGE_SIZE,
                    sortedReports.length
                  )} of ${formatNumber(
                    sortedReports.length
                  )} reports`}
            </p>

            <div
              className="
                flex
                items-center
                gap-[3px]
              "
            >
              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(1)
                }
                className="
                  pagination-button
                "
              >
                <ChevronsLeft
                  size={12}
                />
              </button>

              <button
                type="button"
                disabled={page <= 1}
                onClick={() =>
                  setPage(
                    (value) =>
                      Math.max(
                        1,
                        value - 1
                      )
                  )
                }
                className="
                  pagination-button
                "
              >
                <ChevronLeft
                  size={12}
                />
              </button>

              {Array.from(
                {
                  length: Math.min(
                    totalPages,
                    5
                  ),
                },
                (_, index) => {
                  let number =
                    index + 1;

                  if (
                    totalPages >
                      5 &&
                    page > 3 &&
                    page <
                      totalPages - 2
                  ) {
                    number =
                      page -
                      2 +
                      index;
                  } else if (
                    totalPages >
                      5 &&
                    page >=
                      totalPages - 2
                  ) {
                    number =
                      totalPages -
                      4 +
                      index;
                  }

                  return (
                    <button
                      key={number}
                      type="button"
                      onClick={() =>
                        setPage(
                          number
                        )
                      }
                      className={`
                        flex
                        h-[27px]
                        min-w-[27px]
                        items-center
                        justify-center
                        rounded-[5px]
                        border
                        px-[6px]
                        text-[8px]
                        font-semibold
                        ${
                          page ===
                          number
                            ? "border-[#087A32] bg-[#087A32] text-white"
                            : "border-[#DCE3DE] bg-white text-[#667085] hover:bg-[#F6F8F7]"
                        }
                      `}
                    >
                      {number}
                    </button>
                  );
                }
              )}

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    (value) =>
                      Math.min(
                        totalPages,
                        value + 1
                      )
                  )
                }
                className="
                  pagination-button
                "
              >
                <ChevronRight
                  size={12}
                />
              </button>

              <button
                type="button"
                disabled={
                  page >=
                  totalPages
                }
                onClick={() =>
                  setPage(
                    totalPages
                  )
                }
                className="
                  pagination-button
                "
              >
                <ChevronsRight
                  size={12}
                />
              </button>
            </div>
          </div>
        </div>


        {/* ====================================================
            RIGHT ANALYTICS
        ===================================================== */}

        <aside
          className="
            space-y-[10px]
          "
        >

          {/* REPORTS BY STATUS */}

          <div
            className="
              rounded-[11px]
              border
              border-[#E3E8E5]
              bg-white
              px-[15px]
              py-[14px]
              shadow-[0_2px_8px_rgba(31,49,68,.025)]
            "
          >
            <div
              className="
                mb-[13px]
                flex
                items-center
                justify-between
              "
            >
              <h2
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[.02em]
                  text-[#1E2B3E]
                "
              >
                Reports by Status
              </h2>

              <span
                className="
                  text-[7px]
                  text-[#98A2B3]
                "
              >
                All reports
              </span>
            </div>

            <DonutChart
              approved={
                stats.approved
              }
              pending={
                stats.pending
              }
              rejected={
                stats.rejected
              }
              draft={
                stats.draft
              }
              total={
                stats.total
              }
            />
          </div>


          {/* REPORTS BY DISEASE */}

          <div
            className="
              rounded-[11px]
              border
              border-[#E3E8E5]
              bg-white
              px-[15px]
              py-[14px]
              shadow-[0_2px_8px_rgba(31,49,68,.025)]
            "
          >
            <div
              className="
                mb-[13px]
                flex
                items-center
                justify-between
              "
            >
              <h2
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[.02em]
                  text-[#1E2B3E]
                "
              >
                Reports by Disease (Top 5)
              </h2>
            </div>

            <DiseaseBars
              reports={reports}
            />
          </div>


          {/* RECENT ACTIVITY */}

          <div
            className="
              rounded-[11px]
              border
              border-[#E3E8E5]
              bg-white
              px-[15px]
              py-[14px]
              shadow-[0_2px_8px_rgba(31,49,68,.025)]
            "
          >
            <div
              className="
                mb-[13px]
                flex
                items-center
                justify-between
              "
            >
              <h2
                className="
                  text-[10px]
                  font-semibold
                  uppercase
                  tracking-[.02em]
                  text-[#1E2B3E]
                "
              >
                Recent Activity
              </h2>
            </div>

            <div
              className="
                space-y-[10px]
              "
            >
              {activity.length ===
              0 ? (
                <p
                  className="
                    py-[12px]
                    text-center
                    text-[8px]
                    text-[#98A2B3]
                  "
                >
                  No recent activity.
                </p>
              ) : (
                activity.map(
                  (report) => {
                    const currentStatus =
                      normalizeStatus(
                        report.status
                      );

                    const iconClass =
                      currentStatus ===
                      "Approved"
                        ? "bg-[#EAF7EE] text-[#087A32]"
                        : currentStatus ===
                          "Rejected"
                        ? "bg-[#FDEBEC] text-[#D92D20]"
                        : "bg-[#FFF3E4] text-[#D97706]";

                    return (
                      <button
                        type="button"
                        key={`activity-${report.id}`}
                        onClick={() =>
                          setSelectedReport(
                            report
                          )
                        }
                        className="
                          flex
                          w-full
                          items-start
                          gap-[8px]
                          text-left
                          hover:bg-[#FAFCFB]
                        "
                      >
                        <span
                          className={`
                            flex
                            h-[25px]
                            w-[25px]
                            shrink-0
                            items-center
                            justify-center
                            rounded-full
                            ${iconClass}
                          `}
                        >
                          {currentStatus ===
                          "Approved" ? (
                            <CheckCircle2
                              size={13}
                            />
                          ) : currentStatus ===
                            "Rejected" ? (
                            <X
                              size={13}
                            />
                          ) : (
                            <Clock3
                              size={13}
                            />
                          )}
                        </span>

                        <span
                          className="
                            min-w-0
                            flex-1
                          "
                        >
                          <span
                            className="
                              block
                              text-[8px]
                              font-medium
                              leading-[1.45]
                              text-[#344054]
                            "
                          >
                            {report.report_id ||
                              `RPT-2025-${report.id}`}
                            {" "}
                            ({report.disease})
                            {" "}
                            {currentStatus.toLowerCase()}
                          </span>

                          <span
                            className="
                              mt-[2px]
                              block
                              text-[7px]
                              text-[#98A2B3]
                            "
                          >
                            {report.reviewed_by_name
                              ? `by ${report.reviewed_by_name}`
                              : `submitted by ${
                                  report.agent_name ||
                                  "Field Agent"
                                }`}
                          </span>
                        </span>

                        <span
                          className="
                            shrink-0
                            pt-[1px]
                            text-[7px]
                            text-[#667085]
                          "
                        >
                          {formatShortDate(
                            report.created_at
                          )}
                        </span>
                      </button>
                    );
                  }
                )
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus(
                  "All Status"
                );
                setPage(1);
              }}
              className="
                mt-[12px]
                w-full
                rounded-[6px]
                border
                border-[#DDE8E0]
                py-[7px]
                text-[8px]
                font-semibold
                text-[#087A32]
                hover:bg-[#F5FAF7]
              "
            >
              View All Activities →
            </button>
          </div>
        </aside>
      </section>


      {/* ======================================================
          BOTTOM NOTICE
      ======================================================= */}

      <section
        className="
          mt-[10px]
          rounded-[10px]
          border
          border-[#DCE9E0]
          bg-[#F5FAF7]
          px-[15px]
          py-[11px]
        "
      >
        <div
          className="
            flex
            items-center
            gap-[9px]
          "
        >
          <div
            className="
              flex
              h-[31px]
              w-[31px]
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-[#E7F4EB]
              text-[#087A32]
            "
          >
            <ShieldCheck
              size={16}
            />
          </div>

          <div className="min-w-0 flex-1">
            <p
              className="
                text-[9px]
                font-semibold
                text-[#087A32]
              "
            >
              This is a read-only view
              for System Administrators.
            </p>

            <p
              className="
                mt-[2px]
                text-[8px]
                text-[#667085]
              "
            >
              Report verification and
              approval/rejection are
              performed by Medical
              Supervisors.
            </p>
          </div>

          <span
            className="
              hidden
              items-center
              gap-[5px]
              text-[8px]
              font-semibold
              text-[#087A32]
              md:flex
            "
          >
            <Info size={12} />

            Learn more →
          </span>
        </div>
      </section>


      {/* ======================================================
          REPORT DETAILS MODAL
      ======================================================= */}

      <ReportDetailsModal
        report={
          selectedReport
        }
        onClose={() =>
          setSelectedReport(
            null
          )
        }
      />


      {/* ======================================================
          LOCAL UTILITY CLASSES

          These are arbitrary Tailwind-compatible classes
          expressed through JSX style attributes above.
      ======================================================= */}

      <style>{`
        .table-head {
          padding: 9px 12px;
          text-align: left;
          font-size: 7px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: .025em;
          color: #667085;
        }

        .pagination-button {
          display: flex;
          height: 27px;
          width: 27px;
          align-items: center;
          justify-content: center;
          border-radius: 5px;
          border: 1px solid #DCE3DE;
          background: white;
          color: #667085;
        }

        .pagination-button:hover {
          background: #F6F8F7;
        }

        .pagination-button:disabled {
          opacity: .35;
          cursor: default;
        }
      `}</style>
    </div>
  );
}