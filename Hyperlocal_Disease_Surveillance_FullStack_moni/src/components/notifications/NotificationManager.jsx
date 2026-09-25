import {
  useEffect,
  useMemo,
  useState,
} from "react";


import {
  Bell,
  ChevronRight,
  Megaphone,
  RefreshCw,
  Send,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";


import notificationApi
  from "../../api/notificationApi";


const TYPES = [
  "Health Camp",
  "Awareness Campaign",
  "Surveillance Update",
  "Preventive Advisory",
  "Reporting Reminder",
  "Emergency Alert",
];


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


function sourceTone(
  sourceRole
) {

  if (
    sourceRole ===
    "Medical Supervisor"
  ) {

    return (
      "bg-[#E8F4EA] text-[#087A32]"
    );

  }


  if (
    sourceRole ===
    "Agent"
  ) {

    return (
      "bg-[#EEF5FF] text-[#2B72C8]"
    );

  }


  return (
    "bg-[#F6F3ED] text-[#7A8598]"
  );

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


function getConfig(
  mode
) {

  if (
    mode ===
    "supervisor"
  ) {

    return {

      title:
        "Notifications",

      subtitle:
        "Publish district health communication and review notifications published by you.",

      listTitle:
        "My Published Notifications",

      scopeText:
        "Visible to citizens and agents across your assigned district.",

      load:
        notificationApi
          .getSupervisorNotifications,

      publish:
        notificationApi
          .publishSupervisorNotification,

      publishLabel:
        "Publish District Notification",

      empty:
        "You have not published any district notifications yet.",
    };

  }


  if (
    mode ===
    "agent"
  ) {

    return {

      title:
        "Notifications",

      subtitle:
        "Publish taluk-level updates and view notifications from your Medical Supervisor and yourself.",

      listTitle:
        "District & Taluk Notifications",

      scopeText:
        "Supervisor messages for your district and Agent messages for your assigned taluk.",

      load:
        notificationApi
          .getAgentNotifications,

      publish:
        notificationApi
          .publishAgentNotification,

      publishLabel:
        "Publish Taluk Notification",

      empty:
        "No supervisor or agent notifications are available yet.",
    };

  }


  return {

    title:
      "Notifications",

    subtitle:
      "Review notifications published by Medical Supervisors and Field Agents.",

    listTitle:
      "Published Notifications",

    scopeText:
      "Read-only administrative view of supervisor and agent communications.",

    load:
      notificationApi
        .getAdminNotifications,

    publish:
      null,

    publishLabel:
      "",

    empty:
      "No supervisor or agent notifications have been published yet.",
  };

}


export default function NotificationManager({
  mode =
    "admin",
}) {

  const config =
    useMemo(
      () =>
        getConfig(
          mode
        ),
      [mode]
    );


  const [
    notes,
    setNotes,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    refreshing,
    setRefreshing,
  ] = useState(false);


  const [
    saving,
    setSaving,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    form,
    setForm,
  ] = useState({

    title:
      "",

    message:
      "",

    type:
      TYPES[0],

  });


  const load =
    async (
      initial = false
    ) => {

      try {

        setError("");


        if (initial) {

          setLoading(
            true
          );

        } else {

          setRefreshing(
            true
          );

        }


        const result =
          await config.load();


        setNotes(

          Array.isArray(
            result
          )
            ? result
            : []

        );

      } catch (err) {

        setError(

          err?.message
          ||
          "Unable to load notifications."

        );

      } finally {

        setLoading(
          false
        );

        setRefreshing(
          false
        );

      }

    };


  useEffect(
    () => {

      load(
        true
      );

      // eslint-disable-next-line react-hooks/exhaustive-deps

    },
    [mode]
  );


  const handlePublish =
    async (
      event
    ) => {

      event.preventDefault();


      if (
        !config.publish
      ) {

        return;

      }


      const title =
        form.title.trim();


      const message =
        form.message.trim();


      if (
        !title ||
        !message
      ) {

        setError(
          "Title and message are required."
        );

        return;

      }


      try {

        setSaving(
          true
        );

        setError("");


        await config.publish({

          title,

          message,

          type:
            form.type,

        });


        setForm({

          title:
            "",

          message:
            "",

          type:
            TYPES[0],

        });


        await load(
          false
        );

      } catch (err) {

        setError(

          err?.message
          ||
          "Unable to publish notification."

        );

      } finally {

        setSaving(
          false
        );

      }

    };


  if (
    loading
  ) {

    return (

      <div className="
        flex
        min-h-[360px]
        items-center
        justify-center
      ">

        <div className="
          flex
          items-center
          gap-3
          text-[13px]
          text-[#7A8598]
        ">

          <RefreshCw
            size={17}
            className="
              animate-spin
            "
          />

          Loading notifications...

        </div>

      </div>

    );

  }


  return (

    <div className="
      w-full
    ">

      {/* ===================================================
          HEADER
      =================================================== */}

      <div className="
        mb-6
        flex
        flex-wrap
        items-start
        justify-between
        gap-4
      ">

        <div>

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              flex
              h-11
              w-11
              items-center
              justify-center
              rounded-xl
              bg-[#E8F4EA]
              text-[#087A32]
            ">

              <Bell
                size={22}
                strokeWidth={1.8}
              />

            </div>


            <div>

              <h2 className="
                text-[21px]
                font-semibold
                tracking-[-0.2px]
                text-[#17233D]
              ">

                {
                  config.title
                }

              </h2>


              <p className="
                mt-1
                max-w-[720px]
                text-[12px]
                leading-5
                text-[#718096]
              ">

                {
                  config.subtitle
                }

              </p>

            </div>

          </div>

        </div>


        <button
          type="button"
          onClick={() =>
            load(false)
          }
          disabled={
            refreshing
          }
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            border
            border-[#DDE5DF]
            bg-white
            px-3
            py-2
            text-[12px]
            font-semibold
            text-[#345444]
            transition
            hover:bg-[#F7FAF8]
            disabled:opacity-60
          "
        >

          <RefreshCw
            size={14}
            className={
              refreshing
                ? "animate-spin"
                : ""
            }
          />

          Refresh

        </button>

      </div>


      {error && (

        <div className="
          mb-5
          rounded-xl
          border
          border-[#F0CACA]
          bg-[#FFF5F5]
          px-4
          py-3
          text-[12px]
          text-[#C62828]
        ">

          {error}

        </div>

      )}


      {/* ===================================================
          CONTENT
      =================================================== */}

      <div
        className={
          config.publish
            ? `
              grid
              grid-cols-1
              gap-6
              xl:grid-cols-[minmax(340px,0.82fr)_minmax(480px,1.18fr)]
            `
            : `
              w-full
            `
        }
      >

        {/* =================================================
            PUBLISH
        ================================================= */}

        {config.publish && (

          <section>

            <div className="
              mb-3
            ">

              <h3 className="
                text-[15px]
                font-semibold
                text-[#17233D]
              ">

                Publish Notification

              </h3>


              <p className="
                mt-1
                text-[11px]
                text-[#8A94A3]
              ">

                {
                  config.scopeText
                }

              </p>

            </div>


            <form
              onSubmit={
                handlePublish
              }
              className="
                rounded-2xl
                border
                border-[#E3E8E4]
                bg-white
                p-5
                shadow-[0_2px_10px_rgba(23,35,61,0.025)]
              "
            >

              <div className="
                mb-5
                flex
                items-center
                gap-3
                rounded-xl
                bg-[#F5FAF6]
                px-4
                py-3
              ">

                <ShieldCheck
                  size={18}
                  className="
                    text-[#087A32]
                  "
                />

                <div>

                  <p className="
                    text-[12px]
                    font-semibold
                    text-[#244233]
                  ">

                    {
                      mode ===
                      "supervisor"
                        ? "District communication"
                        : "Taluk communication"
                    }

                  </p>


                  <p className="
                    mt-0.5
                    text-[10px]
                    text-[#718096]
                  ">

                    {
                      mode ===
                      "supervisor"
                        ? "This message is published to your assigned district."
                        : "This message is published to your assigned taluk."
                    }

                  </p>

                </div>

              </div>


              <div className="
                space-y-4
              ">

                <div>

                  <label className="
                    mb-1.5
                    block
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.06em]
                    text-[#687587]
                  ">

                    Notification Type

                  </label>


                  <select
                    value={
                      form.type
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          type:
                            event.target
                              .value,
                        })
                      )
                    }
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-[#DDE5DF]
                      bg-white
                      px-3
                      text-[13px]
                      text-[#263238]
                      outline-none
                      focus:border-[#3A8D55]
                    "
                  >

                    {TYPES.map(
                      (
                        type
                      ) => (

                        <option
                          key={
                            type
                          }
                          value={
                            type
                          }
                        >

                          {type}

                        </option>

                      )
                    )}

                  </select>

                </div>


                <div>

                  <label className="
                    mb-1.5
                    block
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.06em]
                    text-[#687587]
                  ">

                    Title

                  </label>


                  <input
                    required
                    maxLength={
                      200
                    }
                    value={
                      form.title
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          title:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="
                      Enter a clear notification title
                    "
                    className="
                      h-11
                      w-full
                      rounded-lg
                      border
                      border-[#DDE5DF]
                      bg-white
                      px-3
                      text-[13px]
                      text-[#263238]
                      outline-none
                      placeholder:text-[#A5ADB7]
                      focus:border-[#3A8D55]
                    "
                  />

                </div>


                <div>

                  <label className="
                    mb-1.5
                    block
                    text-[11px]
                    font-semibold
                    uppercase
                    tracking-[0.06em]
                    text-[#687587]
                  ">

                    Message

                  </label>


                  <textarea
                    required
                    rows={
                      6
                    }
                    maxLength={
                      4000
                    }
                    value={
                      form.message
                    }
                    onChange={(
                      event
                    ) =>
                      setForm(
                        (
                          current
                        ) => ({
                          ...current,
                          message:
                            event.target
                              .value,
                        })
                      )
                    }
                    placeholder="
                      Write the health communication that should reach the relevant field teams and citizens.
                    "
                    className="
                      w-full
                      resize-none
                      rounded-lg
                      border
                      border-[#DDE5DF]
                      bg-white
                      px-3
                      py-3
                      text-[13px]
                      leading-5
                      text-[#263238]
                      outline-none
                      placeholder:text-[#A5ADB7]
                      focus:border-[#3A8D55]
                    "
                  />

                </div>


                <button
                  type="submit"
                  disabled={
                    saving
                  }
                  className="
                    flex
                    h-11
                    w-full
                    items-center
                    justify-center
                    gap-2
                    rounded-lg
                    bg-[#07852F]
                    text-[13px]
                    font-semibold
                    text-white
                    transition
                    hover:bg-[#067528]
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >

                  <Send
                    size={15}
                  />

                  {
                    saving
                      ? "Publishing..."
                      : config.publishLabel
                  }

                </button>

              </div>

            </form>

          </section>

        )}


        {/* =================================================
            LIST
        ================================================= */}

        <section>

          <div className="
            mb-3
            flex
            items-end
            justify-between
            gap-4
          ">

            <div>

              <h3 className="
                text-[15px]
                font-semibold
                text-[#17233D]
              ">

                {
                  config.listTitle
                }

              </h3>


              <p className="
                mt-1
                text-[11px]
                text-[#8A94A3]
              ">

                {
                  config.scopeText
                }

              </p>

            </div>


            <span className="
              rounded-full
              bg-[#F3F7F4]
              px-3
              py-1
              text-[10px]
              font-semibold
              text-[#35734A]
            ">

              {
                notes.length
              }

              {" "}

              notification
              {
                notes.length ===
                1
                  ? ""
                  : "s"
              }

            </span>

          </div>


          <div className="
            space-y-3
          ">

            {notes.map(
              (
                note
              ) => {

                const Icon =
                  sourceIcon(
                    note.source_role
                  );


                const tone =
                  sourceTone(
                    note.source_role
                  );


                return (

                  <article
                    key={
                      note.id
                    }
                    className="
                      group
                      rounded-2xl
                      border
                      border-[#E3E8E4]
                      bg-white
                      p-4
                      transition
                      hover:border-[#C9D9CE]
                      hover:shadow-[0_5px_18px_rgba(23,35,61,0.035)]
                    "
                  >

                    <div className="
                      flex
                      gap-3
                    ">

                      <div
                        className={`
                          flex
                          h-10
                          w-10
                          shrink-0
                          items-center
                          justify-center
                          rounded-xl
                          ${tone}
                        `}
                      >

                        <Icon
                          size={18}
                          strokeWidth={
                            1.8
                          }
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
                            text-[13.5px]
                            font-semibold
                            text-[#17233D]
                          ">

                            {
                              note.title
                            }

                          </h4>


                          <span className="
                            shrink-0
                            text-[10px]
                            text-[#8A94A3]
                          ">

                            {
                              formatDate(
                                note.created_at
                              )
                            }

                          </span>

                        </div>


                        <p className="
                          mt-1.5
                          text-[12px]
                          leading-5
                          text-[#69788A]
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
                            rounded-full
                            bg-[#F5F8F6]
                            px-2.5
                            py-1
                            text-[10px]
                            font-semibold
                            text-[#3D7650]
                          ">

                            From:
                            {" "}
                            {
                              note.source_role
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


                          <ChevronRight
                            size={14}
                            className="
                              ml-auto
                              text-[#A8B0B8]
                              transition
                              group-hover:translate-x-0.5
                            "
                          />

                        </div>

                      </div>

                    </div>

                  </article>

                );

              }
            )}


            {notes.length ===
              0 && (

              <div className="
                rounded-2xl
                border
                border-dashed
                border-[#D9E1DB]
                bg-white
                p-10
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
                  text-[13px]
                  font-semibold
                  text-[#374151]
                ">

                  {
                    config.empty
                  }

                </p>


                <p className="
                  mt-1
                  text-[11px]
                  text-[#98A1AC]
                ">

                  Notifications will appear here automatically after they are published.

                </p>

              </div>

            )}

          </div>

        </section>

      </div>

    </div>

  );

}