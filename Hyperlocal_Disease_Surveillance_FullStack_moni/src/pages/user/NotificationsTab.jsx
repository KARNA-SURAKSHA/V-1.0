import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Megaphone,
  Siren,
  Stethoscope,
  Bell,
} from "lucide-react";

import {
  api,
} from "../../api";


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


function notificationKey(
  notification
) {
  return String(
    notification?.id ??
      `${notification?.title || ""}-${notification?.created_at || ""}-${notification?.message || ""}`
  );
}


export default function NotificationsTab({
  selectedLocation,
}) {

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


  const talukId =
    selectedLocation?.talukId;


  const districtId =
    selectedLocation?.districtId;


  useEffect(() => {

    let cancelled = false;


    async function loadNotifications() {

      if (!talukId) {

        setNotes([]);
        setError("");
        setLoading(false);

        return;

      }


      setLoading(true);
      setError("");


      try {

        /*
         * ======================================================
         * USER NOTIFICATION SCOPE
         * ======================================================
         *
         * The existing backend notification API supports:
         *
         *     /notifications/{talukId}
         *
         * and returns:
         *
         *   1. Notifications for that taluk.
         *   2. Statewide notifications.
         *
         * A citizen, however, must see notifications relevant
         * to the complete district as well.
         *
         * Therefore:
         *
         *   - Always request the citizen's own taluk.
         *   - Find every taluk belonging to the citizen's
         *     selected district.
         *   - Request notifications for every taluk.
         *   - Merge and remove duplicate notifications.
         *
         * This means the notification page receives:
         *
         *   ADMIN / STATEWIDE
         *        +
         *   MEDICAL SUPERVISOR / DISTRICT
         *        +
         *   AGENT / CITIZEN'S TALUK
         *
         * without requiring a database migration.
         * ======================================================
         */


        const targetTalukIds =
          new Set([
            Number(talukId),
          ]);


        /*
         * ======================================================
         * LOAD ALL TALUKS OF THE SELECTED DISTRICT
         * ======================================================
         */

        if (districtId) {

          const districtTaluks =
            await api.getTaluks(
              Number(districtId)
            );


          if (
            Array.isArray(
              districtTaluks
            )
          ) {

            districtTaluks.forEach(
              (taluk) => {

                const id =
                  Number(
                    taluk?.id
                  );


                if (
                  Number.isFinite(
                    id
                  ) &&
                  id > 0
                ) {

                  targetTalukIds.add(
                    id
                  );

                }

              }
            );

          }

        }


        /*
         * ======================================================
         * FETCH NOTIFICATIONS
         * ======================================================
         */

        const results =
          await Promise.all(
            Array.from(
              targetTalukIds
            ).map(
              (id) =>
                api.getNotifications(
                  id
                )
            )
          );


        if (
          cancelled
        ) {
          return;
        }


        /*
         * ======================================================
         * REMOVE DUPLICATES
         * ======================================================
         *
         * Statewide notifications are returned by every taluk
         * request, so without deduplication the same notification
         * would appear multiple times.
         */

        const unique =
          new Map();


        results
          .flatMap(
            (result) =>
              Array.isArray(result)
                ? result
                : []
          )
          .forEach(
            (notification) => {

              unique.set(
                notificationKey(
                  notification
                ),
                notification
              );

            }
          );


        /*
         * ======================================================
         * SORT NEWEST FIRST
         * ======================================================
         */

        const sorted =
          Array.from(
            unique.values()
          ).sort(
            (
              a,
              b
            ) => {

              const aTime =
                new Date(
                  a?.created_at ||
                    0
                ).getTime();


              const bTime =
                new Date(
                  b?.created_at ||
                    0
                ).getTime();


              return (
                bTime -
                aTime
              );

            }
          );


        setNotes(
          sorted
        );

      } catch (e) {

        if (
          !cancelled
        ) {

          setNotes([]);

          setError(
            e?.message ||
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


    loadNotifications();


    return () => {

      cancelled = true;

    };

  }, [
    talukId,
    districtId,
  ]);


  const visibleNotes =
    useMemo(
      () => notes,
      [notes]
    );


  /*
   * ==========================================================
   * LOADING
   * ==========================================================
   */

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


  /*
   * ==========================================================
   * ERROR
   * ==========================================================
   */

  if (
    error
  ) {

    return (

      <div className="
        space-y-2
      ">

        <p className="
          text-[14px]
          text-[#C62828]
        ">
          {error}
        </p>


        <p className="
          text-[12px]
          text-[#7A8598]
        ">
          Please try opening Notifications again
          after confirming that the backend is running.
        </p>

      </div>

    );

  }


  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (

    <div className="
      w-full
      max-w-[760px]
      space-y-5
    ">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div>

        <h2 className="
          text-[22px]
          font-semibold
          text-[#1F3144]
        ">
          Notifications
        </h2>


        <p className="
          mt-1
          text-[13px]
          leading-5
          text-[#7A8598]
        ">
          Health communications for your selected
          taluk and district, including statewide updates.
        </p>

      </div>


      {/* =====================================================
          EMPTY STATE
      ===================================================== */}

      {visibleNotes.length === 0 && (

        <div className="
          rounded-xl
          border
          border-[#E8E2D8]
          bg-white
          p-6
        ">

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
              rounded-lg
              bg-[#EAF6EE]
              text-[#0B7A33]
            ">

              <Bell
                size={19}
              />

            </div>


            <div>

              <p className="
                text-[14px]
                font-semibold
                text-[#1F3144]
              ">
                No notifications yet
              </p>


              <p className="
                mt-1
                text-[12px]
                text-[#7A8598]
              ">
                New health communications will appear
                here when they are published for your area.
              </p>

            </div>

          </div>

        </div>

      )}


      {/* =====================================================
          NOTIFICATION LIST
      ===================================================== */}

      {visibleNotes.map(
        (
          notification
        ) => {

          const Icon =
            TYPE_ICON[
              notification?.type
            ] ||
            Megaphone;


          const color =
            TYPE_COLOR[
              notification?.type
            ] ||
            "#0B7A33";


          const scope =
            notification?.taluk_name ||
            "Statewide";


          return (

            <div
              key={
                notificationKey(
                  notification
                )
              }
              className="
                flex
                gap-4
                rounded-xl
                border
                border-[#E8E2D8]
                bg-white
                p-5
                shadow-[0_1px_2px_rgba(31,49,68,0.03)]
              "
            >

              {/* ICON */}

              <div
                className="
                  flex
                  h-10
                  w-10
                  flex-shrink-0
                  items-center
                  justify-center
                  rounded-lg
                "
                style={{
                  backgroundColor:
                    color,
                }}
              >

                <Icon
                  size={20}
                  className="
                    text-white
                  "
                />

              </div>


              {/* CONTENT */}

              <div className="
                min-w-0
                flex-1
              ">

                <div className="
                  flex
                  flex-wrap
                  items-center
                  gap-2
                ">

                  <h4 className="
                    font-semibold
                    text-[#1F3144]
                  ">
                    {
                      notification?.title
                    }
                  </h4>


                  <span className="
                    rounded-full
                    bg-[#F6F3ED]
                    px-2
                    py-0.5
                    text-[11px]
                    text-[#7A8598]
                  ">
                    {scope}
                  </span>

                </div>


                <p className="
                  mt-1
                  text-[14px]
                  leading-6
                  text-[#445064]
                ">
                  {
                    notification?.message
                  }
                </p>


                {notification?.created_at && (

                  <p className="
                    mt-2
                    text-[11px]
                    text-[#9AA1AA]
                  ">
                    {new Date(
                      notification.created_at
                    ).toLocaleString()}
                  </p>

                )}

              </div>

            </div>

          );

        }
      )}

    </div>

  );

}