import {
  useEffect,
  useState,
} from "react";


import {
  Bell,
  Megaphone,
  Siren,
  Stethoscope,
  UserRound,
} from "lucide-react";


import notificationApi
  from "../../api/notificationApi";


const TYPE_ICON = {

  "Health Camp":
    Stethoscope,

  "Awareness Campaign":
    Megaphone,

  "Emergency Alert":
    Siren,

};


const TYPE_COLOR = {

  "Health Camp":
    "#3FA9F5",

  "Awareness Campaign":
    "#0B7A33",

  "Emergency Alert":
    "#C62828",

};


function sourceIcon(
  sourceRole
) {

  if (
    sourceRole ===
    "Medical Supervisor"
  ) {

    return Stethoscope;

  }


  if (
    sourceRole ===
    "Agent"
  ) {

    return UserRound;

  }


  return Megaphone;

}


function formatDate(
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


  return date.toLocaleString(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  );

}


export default function NotificationsTab({

  selectedLocation,

  talukId,

}) {

  const resolvedTalukId =
    selectedLocation?.talukId ??
    talukId;


  const [
    notes,
    setNotes,
  ] = useState([]);


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(true);


  useEffect(
    () => {

      let cancelled =
        false;


      async function load() {

        if (
          !resolvedTalukId
        ) {

          setNotes([]);

          setError("");

          setLoading(
            false
          );

          return;

        }


        try {

          setLoading(
            true
          );

          setError("");


          const result =
            await notificationApi
              .getCitizenNotifications(
                resolvedTalukId
              );


          if (
            !cancelled
          ) {

            setNotes(

              Array.isArray(
                result
              )
                ? result
                : []

            );

          }

        } catch (e) {

          if (
            !cancelled
          ) {

            setError(

              e?.message
              ||
              "Unable to load notifications."

            );

          }

        } finally {

          if (
            !cancelled
          ) {

            setLoading(
              false
            );

          }

        }

      }


      load();


      return () => {

        cancelled =
          true;

      };

    },

    [
      resolvedTalukId,
    ]
  );


  if (
    loading
  ) {

    return (

      <p className="
        text-[14px]
        text-[#7A8598]
      ">

        Loading notifications...

      </p>

    );

  }


  if (
    error
  ) {

    return (

      <div className="
        rounded-xl
        border
        border-red-200
        bg-red-50
        px-4
        py-3
        text-[13px]
        text-[#C62828]
      ">

        {error}

      </div>

    );

  }


  return (

    <div className="
      w-full
      max-w-[820px]
      space-y-5
    ">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div>

        <div className="
          flex
          items-center
          gap-3
        ">

          <div className="
            flex
            h-10
            w-10
            items-center
            justify-center
            rounded-xl
            bg-[#E8F4EA]
            text-[#087A32]
          ">

            <Bell
              size={19}
            />

          </div>


          <div>

            <h2 className="
              text-[21px]
              font-semibold
              text-[#1F3144]
            ">

              Notifications

            </h2>


            <p className="
              mt-1
              text-[12px]
              leading-5
              text-[#7A8598]
            ">

              Health updates from Administration,
              your Medical Supervisor, and the Agent
              assigned to your taluk.

            </p>

          </div>

        </div>

      </div>


      {/* ===================================================
          EMPTY
      =================================================== */}

      {notes.length ===
        0 && (

        <div className="
          rounded-2xl
          border
          border-[#E8E2D8]
          bg-white
          p-8
          text-center
        ">

          <div className="
            mx-auto
            flex
            h-11
            w-11
            items-center
            justify-center
            rounded-xl
            bg-[#F1F7F3]
            text-[#6D8E78]
          ">

            <Bell
              size={20}
            />

          </div>


          <p className="
            mt-3
            text-[14px]
            font-semibold
            text-[#344054]
          ">

            No notifications yet

          </p>


          <p className="
            mt-1
            text-[12px]
            text-[#98A1AC]
          ">

            New district and taluk
            health communications
            will appear here.

          </p>

        </div>

      )}


      {/* ===================================================
          NOTIFICATIONS
      =================================================== */}

      {notes.map(
        (
          note
        ) => {

          const TypeIcon =
            TYPE_ICON[
              note.type
            ] ||
            Megaphone;


          const SourceIcon =
            sourceIcon(
              note.source_role
            );


          const color =
            TYPE_COLOR[
              note.type
            ] ||
            "#0B7A33";


          return (

            <article
              key={
                note.id
              }
              className="
                rounded-2xl
                border
                border-[#E8E2D8]
                bg-white
                p-5
                shadow-[0_1px_3px_rgba(31,49,68,0.03)]
              "
            >

              <div className="
                flex
                gap-4
              ">

                <div
                  className="
                    flex
                    h-11
                    w-11
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                  "
                  style={{
                    backgroundColor:
                      color,
                  }}
                >

                  <TypeIcon
                    size={20}
                    className="
                      text-white
                    "
                  />

                </div>


                <div className="
                  min-w-0
                  flex-1
                ">

                  <div className="
                    flex
                    flex-wrap
                    items-start
                    justify-between
                    gap-2
                  ">

                    <h4 className="
                      text-[14px]
                      font-semibold
                      text-[#1F3144]
                    ">

                      {
                        note.title
                      }

                    </h4>


                    {note.created_at && (

                      <time className="
                        text-[10.5px]
                        text-[#9AA1AA]
                      ">

                        {
                          formatDate(
                            note.created_at
                          )
                        }

                      </time>

                    )}

                  </div>


                  <p className="
                    mt-1.5
                    text-[13px]
                    leading-5
                    text-[#536174]
                  ">

                    {
                      note.message
                    }

                  </p>


                  <div className="
                    mt-3
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  ">

                    <span className="
                      inline-flex
                      items-center
                      gap-1.5
                      rounded-full
                      bg-[#F0F8F2]
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-[#2F7650]
                    ">

                      <SourceIcon
                        size={12}
                      />

                      From:
                      {" "}
                      {
                        note.source_role
                        ||
                        "Administration"
                      }

                    </span>


                    <span className="
                      rounded-full
                      bg-[#F7F5F1]
                      px-2.5
                      py-1
                      text-[10px]
                      text-[#7A8598]
                    ">

                      {
                        note.scope_label
                        ||
                        note.taluk_name
                        ||
                        "Statewide"
                      }

                    </span>


                    {note.source_name && (

                      <span className="
                        text-[10px]
                        text-[#98A1AC]
                      ">

                        {
                          note.source_name
                        }

                      </span>

                    )}

                  </div>

                </div>

              </div>

            </article>

          );

        }
      )}

    </div>

  );

}