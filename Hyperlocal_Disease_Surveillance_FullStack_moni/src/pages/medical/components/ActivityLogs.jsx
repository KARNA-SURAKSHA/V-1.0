import {
  Activity,
  CheckCircle2,
  FileText,
} from "lucide-react";


const formatTime = (
  value
) => {

  if (!value) {
    return "Today";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "Today";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    date
  );
};


export default function ActivityLogs({
  logs = [],
  reports = [],
}) {

  const rows =
    logs.length
      ? logs
      : reports
          .slice(
            0,
            8
          )
          .map(
            (
              report
            ) => ({
              time:
                report.created_at,

              title:
                `${report.disease || "Disease"} report received`,

              detail:
                `${report.taluk_name || "Kodagu"} · ${
                  report.cases_this_week ??
                  report.current_cases ??
                  0
                } cases`,
            })
          );


  return (

    <div className="space-y-5">

      <div>

        <h1 className="text-[27px] font-semibold tracking-[-.035em] text-[#101B38]">
          Activity Logs
        </h1>

        <p className="mt-1 text-[12px] text-[#66727D]">
          Recent surveillance events across your assigned district.
        </p>

      </div>


      <section className="rounded-[14px] border border-[#E7ECEA] bg-white p-5">

        <div className="mb-4 flex items-center gap-2 text-[14px] font-semibold text-[#17233D]">

          <Activity
            size={19}
            className="text-[#087A32]"
          />

          Recent Activity

        </div>


        <div className="divide-y divide-[#EEF1EF]">

          {
            rows.map(
              (
                row,
                index
              ) => (

                <div
                  key={`${row.title}-${index}`}
                  className="flex items-start gap-3 py-4"
                >

                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#EAF6EE] text-[#087A32]">

                    {
                      index % 2
                        ? (
                          <FileText
                            size={15}
                          />
                        )
                        : (
                          <CheckCircle2
                            size={15}
                          />
                        )
                    }

                  </div>


                  <div className="min-w-0 flex-1">

                    <div className="text-[12px] font-semibold text-[#25324A]">
                      {
                        row.title
                      }
                    </div>

                    <div className="mt-1 text-[10px] text-[#718096]">
                      {
                        row.detail
                      }
                    </div>

                  </div>


                  <div className="text-[10px] font-medium text-[#087A32]">

                    {
                      formatTime(
                        row.time
                      )
                    }

                  </div>

                </div>

              )
            )
          }


          {
            !rows.length && (
              <div className="py-12 text-center text-[11px] text-[#718096]">
                No activity has been recorded yet.
              </div>
            )
          }

        </div>

      </section>

    </div>

  );
}