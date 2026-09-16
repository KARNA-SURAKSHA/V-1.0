import { useMemo, useRef, useState } from "react";

import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  FileUp,
  MapPin,
  Paperclip,
  ShieldAlert,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";

import medicalSupervisorHero from "../../../assets/medical-supervisor-hero.png";

/* ============================================================
   DATE HELPERS
============================================================ */

function isoWeekKeyFromDate(value) {
  if (!value) return null;

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const utc = new Date(
    Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    )
  );

  const day = utc.getUTCDay() || 7;

  utc.setUTCDate(
    utc.getUTCDate() + 4 - day
  );

  const yearStart = new Date(
    Date.UTC(
      utc.getUTCFullYear(),
      0,
      1
    )
  );

  const week = Math.ceil(
    (
      (
        utc - yearStart
      ) /
        86400000 +
      1
    ) / 7
  );

  return (
    utc.getUTCFullYear() * 100 +
    week
  );
}


function startOfISOWeek(
  value = new Date()
) {
  const date = new Date(value);

  date.setHours(
    0,
    0,
    0,
    0
  );

  const day =
    date.getDay() || 7;

  date.setDate(
    date.getDate() - day + 1
  );

  return date;
}


function currentWeekKey() {
  return isoWeekKeyFromDate(
    new Date()
  );
}


function previousWeekKeys(
  count = 4
) {
  const start =
    startOfISOWeek(
      new Date()
    );

  const result = [];

  for (
    let i = 1;
    i <= count;
    i += 1
  ) {
    const date =
      new Date(start);

    date.setDate(
      date.getDate() - i * 7
    );

    const key =
      isoWeekKeyFromDate(
        date
      );

    if (key) {
      result.push(key);
    }
  }

  return result;
}


function normalizeReportWeek(
  report
) {
  const raw =
    Number(
      report?.week_number
    );

  if (
    Number.isFinite(raw) &&
    raw >= 1000
  ) {
    return raw;
  }

  if (
    Number.isFinite(raw) &&
    raw >= 1 &&
    raw <= 53
  ) {
    const year =
      Number(
        report?.year
      );

    if (
      Number.isFinite(year) &&
      year >= 2000
    ) {
      return (
        year * 100 +
        raw
      );
    }
  }

  return isoWeekKeyFromDate(
    report?.created_at
  );
}


/* ============================================================
   DISPLAY HELPERS
============================================================ */

function formatDate(value) {
  if (!value) {
    return "No submission";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "No submission";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    }
  );
}


function formatTime(value) {
  if (!value) return "";

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


function getInitials(
  name = "Agent"
) {
  const parts =
    String(name)
      .trim()
      .split(/\s+/)
      .filter(Boolean);

  if (!parts.length) {
    return "AG";
  }

  if (parts.length === 1) {
    return parts[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return (
    parts[0][0] +
    parts[parts.length - 1][0]
  ).toUpperCase();
}


/* ============================================================
   STATUS
============================================================ */

function getStatusMeta(row) {
  const monthlySubmitted = Number(
    row?.monthlySubmitted ?? 0
  );

  /*
   * Agent Oversight status is based ONLY on the displayed
   * four-week compliance count.
   *
   * 4/4 -> Compliant
   * 1-3/4 -> Delayed
   * 0/4 -> Unresponsive
   *
   * There is deliberately no Pending state.
   */

  if (monthlySubmitted >= 4) {
    return {
      label: "Compliant",
      tone: "green",
      icon: CheckCircle2,
    };
  }

  if (monthlySubmitted <= 0) {
    return {
      label: "Unresponsive",
      tone: "red",
      icon: AlertTriangle,
    };
  }

  return {
    label: "Delayed",
    tone: "amber",
    icon: AlertTriangle,
  };
}


/* ============================================================
   COMPLAINT DRAWER
============================================================ */

function ComplaintDrawer({
  agent,
  onClose,
  onSubmit,
  saving,
}) {
  const fileInputRef =
    useRef(null);

  const [
    category,
    setCategory,
  ] = useState(
    "Missed Weekly Submissions / Negligence"
  );

  const [
    severity,
    setSeverity,
  ] = useState("High");

  const [
    description,
    setDescription,
  ] = useState(
    `Agent ${
      agent?.full_name ||
      agent?.name ||
      "Unknown Agent"
    } missed 1 of 4 weekly surveillance reports and missed the Friday 5:00 PM deadline.`
  );

  const [
    files,
    setFiles,
  ] = useState([]);

  const [
    dragging,
    setDragging,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");


  /* ----------------------------------------------------------
     ADD FILES
  ---------------------------------------------------------- */

  const addFiles =
    (incoming) => {
      const selected =
        Array.from(
          incoming || []
        ).filter(Boolean);

      if (!selected.length) {
        return;
      }

      setFiles(
        (previous) => {
          const existing =
            new Set(
              previous.map(
                (file) =>
                  `${file.name}-${file.size}-${file.lastModified}`
              )
            );

          const merged = [
            ...previous,
          ];

          selected.forEach(
            (file) => {
              const key =
                `${file.name}-${file.size}-${file.lastModified}`;

              if (
                !existing.has(key)
              ) {
                existing.add(key);
                merged.push(file);
              }
            }
          );

          return merged;
        }
      );

      setError("");
    };


  /* ----------------------------------------------------------
     REMOVE FILE
  ---------------------------------------------------------- */

  const removeFile =
    (index) => {
      setFiles(
        (previous) =>
          previous.filter(
            (_, i) =>
              i !== index
          )
      );
    };


  /* ----------------------------------------------------------
     SUBMIT COMPLAINT
  ---------------------------------------------------------- */

  const submit =
    async (event) => {
      event.preventDefault();

      if (saving) {
        return;
      }

      const agentId =
        Number(
          agent?.agent_id ??
          agent?.id
        );

      const cleanDescription =
        description.trim();

      if (
        !Number.isInteger(
          agentId
        ) ||
        agentId <= 0
      ) {
        setError(
          "A valid field agent could not be identified."
        );
        return;
      }

      if (
        !cleanDescription
      ) {
        setError(
          "Please provide a description for the complaint."
        );
        return;
      }

      /*
       * Proof is required according to
       * the UI specification.
       */

      if (!files.length) {
        setError(
          "Please attach at least one proof or system audit log."
        );
        return;
      }

      if (
        typeof onSubmit !==
        "function"
      ) {
        setError(
          "Complaint submission is not connected to the Medical Supervisor portal."
        );
        return;
      }

      setError("");
      setSuccess("");

      try {
        await onSubmit({
          agent_id:
            agentId,

          issue_type:
            category,

          severity:
            severity,

          description:
            cleanDescription,

          evidence:
            files
              .map(
                (file) =>
                  file.name
              )
              .join(", "),

          files:
            files,
        });

        setSuccess(
          "Complaint and proof submitted successfully to System Admin."
        );

      } catch (submissionError) {
        console.error(
          "Agent complaint submission failed:",
          submissionError
        );

        setError(
          submissionError?.message ||
            "Unable to submit the complaint. Please try again."
        );
      }
    };


  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        justify-end
        bg-[#102A43]/20
        backdrop-blur-[1px]
      "
      onMouseDown={
        (event) => {
          if (
            event.target ===
              event.currentTarget &&
            !saving
          ) {
            onClose();
          }
        }
      }
    >

      <aside
        className="
          flex
          h-full
          w-full
          max-w-[455px]
          flex-col
          border-l
          border-[#E1E7E3]
          bg-white
          shadow-[-12px_0_35px_rgba(16,42,67,.14)]
        "
      >

        <form
          onSubmit={submit}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >

          {/* =================================================
              HEADER
          ================================================= */}

          <div
            className="
              flex
              min-h-[64px]
              items-center
              justify-between
              border-b
              border-[#E5EAE7]
              px-5
            "
          >

            <h2
              className="
                text-[18px]
                font-semibold
                tracking-[-.02em]
                text-[#172536]
              "
            >
              File Agent Complaint &amp; Submit Proof
            </h2>

            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="
                flex
                h-8
                w-8
                items-center
                justify-center
                rounded-lg
                text-[#6F7A85]
                hover:bg-[#F4F7F5]
                disabled:opacity-50
              "
            >
              <X size={20} />
            </button>

          </div>


          {/* =================================================
              BODY
          ================================================= */}

          <div
            className="
              min-h-0
              flex-1
              overflow-y-auto
              px-5
              py-4
            "
          >

            <div
              className="
                text-[12px]
                font-semibold
                text-[#172536]
              "
            >
              File Agent Complaint &amp; Submit Proof
            </div>


            {/* AGENT */}

            <div
              className="
                mt-3
                flex
                items-center
                justify-between
              "
            >

              <span
                className="
                  text-[11px]
                  font-medium
                  text-[#26364D]
                "
              >
                Field Agent
              </span>

              <span
                className="
                  rounded-lg
                  bg-[#FBE7E9]
                  px-2.5
                  py-2
                  text-[10px]
                  font-semibold
                  text-[#B84B53]
                "
              >
                Action Required
              </span>

            </div>


            <div
              className="
                mt-2
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  flex
                  h-9
                  w-9
                  shrink-0
                  items-center
                  justify-center
                  rounded-full
                  bg-[#EAF1FF]
                  text-[10px]
                  font-bold
                  text-[#356FD1]
                "
              >
                {getInitials(
                  agent?.full_name ||
                    agent?.name
                )}
              </div>

              <div
                className="
                  text-[12px]
                  text-[#172536]
                "
              >

                <span
                  className="font-semibold"
                >
                  {
                    agent?.full_name ||
                    agent?.name ||
                    "Unknown Agent"
                  }
                </span>

                {" "}

                <span
                  className="text-[#647386]"
                >
                  (
                  {
                    agent?.agent_code ||
                    `AGT-${String(
                      agent?.id || 0
                    ).padStart(3, "0")}`
                  }
                  )
                </span>

              </div>

            </div>


            {/* CATEGORY */}

            <label className="mt-6 block">

              <span
                className="
                  text-[11px]
                  font-medium
                  text-[#172536]
                "
              >
                Complaint Category
              </span>

              <select
                value={category}
                onChange={
                  (event) =>
                    setCategory(
                      event.target.value
                    )
                }
                className="
                  mt-2
                  h-[42px]
                  w-full
                  rounded-lg
                  border
                  border-[#D9DFDC]
                  bg-white
                  px-3
                  text-[11px]
                  text-[#263545]
                  outline-none
                  focus:border-[#087A32]
                "
              >

                <option>
                  Missed Weekly Submissions / Negligence
                </option>

                <option>
                  Repeated Late Submission
                </option>

                <option>
                  Unresponsive Agent
                </option>

                <option>
                  Incorrect / Incomplete Report
                </option>

                <option>
                  Other
                </option>

              </select>

            </label>


            {/* SEVERITY */}

            <label className="mt-4 block">

              <span
                className="
                  text-[11px]
                  font-medium
                  text-[#172536]
                "
              >
                Severity
              </span>

              <select
                value={severity}
                onChange={
                  (event) =>
                    setSeverity(
                      event.target.value
                    )
                }
                className="
                  mt-2
                  h-[42px]
                  w-full
                  rounded-lg
                  border
                  border-[#D9DFDC]
                  bg-white
                  px-3
                  text-[11px]
                  text-[#263545]
                  outline-none
                  focus:border-[#087A32]
                "
              >

                <option>
                  High
                </option>

                <option>
                  Medium
                </option>

                <option>
                  Low
                </option>

              </select>

            </label>


            {/* DESCRIPTION */}

            <label className="mt-4 block">

              <span
                className="
                  text-[11px]
                  font-medium
                  text-[#172536]
                "
              >
                Description
              </span>

              <textarea
                required
                value={description}
                onChange={
                  (event) =>
                    setDescription(
                      event.target.value
                    )
                }
                rows={4}
                className="
                  mt-2
                  w-full
                  resize-none
                  rounded-lg
                  border
                  border-[#D9DFDC]
                  px-3
                  py-3
                  text-[11px]
                  leading-[17px]
                  text-[#263545]
                  outline-none
                  focus:border-[#087A32]
                "
              />

            </label>


            {/* PROOF */}

            <div
              className="
                mt-6
                text-[11px]
                font-semibold
                text-[#1B2837]
              "
            >
              PROOF &amp; EVIDENCE SECTION
            </div>


            <div className="mt-4">

              <div
                className="
                  mb-2
                  text-[11px]
                  font-medium
                  text-[#172536]
                "
              >
                Attach Proof / System Audit Logs{" "}
                <span className="text-[#B6544D]">
                  (Required)
                </span>
              </div>


              <button
                type="button"
                onClick={() =>
                  fileInputRef.current?.click()
                }
                onDragEnter={
                  (event) => {
                    event.preventDefault();
                    setDragging(true);
                  }
                }
                onDragOver={
                  (event) => {
                    event.preventDefault();
                    setDragging(true);
                  }
                }
                onDragLeave={
                  (event) => {
                    event.preventDefault();
                    setDragging(false);
                  }
                }
                onDrop={
                  (event) => {
                    event.preventDefault();

                    setDragging(false);

                    addFiles(
                      event
                        .dataTransfer
                        .files
                    );
                  }
                }
                className={`
                  relative
                  flex
                  min-h-[117px]
                  w-full
                  flex-col
                  items-center
                  justify-center
                  rounded-lg
                  border
                  border-dashed
                  px-4
                  text-center
                  ${
                    dragging
                      ? "border-[#087A32] bg-[#EFF9F2]"
                      : "border-[#CAD8CE] bg-white hover:border-[#087A32] hover:bg-[#FAFCFB]"
                  }
                `}
              >

                <FileUp
                  size={29}
                  className="text-[#7C8790]"
                />

                <span
                  className="
                    mt-2
                    text-[11px]
                    font-medium
                    text-[#3C4955]
                  "
                >
                  Drag &amp; Drop files here or Browse
                </span>

                <span
                  className="
                    mt-1
                    text-[10px]
                    text-[#697680]
                  "
                >
                  (Screenshots, PDFs, Audio records)
                </span>

                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="
                    .png,
                    .jpg,
                    .jpeg,
                    .pdf,
                    .mp3,
                    .wav,
                    .m4a,
                    .txt,
                    .csv
                  "
                  className="hidden"
                  onChange={
                    (event) => {
                      addFiles(
                        event.target.files
                      );

                      event.target.value =
                        "";
                    }
                  }
                />

              </button>

            </div>


            {/* FILES */}

            {files.length > 0 && (

              <div
                className="
                  mt-3
                  grid
                  grid-cols-2
                  gap-2
                "
              >

                {files.map(
                  (
                    file,
                    index
                  ) => (

                    <div
                      key={`${file.name}-${file.size}-${file.lastModified}-${index}`}
                      className="
                        flex
                        min-w-0
                        items-center
                        gap-2
                        rounded-lg
                        border
                        border-[#DFE5E2]
                        bg-white
                        px-2
                        py-2
                      "
                    >

                      <div
                        className="
                          flex
                          h-8
                          w-8
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          bg-[#EFF7F1]
                          text-[#087A32]
                        "
                      >
                        <Paperclip size={15} />
                      </div>


                      <div
                        className="
                          min-w-0
                          flex-1
                        "
                      >

                        <div
                          className="
                            truncate
                            text-[9px]
                            font-semibold
                            text-[#334252]
                          "
                        >
                          {file.name}
                        </div>

                        <div
                          className="
                            text-[8px]
                            text-[#77828C]
                          "
                        >
                          {file.size >= 1024 * 1024
                            ? `${(
                                file.size /
                                (1024 * 1024)
                              ).toFixed(1)} MB`
                            : `${Math.max(
                                1,
                                Math.round(
                                  file.size /
                                    1024
                                )
                              )} KB`}
                        </div>

                      </div>


                      <button
                        type="button"
                        onClick={() =>
                          removeFile(index)
                        }
                        disabled={saving}
                        className="
                          flex
                          h-6
                          w-6
                          shrink-0
                          items-center
                          justify-center
                          rounded-md
                          text-[#7A858E]
                          hover:bg-[#FFF1F1]
                          hover:text-[#C62828]
                        "
                      >
                        <X size={13} />
                      </button>

                    </div>

                  )
                )}

              </div>

            )}


            {/* ERROR */}

            {error && (

              <div
                className="
                  mt-3
                  rounded-lg
                  border
                  border-[#F0CCCC]
                  bg-[#FFF4F4]
                  px-3
                  py-2.5
                  text-[10px]
                  leading-4
                  text-[#B4232F]
                "
              >
                {error}
              </div>

            )}


            {/* SUCCESS */}

            {success && (

              <div
                className="
                  mt-3
                  rounded-lg
                  border
                  border-[#CBE7D3]
                  bg-[#EFFAF2]
                  px-3
                  py-2.5
                  text-[10px]
                  leading-4
                  text-[#087A32]
                "
              >
                {success}
              </div>

            )}

          </div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              border-t
              border-[#E7ECE9]
              bg-white
              px-5
              py-4
            "
          >

            <div className="flex gap-2.5">

              <button
                type="submit"
                disabled={
                  saving ||
                  !description.trim() ||
                  !files.length
                }
                className="
                  inline-flex
                  min-h-[45px]
                  flex-1
                  items-center
                  justify-center
                  gap-2
                  rounded-lg
                  bg-[#087D3F]
                  px-3
                  text-[11px]
                  font-semibold
                  text-white
                  shadow-[0_3px_9px_rgba(8,125,63,.18)]
                  transition
                  hover:bg-[#076E38]
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >

                <ShieldCheck
                  size={18}
                />

                {
                  saving
                    ? "Submitting..."
                    : "Submit Complaint & Proof to Admin"
                }

              </button>


              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="
                  min-h-[45px]
                  rounded-lg
                  border
                  border-[#D9E1DD]
                  bg-white
                  px-5
                  text-[11px]
                  font-semibold
                  text-[#39495F]
                  hover:bg-[#F7FAF8]
                  disabled:opacity-50
                "
              >
                Cancel
              </button>

            </div>

          </div>

        </form>

      </aside>

    </div>
  );
}


/* ============================================================
   MAIN AGENT OVERSIGHT
============================================================ */

export default function AgentOversight({
  agents = [],
  issues = [],
  reports = [],
  onSubmitIssue,
}) {
  const [
    selectedAgent,
    setSelectedAgent,
  ] = useState(null);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] = useState("");


  /* ==========================================================
     BUILD COMPLIANCE ROWS
  ========================================================== */

  const rows =
    useMemo(
      () => {
        const currentWeek =
          currentWeekKey();

        const historyWeeks =
          previousWeekKeys(4);

        const reportMap =
          new Map();

        (
          Array.isArray(reports)
            ? reports
            : []
        ).forEach(
          (report) => {
            const agentId =
              Number(
                report?.agent_id
              );

            const week =
              normalizeReportWeek(
                report
              );

            if (
              !Number.isFinite(
                agentId
              ) ||
              !week
            ) {
              return;
            }

            const key =
              `${agentId}-${week}`;

            const previous =
              reportMap.get(
                key
              );

            if (
              !previous
            ) {
              reportMap.set(
                key,
                report
              );

              return;
            }

            const previousTime =
              new Date(
                previous?.created_at ||
                  0
              ).getTime();

            const nextTime =
              new Date(
                report?.created_at ||
                  0
              ).getTime();

            if (
              nextTime >
              previousTime
            ) {
              reportMap.set(
                key,
                report
              );
            }
          }
        );


        const now =
          new Date();

        const currentStart =
          startOfISOWeek(
            now
          );

        const dueAt =
          new Date(
            currentStart
          );

        dueAt.setDate(
          dueAt.getDate() +
            2
        );

        dueAt.setHours(
          23,
          59,
          59,
          999
        );


        return (
          Array.isArray(
            agents
          )
            ? agents
            : []
        ).map(
          (agent) => {
            const agentId =
              Number(
                agent?.agent_id ??
                  agent?.id
              );

            const currentReport =
              reportMap.get(
                `${agentId}-${currentWeek}`
              );

            const currentSubmitted =
              Boolean(
                currentReport
              );

            const currentOverdue =
              !currentSubmitted &&
              now > dueAt;

            const history =
              historyWeeks.map(
                (week) =>
                  Boolean(
                    reportMap.get(
                      `${agentId}-${week}`
                    )
                  )
              );

            const monthlySubmitted =
              history.filter(
                Boolean
              ).length;

            const agentReports =
              (
                Array.isArray(
                  reports
                )
                  ? reports
                  : []
              )
                .filter(
                  (report) =>
                    Number(
                      report?.agent_id
                    ) === agentId
                )
                .sort(
                  (a, b) =>
                    new Date(
                      b?.created_at ||
                        0
                    ).getTime() -
                    new Date(
                      a?.created_at ||
                        0
                    ).getTime()
                );

            const lastReport =
              agentReports[0] ||
              null;

            return {
              ...agent,

              id:
                agentId,

              agent_id:
                agentId,

              full_name:
                agent?.full_name ||
                agent?.name ||
                "Unknown Agent",

              taluk_name:
                agent?.taluk_name ||
                agent?.taluk ||
                "Unknown Taluk",

              currentSubmitted,

              currentOverdue,

              monthlySubmitted,

              history,

              lastSubmission:
                lastReport?.created_at ||
                null,

              status:
                getStatusMeta({
                  monthlySubmitted,
                }),
            };
          }
        );
      },
      [
        agents,
        reports,
      ]
    );


  /* ==========================================================
     KPI
  ========================================================== */

  const totalAgents =
    rows.length;

  const compliantAgents =
    rows.filter(
      (row) =>
        Number(row.monthlySubmitted) >=
        4
    ).length;

  const nonCompliantAgents =
    rows.filter(
      (row) =>
        Number(row.monthlySubmitted) < 4
    ).length;


  /* ==========================================================
     SUBMIT
  ========================================================== */

  const submitComplaint =
    async (
      payload
    ) => {
      if (saving) {
        return;
      }

      if (
        typeof onSubmitIssue !==
        "function"
      ) {
        throw new Error(
          "Complaint submission is not connected."
        );
      }

      setSaving(true);

      try {
        await onSubmitIssue(
          payload
        );

        setToast(
          "Complaint and proof submitted to System Admin."
        );

        setSelectedAgent(
          null
        );

      } finally {
        setSaving(false);
      }
    };


  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <div
      className="
        relative
        min-h-full
        space-y-[18px]
        pb-8
      "
    >

      {/* ======================================================
          HERO
      ====================================================== */}

      <section
        className="
          relative
          h-[112px]
          overflow-hidden
          bg-white
        "
      >

        <div
          className="
            relative
            z-10
            px-[18px]
            pt-[4px]
          "
        >

          <h1
            className="
              m-0
              text-[28px]
              font-bold
              leading-[34px]
              tracking-[-.8px]
              text-[#0D1725]
            "
          >
            Agent Oversight &amp; Weekly Compliance
          </h1>

          <p
            className="
              mt-[9px]
              text-[14px]
              leading-[20px]
              text-[#1B2939]
            "
          >
            Monitor weekly agent reporting compliance (1 report/week cycle)
            <br />
            and file complaints to System Admin.
          </p>

        </div>


        {/* EXISTING MEDICAL SUPERVISOR HERO */}

        <div
          className="
            pointer-events-none
            absolute
            right-0
            top-0
            h-[112px]
            w-[48%]
            overflow-hidden
          "
        >

          <div
            className="
              absolute
              inset-y-0
              left-0
              z-[2]
              w-[42%]
              bg-gradient-to-r
              from-white
              via-white/80
              to-transparent
            "
          />

          <img
            src={
              medicalSupervisorHero
            }
            alt=""
            className="
              h-full
              w-full
              object-cover
              object-right
            "
          />

        </div>

      </section>


      {/* ======================================================
          KPI CARDS
      ====================================================== */}

      <section
        className="
          grid
          gap-4
          xl:grid-cols-3
        "
      >

        <KpiCard
          icon={
            <Users
              size={27}
              strokeWidth={2}
            />
          }
          label="Total Field Agents"
          value={totalAgents}
          tone="green"
        />

        <KpiCard
          icon={
            <ShieldCheck
              size={27}
              strokeWidth={2}
            />
          }
          label="Compliant (4/4 Weeks)"
          value={compliantAgents}
          tone="green"
        />

        <KpiCard
          icon={
            <AlertTriangle
              size={27}
              strokeWidth={2}
            />
          }
          label="Overdue / Non-Compliant"
          value={
            nonCompliantAgents
          }
          tone="amber"
        />

      </section>


      {/* ======================================================
          ROSTER
      ====================================================== */}

      <section
        className="
          overflow-hidden
          rounded-[15px]
          border
          border-[#E0E6E2]
          bg-white
          shadow-[0_1px_3px_rgba(15,23,42,.025)]
        "
      >

        <div
          className="
            flex
            h-[71px]
            items-center
            gap-3
            border-b
            border-[#E5E9E7]
            px-[21px]
          "
        >

          <FileText
            size={22}
            strokeWidth={2}
            className="text-[#008842]"
          />

          <h2
            className="
              m-0
              text-[18px]
              font-semibold
              tracking-[-.15px]
              text-[#102033]
            "
          >
            Field Agent Weekly Compliance Roster
          </h2>

        </div>


        <div
          className="
            overflow-x-auto
          "
        >

          <table
            className="
              w-full
              min-w-[980px]
              border-collapse
              text-left
            "
          >

            <thead>

              <tr
                className="
                  h-[43px]
                  bg-[#FAFBFA]
                  text-[10px]
                  font-bold
                  text-[#102033]
                "
              >

                <th className="px-[18px]">
                  Agent Name
                </th>

                <th className="px-[18px]">
                  Assigned Region
                </th>

                <th className="px-[18px]">
                  Last Submission
                </th>

                <th className="px-[18px]">
                  Monthly History
                </th>

                <th className="px-[18px]">
                  Status Tag
                </th>

                <th className="px-[18px] text-right">
                  Action
                </th>

              </tr>

            </thead>


            <tbody>

              {rows.map(
                (agent) => {
                  const StatusIcon =
                    agent.status.icon;

                  return (
                    <tr
                      key={
                        agent.id
                      }
                      className="
                        h-[56px]
                        border-t
                        border-[#EDF0EF]
                        transition
                        hover:bg-[#FBFDFC]
                      "
                    >

                      {/* AGENT */}

                      <td className="px-[18px]">

                        <div
                          className="
                            flex
                            items-center
                            gap-[10px]
                          "
                        >

                          <div
                            className="
                              flex
                              h-[35px]
                              w-[35px]
                              shrink-0
                              items-center
                              justify-center
                              rounded-full
                              bg-[#EAF1FF]
                              text-[10px]
                              font-semibold
                              text-[#356FD1]
                            "
                          >
                            {getInitials(
                              agent.full_name
                            )}
                          </div>

                          <strong
                            className="
                              truncate
                              text-[11px]
                              font-semibold
                              text-[#172536]
                            "
                          >
                            {
                              agent.full_name
                            }
                          </strong>

                        </div>

                      </td>


                      {/* REGION */}

                      <td className="px-[18px]">

                        <div
                          className="
                            flex
                            items-center
                            gap-[7px]
                            text-[10px]
                            text-[#546579]
                          "
                        >

                          <MapPin
                            size={15}
                            className="text-[#008B45]"
                          />

                          {
                            agent.taluk_name
                          }

                        </div>

                      </td>


                      {/* LAST SUBMISSION */}

                      <td className="px-[18px]">

                        {agent.lastSubmission ? (

                          <div className="flex flex-col">

                            <strong
                              className="
                                text-[10px]
                                font-medium
                                text-[#172536]
                              "
                            >
                              {
                                formatDate(
                                  agent.lastSubmission
                                )
                              }
                            </strong>

                            <small
                              className="
                                text-[8px]
                                text-[#8995A2]
                              "
                            >
                              {
                                formatTime(
                                  agent.lastSubmission
                                )
                              }
                            </small>

                          </div>

                        ) : (

                          <span
                            className="
                              text-[10px]
                              text-[#8995A2]
                            "
                          >
                            No submission
                          </span>

                        )}

                      </td>


                      {/* HISTORY */}

                      <td className="px-[18px]">

                        <div
                          className="
                            flex
                            items-center
                            gap-2
                          "
                        >

                          <span
                            className="
                              whitespace-nowrap
                              text-[10px]
                              font-medium
                              text-[#253547]
                            "
                          >
                            {
                              agent.monthlySubmitted
                            }
                            /4 Weeks
                          </span>

                          <div
                            className="
                              flex
                              gap-1
                            "
                          >

                            {agent.history.map(
                              (
                                submitted,
                                index
                              ) => (

                                <span
                                  key={`${agent.id}-${index}`}
                                  className={`
                                    h-[9px]
                                    w-[9px]
                                    rounded-[2px]
                                    ${
                                      submitted
                                        ? "bg-[#078B45]"
                                        : "bg-[#F0A4A9]"
                                    }
                                  `}
                                />

                              )
                            )}

                          </div>

                        </div>

                      </td>


                      {/* STATUS */}

                      <td className="px-[18px]">

                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1
                            rounded-[8px]
                            px-[10px]
                            py-[7px]
                            text-[9px]
                            font-medium
                            ${
                              agent.status.tone ===
                              "green"
                                ? "bg-[#E8F5EC] text-[#177341]"
                                : agent.status.tone ===
                                  "amber"
                                ? "bg-[#FFF0D5] text-[#CF8100]"
                                : agent.status.tone ===
                                  "blue"
                                ? "bg-[#EAF1FF] text-[#356FD1]"
                                : "bg-[#FDEBEC] text-[#D23A3A]"
                            }
                          `}
                        >

                          <StatusIcon
                            size={12}
                          />

                          {
                            agent.status.label
                          }

                        </span>

                      </td>


                      {/* REPORT */}

                      <td
                        className="
                          px-[18px]
                          text-right
                        "
                      >

                        <button
                          type="button"
                          onClick={() =>
                            setSelectedAgent(
                              agent
                            )
                          }
                          className="
                            inline-flex
                            h-[32px]
                            w-[63px]
                            items-center
                            justify-center
                            rounded-[7px]
                            bg-[#00883F]
                            text-[10px]
                            font-semibold
                            text-white
                            shadow-[0_3px_7px_rgba(0,126,58,.18)]
                            transition
                            hover:bg-[#007637]
                          "
                        >
                          Report
                        </button>

                      </td>

                    </tr>
                  );
                }
              )}


              {!rows.length && (

                <tr>

                  <td
                    colSpan={6}
                    className="
                      px-4
                      py-12
                      text-center
                      text-[11px]
                      text-[#718096]
                    "
                  >
                    No field agents are assigned to this Medical Supervisor&apos;s district.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </section>


      {/* ======================================================
          PREVIOUS COMPLAINTS
      ====================================================== */}

      <section
        className="
          overflow-hidden
          rounded-[15px]
          border
          border-[#E0E6E2]
          bg-white
        "
      >

        <div
          className="
            border-b
            border-[#E5E9E7]
            px-[21px]
            py-4
          "
        >

          <h2
            className="
              m-0
              text-[17px]
              font-semibold
              text-[#102033]
            "
          >
            Previously Filed Agent Complaints
          </h2>

          <p
            className="
              mt-1
              text-[10px]
              text-[#8792A2]
            "
          >
            Complaints already submitted by this Medical Supervisor
          </p>

        </div>


        <div className="p-4">

          {issues.length ? (

            <div className="space-y-2">

              {issues.map(
                (issue) => (

                  <div
                    key={
                      issue.id
                    }
                    className="
                      flex
                      items-center
                      justify-between
                      gap-4
                      rounded-lg
                      border
                      border-[#E7ECE9]
                      px-3
                      py-3
                    "
                  >

                    <div className="min-w-0">

                      <div
                        className="
                          text-[11px]
                          font-semibold
                          text-[#17233D]
                        "
                      >
                        {
                          issue.agent_name ||
                          "Unknown Agent"
                        }
                      </div>

                      <div
                        className="
                          mt-1
                          text-[10px]
                          text-[#52627D]
                        "
                      >
                        {
                          issue.issue_type ||
                          "Agent complaint"
                        }

                        {
                          issue.severity
                            ? ` · ${issue.severity}`
                            : ""
                        }
                      </div>

                    </div>


                    <span
                      className="
                        shrink-0
                        rounded-md
                        bg-[#EAF1FF]
                        px-2
                        py-1
                        text-[9px]
                        font-semibold
                        text-[#356FD1]
                      "
                    >
                      {
                        String(
                          issue.status ||
                            "Submitted"
                        ).replaceAll(
                          "_",
                          " "
                        )
                      }
                    </span>

                  </div>

                )
              )}

            </div>

          ) : (

            <div
              className="
                rounded-lg
                border
                border-dashed
                border-[#DDE5E0]
                bg-[#FAFCFB]
                px-4
                py-8
                text-center
                text-[11px]
                text-[#718096]
              "
            >
              No complaints have been filed yet.
            </div>

          )}

        </div>

      </section>


      {/* ======================================================
          COMPLAINT DRAWER
      ====================================================== */}

      {selectedAgent && (

        <ComplaintDrawer
          agent={
            selectedAgent
          }
          onClose={() => {
            if (!saving) {
              setSelectedAgent(
                null
              );
            }
          }}
          onSubmit={
            submitComplaint
          }
          saving={
            saving
          }
        />

      )}


      {/* ======================================================
          SUCCESS TOAST
      ====================================================== */}

      {toast && (

        <div
          className="
            fixed
            bottom-6
            right-6
            z-[130]
            flex
            max-w-[380px]
            items-center
            gap-2
            rounded-xl
            border
            border-[#CBE7D3]
            bg-white
            px-4
            py-3
            text-[11px]
            font-semibold
            text-[#087A32]
            shadow-[0_10px_30px_rgba(15,23,42,.15)]
          "
        >

          <ShieldCheck
            size={17}
          />

          <span>
            {toast}
          </span>

          <button
            type="button"
            onClick={() =>
              setToast("")
            }
            className="
              ml-2
              text-[#718096]
            "
          >
            <X size={14} />
          </button>

        </div>

      )}

    </div>
  );
}


/* ============================================================
   KPI CARD
============================================================ */

function KpiCard({
  icon,
  label,
  value,
  tone,
}) {
  return (
    <div
      className="
        flex
        min-h-[122px]
        items-center
        gap-[18px]
        rounded-[15px]
        border
        border-[#E0E6E2]
        bg-white
        px-5
        py-5
        shadow-[0_1px_3px_rgba(15,23,42,.03)]
      "
    >

      <div
        className={`
          flex
          h-[60px]
          w-[60px]
          shrink-0
          items-center
          justify-center
          rounded-full
          ${
            tone === "amber"
              ? "bg-[#FFF0D4] text-[#E88B00]"
              : "bg-[#E5F4EB] text-[#07883F]"
          }
        `}
      >
        {icon}
      </div>


      <div className="min-w-0">

        <div
          className="
            text-[13px]
            font-normal
            leading-5
            text-[#172536]
          "
        >
          {label}
        </div>

        <div
          className="
            text-[27px]
            font-bold
            leading-[31px]
            text-[#071426]
          "
        >
          {value}
        </div>

      </div>

    </div>
  );
}