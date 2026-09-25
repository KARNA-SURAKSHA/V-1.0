import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  MapPin,
  MapPinned,
  Menu,
  BarChart3,
  UserRoundCog,
} from "lucide-react";

import {
  useAuth,
} from "../../../context/AuthContext";

import medicalDoctor from "../../../assets/ui/medical-doctor.png";

import supervisorLogo from "../../../assets/ui/medical-supervisor-logo.png";

import NotificationManager from "../../../components/notifications/NotificationManager";


// ============================================================
// NAVIGATION
// ============================================================

export const MEDICAL_NAV = [

  {
    key: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    section: "OVERVIEW",
  },

  {
    key: "reports",
    label: "Disease Reports",
    icon: FileText,
    section: "SURVEILLANCE",
  },

  {
    key: "risk-map",
    label: "Risk Map",
    icon: MapPinned,
  },

  {
    key: "analytics",
    label: "Surveillance Analytics",
    icon: BarChart3,
  },

  {
    key: "agents",
    label: "Agent Oversight",
    icon: UserRoundCog,
    section: "REVIEW & RESPONSE",
  },


  // ==========================================================
  // EXISTING ALERTS
  // ==========================================================

  {
    key: "alerts",
    label: "Alerts",
    icon: Bell,
  },


  // ==========================================================
  // NEW NOTIFICATIONS
  // ==========================================================

  {
    key: "notifications",
    label: "Notifications",
    icon: Bell,
  },


  {
    key: "home-relief",
    label: "Home Relief",
    icon: ClipboardCheck,
    section: "MEDICAL CONTENT",
  },

];


// ============================================================
// DATE
// ============================================================

function formatHeaderDate(date) {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  ).format(date);

}


// ============================================================
// LAYOUT
// ============================================================

export default function MedicalSupervisorLayout({

  activeTab,

  onTabChange,

  onExit,

  alertCount,

  districtName,

  locationName,

  children,

}) {

  const {
    session,
  } = useAuth();


  // ==========================================================
  // PROFILE
  // ==========================================================

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);


  // ==========================================================
  // MOBILE MENU
  // ==========================================================

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);


  // ==========================================================
  // CURRENT DATE
  // ==========================================================

  const [
    now,
    setNow,
  ] = useState(
    () => new Date()
  );


  const profileRef =
    useRef(null);


  // ==========================================================
  // LIVE DATE
  // ==========================================================

  useEffect(() => {

    const timer =
      window.setInterval(
        () => {

          setNow(
            new Date()
          );

        },
        60 * 1000
      );


    return () =>
      window.clearInterval(
        timer
      );

  }, []);


  // ==========================================================
  // CLOSE PROFILE
  // ==========================================================

  useEffect(() => {

    const closeProfile =
      (event) => {

        if (
          profileRef.current &&
          !profileRef.current.contains(
            event.target
          )
        ) {

          setProfileOpen(
            false
          );

        }

      };


    document.addEventListener(
      "mousedown",
      closeProfile
    );


    return () =>
      document.removeEventListener(
        "mousedown",
        closeProfile
      );

  }, []);


  // ==========================================================
  // BODY LOCK
  // ==========================================================

  useEffect(() => {

    document.body.style.overflow =
      mobileOpen
        ? "hidden"
        : "";


    return () => {

      document.body.style.overflow =
        "";

    };

  }, [
    mobileOpen,
  ]);


  // ==========================================================
  // USER
  // ==========================================================

  const fullName =
    session?.full_name ||
    "Dr. Monish";


  const role =
    "Medical Supervisor";


  const dateLabel =
    useMemo(
      () =>
        formatHeaderDate(
          now
        ),
      [
        now,
      ]
    );


  // ==========================================================
  // NAVIGATION
  // ==========================================================

  const selectTab =
    (key) => {

      onTabChange(
        key
      );


      setMobileOpen(
        false
      );


      setProfileOpen(
        false
      );


      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

    };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className="
        min-h-screen
        w-full
        bg-[#FBFCFB]
        text-[#17233D]
      "
    >

      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`
          fixed
          left-0
          top-0
          z-[60]
          h-screen
          w-[283px]
          border-r
          border-[#E4E8E5]
          bg-white
          transition-transform
          duration-200

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full lg:translate-x-0"
          }
        `}
      >

        {/* ====================================================
            BRAND
            ==================================================== */}

        <div
          className="
            flex
            h-[89px]
            w-full
            items-center
            border-b
            border-[#E4E8E5]
            px-[21px]
          "
        >

          <img
            src={
              supervisorLogo
            }
            alt="Medical Supervisor"
            draggable="false"
            className="
              h-[48px]
              w-[43px]
              shrink-0
              object-contain
            "
          />


          <div
            className="
              ml-[12px]
              min-w-0
            "
          >

            <div
              className="
                whitespace-nowrap
                text-[16px]
                font-bold
                leading-none
                tracking-[-0.35px]
                text-[#17233D]
              "
            >

              MEDICAL SUPERVISOR

            </div>


            <div
              className="
                mt-[7px]
                text-[11px]
                font-medium
                leading-none
                text-[#667085]
              "
            >

              Surveillance System

            </div>

          </div>

        </div>


        {/* ====================================================
            NAVIGATION
            ==================================================== */}

        <nav
          className="
            h-[calc(100vh-89px)]
            overflow-y-auto
            px-[12px]
            py-[20px]
          "
        >

          {MEDICAL_NAV.map(
            (
              item
            ) => {

              const Icon =
                item.icon;


              const active =
                activeTab ===
                item.key;


              return (

                <div
                  key={
                    item.key
                  }
                >

                  {/* ==========================================
                      SECTION
                      ========================================== */}

                  {item.section && (

                    <div
                      className={`
                        px-[12px]
                        text-[10px]
                        font-semibold
                        uppercase
                        tracking-[0.02em]
                        text-[#667085]

                        ${
                          item.section ===
                          "OVERVIEW"
                            ? "pb-[8px]"
                            : "pt-[19px] pb-[8px]"
                        }
                      `}
                    >

                      {
                        item.section
                      }

                    </div>

                  )}


                  {/* ==========================================
                      NAVIGATION ITEM
                      ========================================== */}

                  <button
                    type="button"
                    onClick={() =>
                      selectTab(
                        item.key
                      )
                    }
                    className={`
                      flex
                      h-[43px]
                      w-full
                      items-center
                      gap-[14px]
                      rounded-[9px]
                      px-[14px]
                      text-left
                      transition-colors
                      duration-150

                      ${
                        active
                          ? "bg-[#E8F4EA] text-[#36734B]"
                          : "text-[#17233D] hover:bg-[#F6F9F7]"
                      }
                    `}
                  >

                    <Icon
                      size={19}
                      strokeWidth={
                        active
                          ? 2
                          : 1.7
                      }
                      className="
                        shrink-0
                      "
                    />


                    <span
                      className={`
                        whitespace-nowrap
                        text-[13px]
                        leading-none

                        ${
                          active
                            ? "font-semibold"
                            : "font-medium"
                        }
                      `}
                    >

                      {
                        item.label
                      }

                    </span>


                    {/* ========================================
                        EXISTING ALERT BADGE
                        ======================================== */}

                    {item.key ===
                      "alerts" &&

                      Number(
                        alertCount ||
                          0
                      ) > 0 && (

                        <span
                          className="
                            ml-auto
                            flex
                            min-w-[21px]
                            items-center
                            justify-center
                            rounded-[6px]
                            bg-[#E8F4EA]
                            px-[6px]
                            py-[4px]
                            text-[10px]
                            font-bold
                            leading-none
                            text-[#087A32]
                          "
                        >

                          {
                            alertCount >
                            99
                              ? "99+"
                              : alertCount
                          }

                        </span>

                      )}

                  </button>

                </div>

              );

            }
          )}


          {/* ==================================================
              LOGOUT
              ================================================== */}

          <div
            className="
              mt-[18px]
              border-t
              border-[#EEF1EF]
              pt-[17px]
            "
          >

            <button
              type="button"
              onClick={
                onExit
              }
              className="
                flex
                h-[43px]
                w-full
                items-center
                gap-[14px]
                rounded-[9px]
                px-[14px]
                text-left
                text-[13px]
                font-medium
                text-[#17233D]
                transition
                hover:bg-[#F6F9F7]
              "
            >

              <LogOut
                size={19}
                strokeWidth={1.7}
              />

              Logout

            </button>

          </div>

        </nav>

      </aside>


      {/* ======================================================
          HEADER
          ====================================================== */}

      <header
        className="
          fixed
          left-0
          right-0
          top-0
          z-[50]
          ml-[283px]
          h-[89px]
          border-b
          border-[#E4E8E5]
          bg-white
        "
      >

        <div
          className="
            flex
            h-full
            items-center
            justify-between
            px-[28px]
          "
        >

          {/* ==================================================
              MENU
              ================================================== */}

          <button
            type="button"
            onClick={() =>
              setMobileOpen(
                (
                  value
                ) =>
                  !value
              )
            }
            aria-label="Toggle navigation"
            className="
              flex
              h-[40px]
              w-[40px]
              items-center
              justify-center
              rounded-[9px]
              text-[#263238]
              transition
              hover:bg-[#F4F7F5]
            "
          >

            <Menu
              size={25}
              strokeWidth={1.7}
            />

          </button>


          {/* ==================================================
              RIGHT CONTROLS
              ================================================== */}

          <div
            className="
              flex
              items-center
              gap-[14px]
            "
          >

            {/* =================================================
                LOCATION
                ================================================= */}

            <button
              type="button"
              className="
                hidden
                h-[44px]
                min-w-[202px]
                items-center
                gap-[9px]
                rounded-[8px]
                border
                border-[#E1E6E3]
                bg-white
                px-[14px]
                text-[12px]
                font-semibold
                text-[#17233D]
                md:flex
              "
            >

              <MapPin
                size={18}
                strokeWidth={1.8}
                className="
                  shrink-0
                  text-[#087A32]
                "
              />


              <span
                className="
                  flex-1
                  truncate
                  text-left
                "
              >

                {
                  locationName ||
                  districtName ||
                  "Virajpet, Kodagu"
                }

              </span>


              <ChevronDown
                size={15}
                strokeWidth={1.7}
              />

            </button>


            {/* =================================================
                DATE
                ================================================= */}

            <button
              type="button"
              className="
                hidden
                h-[44px]
                min-w-[199px]
                items-center
                gap-[9px]
                rounded-[8px]
                border
                border-[#E1E6E3]
                bg-white
                px-[14px]
                text-[12px]
                font-semibold
                text-[#17233D]
                md:flex
              "
            >

              <CalendarDays
                size={18}
                strokeWidth={1.7}
              />


              <span
                className="
                  flex-1
                  text-left
                "
              >

                {
                  dateLabel
                }

              </span>


              <ChevronDown
                size={15}
                strokeWidth={1.7}
              />

            </button>


            {/* =================================================
                HEADER NOTIFICATION BELL
                ================================================= */}

            <button
              type="button"
              onClick={() =>
                selectTab(
                  "notifications"
                )
              }
              aria-label="Notifications"
              className="
                relative
                flex
                h-[40px]
                w-[40px]
                items-center
                justify-center
                rounded-[9px]
                text-[#263238]
                transition
                hover:bg-[#F4F7F5]
              "
            >

              <Bell
                size={22}
                strokeWidth={1.7}
              />

            </button>


            {/* =================================================
                PROFILE
                ================================================= */}

            <div
              ref={
                profileRef
              }
              className="
                relative
              "
            >

              <button
                type="button"
                onClick={() =>
                  setProfileOpen(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                className="
                  flex
                  items-center
                  gap-[9px]
                  rounded-[9px]
                  px-[4px]
                  py-[3px]
                  transition
                  hover:bg-[#F4F7F5]
                "
              >

                <img
                  src={
                    medicalDoctor
                  }
                  alt="Medical Supervisor"
                  draggable="false"
                  className="
                    h-[42px]
                    w-[42px]
                    rounded-full
                    bg-[#EAF6EE]
                    object-cover
                  "
                />


                <div
                  className="
                    hidden
                    min-w-[112px]
                    text-left
                    sm:block
                  "
                >

                  <div
                    className="
                      text-[12px]
                      font-semibold
                      leading-tight
                      text-[#17233D]
                    "
                  >

                    {
                      fullName
                    }

                  </div>


                  <div
                    className="
                      mt-[3px]
                      text-[10px]
                      leading-tight
                      text-[#718096]
                    "
                  >

                    {
                      role
                    }

                  </div>

                </div>


                <ChevronDown
                  size={15}
                  strokeWidth={1.8}
                  className={
                    profileOpen
                      ? "rotate-180 transition-transform"
                      : "transition-transform"
                  }
                />

              </button>


              {/* =================================================
                  PROFILE DROPDOWN
                  ================================================= */}

              {profileOpen && (

                <div
                  className="
                    absolute
                    right-0
                    top-[52px]
                    z-[80]
                    w-[270px]
                    overflow-hidden
                    rounded-[14px]
                    border
                    border-[#E1E7E3]
                    bg-white
                    shadow-[0_18px_45px_rgba(16,42,67,.14)]
                  "
                >

                  <div
                    className="
                      border-b
                      border-[#E7ECE9]
                      bg-[#F6FBF7]
                      p-[16px]
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-[12px]
                      "
                    >

                      <img
                        src={
                          medicalDoctor
                        }
                        alt=""
                        className="
                          h-[44px]
                          w-[44px]
                          rounded-full
                          bg-[#EAF6EE]
                          object-cover
                        "
                      />


                      <div
                        className="
                          min-w-0
                        "
                      >

                        <div
                          className="
                            truncate
                            text-[13px]
                            font-semibold
                            text-[#17233D]
                          "
                        >

                          {
                            fullName
                          }

                        </div>


                        <div
                          className="
                            mt-[3px]
                            text-[10px]
                            text-[#718096]
                          "
                        >

                          {
                            role
                          }

                        </div>

                      </div>

                    </div>

                  </div>


                  <div
                    className="
                      p-[12px]
                    "
                  >

                    {/* ROLE */}

                    <div
                      className="
                        flex
                        items-center
                        gap-[12px]
                        rounded-[9px]
                        p-[10px]
                      "
                    >

                      <UserRoundCog
                        size={17}
                        className="
                          text-[#087A32]
                        "
                      />


                      <div>

                        <div
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[.08em]
                            text-[#8A93A3]
                          "
                        >

                          Role

                        </div>


                        <div
                          className="
                            text-[12px]
                            font-medium
                            text-[#17233D]
                          "
                        >

                          {
                            role
                          }

                        </div>

                      </div>

                    </div>


                    {/* DISTRICT */}

                    <div
                      className="
                        flex
                        items-center
                        gap-[12px]
                        rounded-[9px]
                        p-[10px]
                      "
                    >

                      <MapPin
                        size={17}
                        className="
                          text-[#315C88]
                        "
                      />


                      <div>

                        <div
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[.08em]
                            text-[#8A93A3]
                          "
                        >

                          Assigned District

                        </div>


                        <div
                          className="
                            text-[12px]
                            font-medium
                            text-[#17233D]
                          "
                        >

                          {
                            districtName ||
                            "Kodagu"
                          }

                        </div>

                      </div>

                    </div>


                    {/* ALERTS */}

                    <div
                      className="
                        flex
                        items-center
                        gap-[12px]
                        rounded-[9px]
                        p-[10px]
                      "
                    >

                      <Bell
                        size={17}
                        className="
                          text-[#315C88]
                        "
                      />


                      <div>

                        <div
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[.08em]
                            text-[#8A93A3]
                          "
                        >

                          Alerts

                        </div>


                        <div
                          className="
                            text-[12px]
                            font-medium
                            text-[#17233D]
                          "
                        >

                          {
                            alertCount ||
                            0
                          }{" "}

                          active

                        </div>

                      </div>

                    </div>


                    {/* NOTIFICATIONS */}

                    <button
                      type="button"
                      onClick={() =>
                        selectTab(
                          "notifications"
                        )
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-[12px]
                        rounded-[9px]
                        p-[10px]
                        text-left
                        transition
                        hover:bg-[#F5F9F6]
                      "
                    >

                      <Bell
                        size={17}
                        className="
                          text-[#087A32]
                        "
                      />


                      <div>

                        <div
                          className="
                            text-[9px]
                            font-bold
                            uppercase
                            tracking-[.08em]
                            text-[#8A93A3]
                          "
                        >

                          Notifications

                        </div>


                        <div
                          className="
                            text-[12px]
                            font-medium
                            text-[#17233D]
                          "
                        >

                          View published notifications

                        </div>

                      </div>

                    </button>

                  </div>


                  {/* LOGOUT */}

                  <div
                    className="
                      border-t
                      border-[#E7ECE9]
                      p-[12px]
                    "
                  >

                    <button
                      type="button"
                      onClick={
                        onExit
                      }
                      className="
                        flex
                        w-full
                        items-center
                        gap-[8px]
                        rounded-[9px]
                        px-[12px]
                        py-[10px]
                        text-left
                        text-[12px]
                        font-semibold
                        text-[#C62828]
                        transition
                        hover:bg-[#FFF4F4]
                      "
                    >

                      <LogOut
                        size={16}
                      />

                      Logout

                    </button>

                  </div>

                </div>

              )}

            </div>

          </div>

        </div>

      </header>


      {/* ======================================================
          MOBILE OVERLAY
          ====================================================== */}

      {mobileOpen && (

        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(
              false
            )
          }
          className="
            fixed
            inset-0
            z-[55]
            bg-black/10
            lg:hidden
          "
        />

      )}


      {/* ======================================================
          MAIN CONTENT
          ====================================================== */}

      <main
        className="
          min-h-screen
          bg-[#FBFCFB]
          pt-[89px]
          lg:ml-[283px]
        "
      >

        <div
          className="
            w-full
            px-[30px]
            py-[18px]
          "
        >

          {/* ==================================================
              IMPORTANT:

              ALERTS remains the existing Alerts page.

              NOTIFICATIONS uses the new NotificationManager.
              ================================================== */}

          {activeTab ===
            "notifications" ? (

            <NotificationManager
              mode="supervisor"
            />

          ) : (

            children

          )}

        </div>

      </main>

    </div>

  );

}