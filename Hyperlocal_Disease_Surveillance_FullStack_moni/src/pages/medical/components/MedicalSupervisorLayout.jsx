import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Bell,
  CalendarDays,
  ChevronDown,
  LayoutDashboard,
  FileText,
  ClipboardCheck,
  MapPinned,
  BarChart3,
  UserRoundCog,
  HeartPulse,
  Menu,
  LogOut,
  MapPin,
} from "lucide-react";

import { useAuth } from "../../../context/AuthContext";

import medicalDoctor from "../../../assets/ui/medical-doctor.png";
import supervisorLogo from "../../../assets/ui/medical-supervisor-logo.png";


/* ============================================================
   MEDICAL SUPERVISOR NAVIGATION
   ============================================================ */

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
    key: "monitoring",
    label: "Weekly Monitoring",
    icon: ClipboardCheck,
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

  {
    key: "alerts",
    label: "Alerts",
    icon: Bell,
  },

  {
    key: "activity",
    label: "Activity Logs",
    icon: ClipboardCheck,
  },

  {
    key: "home-relief",
    label: "Home Relief",
    icon: HeartPulse,
    section: "MEDICAL CONTENT",
  },
];


/* ============================================================
   LAYOUT
   ============================================================ */

export default function MedicalSupervisorLayout({
  activeTab,
  onTabChange,
  onExit,
  alertCount,
  districtName,
  locationName,
  children,
}) {

  const { session } = useAuth();

  const [
    profileOpen,
    setProfileOpen,
  ] = useState(false);

  const [
    mobileOpen,
    setMobileOpen,
  ] = useState(false);

  const profileRef =
    useRef(null);


  /* ==========================================================
     CLOSE PROFILE WHEN CLICKING OUTSIDE
     ========================================================== */

  useEffect(() => {

    const close = (event) => {

      if (
        profileRef.current &&
        !profileRef.current.contains(
          event.target
        )
      ) {
        setProfileOpen(false);
      }

    };

    document.addEventListener(
      "mousedown",
      close
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        close
      );
    };

  }, []);


  /* ==========================================================
     USER INFORMATION
     ========================================================== */

  const fullName =
    session?.full_name ||
    "Dr. Monish";

  const role =
    "Medical Supervisor";


  /* ==========================================================
     NAVIGATION
     ========================================================== */

  const selectTab = (key) => {

    onTabChange(key);

    setMobileOpen(false);

  };


  /* ==========================================================
     RENDER
     ========================================================== */

  return (

    <div
      className="
        medical-shell
        min-h-screen
        bg-[#FBFCFB]
        text-[#101B38]
      "
    >

      {/* ======================================================
          HEADER
          ====================================================== */}

      <header
        className="
          fixed
          inset-x-0
          top-0
          z-50
          h-[76px]
          border-b
          border-[#E7EBE8]
          bg-white
        "
      >

        <div
          className="
            flex
            h-full
            items-center
          "
        >

          {/* ==================================================
              LOGO AREA
              ================================================== */}

          <div
            className="
              flex
              h-full
              w-[267px]
              shrink-0
              items-center
              gap-[12px]
              border-r
              border-[#E7EBE8]
              px-[20px]
            "
          >

            <img
              src={supervisorLogo}
              alt="Medical Supervisor"
              draggable="false"
              className="
                h-[47px]
                w-[43px]
                object-contain
              "
            />

            <div>

              <div
                className="
                  text-[16px]
                  font-bold
                  leading-none
                  tracking-[-0.025em]
                  text-[#17233D]
                "
              >
                MEDICAL SUPERVISOR
              </div>

              <div
                className="
                  mt-[6px]
                  text-[11px]
                  text-[#52627D]
                "
              >
                Surveillance System
              </div>

            </div>

          </div>


          {/* ==================================================
              HEADER RIGHT AREA
              ================================================== */}

          <div
            className="
              flex
              min-w-0
              flex-1
              items-center
              justify-between
              px-[29px]
            "
          >

            {/* MENU */}

            <button
              type="button"
              onClick={() =>
                setMobileOpen(
                  (value) =>
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
                rounded-[10px]
                text-[#17233D]
                transition
                hover:bg-[#F4F7F5]
              "
            >

              <Menu
                size={23}
                strokeWidth={1.8}
              />

            </button>


            {/* RIGHT CONTROLS */}

            <div
              className="
                flex
                items-center
                gap-[12px]
              "
            >

              {/* LOCATION */}

              <button
                type="button"
                className="
                  hidden
                  h-[44px]
                  min-w-[188px]
                  items-center
                  gap-[8px]
                  rounded-[7px]
                  border
                  border-[#E2E7E4]
                  bg-white
                  px-[14px]
                  text-[12px]
                  font-semibold
                  text-[#17233D]
                  md:flex
                "
              >

                <MapPin
                  size={17}
                  className="text-[#087A32]"
                />

                <span
                  className="
                    flex-1
                    truncate
                    text-left
                  "
                >
                  {locationName ||
                    `${districtName || "Kodagu"}`}
                </span>

                <ChevronDown
                  size={14}
                />

              </button>


              {/* DATE */}

              <button
                type="button"
                className="
                  hidden
                  h-[44px]
                  min-w-[200px]
                  items-center
                  gap-[8px]
                  rounded-[7px]
                  border
                  border-[#E2E7E4]
                  bg-white
                  px-[14px]
                  text-[12px]
                  font-semibold
                  text-[#17233D]
                  md:flex
                "
              >

                <CalendarDays
                  size={17}
                />

                <span
                  className="
                    flex-1
                    text-left
                  "
                >
                  26 August 2026
                </span>

                <ChevronDown
                  size={14}
                />

              </button>


              {/* ALERTS */}

              <button
                type="button"
                onClick={() =>
                  selectTab("alerts")
                }
                aria-label="Alerts"
                className="
                  relative
                  flex
                  h-[40px]
                  w-[40px]
                  items-center
                  justify-center
                  rounded-[10px]
                  transition
                  hover:bg-[#F4F7F5]
                "
              >

                <Bell
                  size={21}
                  strokeWidth={1.8}
                />

                {Number(
                  alertCount || 0
                ) > 0 && (

                  <span
                    className="
                      absolute
                      right-[-1px]
                      top-[-1px]
                      flex
                      h-[18px]
                      min-w-[18px]
                      items-center
                      justify-center
                      rounded-full
                      bg-[#E51D2A]
                      px-[4px]
                      text-[9px]
                      font-bold
                      text-white
                    "
                  >
                    {alertCount > 99
                      ? "99+"
                      : alertCount}
                  </span>

                )}

              </button>


              {/* PROFILE */}

              <div
                ref={profileRef}
                className="relative"
              >

                <button
                  type="button"
                  onClick={() =>
                    setProfileOpen(
                      (value) =>
                        !value
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-[8px]
                    rounded-[10px]
                    px-[6px]
                    py-[4px]
                    transition
                    hover:bg-[#F4F7F5]
                  "
                >

                  <img
                    src={medicalDoctor}
                    alt="Medical Supervisor"
                    draggable="false"
                    className="
                      h-[40px]
                      w-[40px]
                      rounded-full
                      bg-[#EAF6EE]
                      object-cover
                    "
                  />

                  <div
                    className="
                      hidden
                      min-w-[104px]
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
                      {fullName}
                    </div>

                    <div
                      className="
                        mt-[3px]
                        text-[10px]
                        text-[#718096]
                      "
                    >
                      {role}
                    </div>

                  </div>

                  <ChevronDown
                    size={15}
                    className={
                      profileOpen
                        ? "rotate-180 transition-transform"
                        : "transition-transform"
                    }
                  />

                </button>


                {/* PROFILE DROPDOWN */}

                {profileOpen && (

                  <div
                    className="
                      absolute
                      right-0
                      top-[52px]
                      w-[270px]
                      overflow-hidden
                      rounded-[15px]
                      border
                      border-[#E2E8E4]
                      bg-white
                      shadow-[0_18px_45px_rgba(16,42,67,.14)]
                    "
                  >

                    {/* PROFILE HEADER */}

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
                          src={medicalDoctor}
                          alt="Medical Supervisor"
                          draggable="false"
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
                            "
                          >
                            {fullName}
                          </div>

                          <div
                            className="
                              mt-[2px]
                              text-[10px]
                              text-[#718096]
                            "
                          >
                            {role}
                          </div>

                        </div>

                      </div>

                    </div>


                    {/* DETAILS */}

                    <div className="p-[12px]">

                      <div
                        className="
                          flex
                          items-center
                          gap-[12px]
                          rounded-[10px]
                          p-[10px]
                        "
                      >

                        <UserRoundCog
                          size={17}
                          className="text-[#087A32]"
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
                            "
                          >
                            {role}
                          </div>

                        </div>

                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-[12px]
                          rounded-[10px]
                          p-[10px]
                        "
                      >

                        <MapPin
                          size={17}
                          className="text-[#315C88]"
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
                            "
                          >
                            {districtName ||
                              "Kodagu"}
                          </div>

                        </div>

                      </div>


                      <div
                        className="
                          flex
                          items-center
                          gap-[12px]
                          rounded-[10px]
                          p-[10px]
                        "
                      >

                        <Bell
                          size={17}
                          className="text-[#315C88]"
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
                            "
                          >
                            {alertCount || 0} active
                          </div>

                        </div>

                      </div>

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
                        onClick={onExit}
                        className="
                          flex
                          w-full
                          items-center
                          gap-[8px]
                          rounded-[10px]
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

        </div>

      </header>


      {/* ======================================================
          SIDEBAR
          ====================================================== */}

      <aside
        className={`
          fixed
          bottom-0
          left-0
          top-[76px]
          z-40
          w-[267px]
          border-r
          border-[#E5EAE7]
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

        <div
          className="
            flex
            h-full
            flex-col
            px-[15px]
            py-[18px]
          "
        >

          <nav
            className="
              flex-1
              overflow-y-auto
              pr-[2px]
            "
          >

            {MEDICAL_NAV.map(
              (item) => {

                const Icon =
                  item.icon;

                const active =
                  activeTab ===
                  item.key;

                return (

                  <div
                    key={item.key}
                  >

                    {/* SECTION TITLE */}

                    {item.section && (

                      <div
                        className={`
                          px-[10px]
                          pb-[10px]
                          text-[11px]
                          font-bold
                          uppercase
                          tracking-[.075em]
                          text-[#087A32]
                          ${
                            item.section ===
                            "OVERVIEW"
                              ? "pt-[13px]"
                              : "pt-[22px]"
                          }
                        `}
                      >
                        {item.section}
                      </div>

                    )}


                    {/* NAV BUTTON */}

                    <button
                      type="button"
                      onClick={() =>
                        selectTab(
                          item.key
                        )
                      }
                      className={`
                        flex
                        h-[54px]
                        w-full
                        items-center
                        gap-[17px]
                        rounded-[9px]
                        px-[14px]
                        text-left
                        transition
                        ${
                          active
                            ? "bg-[#E8F4EA] text-[#087A32]"
                            : "text-[#17233D] hover:bg-[#F6F9F7]"
                        }
                      `}
                    >

                      <Icon
                        size={20}
                        strokeWidth={1.7}
                      />

                      <span
                        className="
                          text-[13px]
                          font-medium
                        "
                      >
                        {item.label}
                      </span>


                      {/* ALERT COUNT */}

                      {item.key ===
                        "alerts" &&
                        Number(
                          alertCount || 0
                        ) > 0 && (

                          <span
                            className="
                              ml-auto
                              rounded-[6px]
                              bg-[#E8F4EA]
                              px-[9px]
                              py-[4px]
                              text-[10px]
                              font-bold
                              text-[#087A32]
                            "
                          >
                            {alertCount}
                          </span>

                        )}

                    </button>

                  </div>

                );

              }
            )}

          </nav>


          {/* LOGOUT */}

          <div
            className="
              pt-[14px]
            "
          >

            <button
              type="button"
              onClick={onExit}
              className="
                flex
                h-[47px]
                w-[130px]
                items-center
                gap-[10px]
                rounded-[7px]
                border
                border-[#E0E5E2]
                bg-white
                px-[20px]
                text-[13px]
                font-medium
                text-[#17233D]
                transition
                hover:bg-[#F7F9F8]
              "
            >

              <LogOut
                size={18}
                strokeWidth={1.8}
              />

              Logout

            </button>

          </div>

        </div>

      </aside>


      {/* MOBILE OVERLAY */}

      {mobileOpen && (

        <button
          type="button"
          aria-label="Close navigation"
          onClick={() =>
            setMobileOpen(false)
          }
          className="
            fixed
            inset-0
            z-30
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
          pt-[76px]
          lg:pl-[267px]
        "
      >

        <div
          className="
            w-full
            px-[30px]
            py-[27px]
          "
        >
          {children}
        </div>

      </main>

    </div>

  );
}