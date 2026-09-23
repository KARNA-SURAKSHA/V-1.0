import {
  Menu,
  X,
  ShieldPlus,
  Home,
  UsersRound,
  UserRoundCog,
  ShieldCheck,
  FileText,
  CalendarDays,
  Map,
  Activity,
  MapPin,
  Gauge,
  Bell,
  Clock3,
} from "lucide-react";

import {
  useState,
} from "react";

import "./AdminSidebar.css";


/* ============================================================
   ICON MAP
============================================================ */

const iconMap = {

  dashboard:
    Home,

  users:
    UsersRound,

  "user-management":
    UsersRound,

  userManagement:
    UsersRound,

  agents:
    UserRoundCog,

  "agent-management":
    UserRoundCog,

  agentManagement:
    UserRoundCog,

  supervisors:
    ShieldCheck,

  "medical-supervisor-management":
    ShieldCheck,

  medicalSupervisorManagement:
    ShieldCheck,

  roles:
    ShieldCheck,

  permissions:
    ShieldCheck,

  "roles-permissions":
    ShieldCheck,

  reports:
    FileText,

  "report-management":
    FileText,

  monitoring:
    CalendarDays,

  "weekly-monitoring":
    CalendarDays,

  "risk-map":
    Map,

  risk:
    Map,

  analytics:
    Activity,

  location:
    MapPin,

  "location-management":
    MapPin,

  health:
    Gauge,

  "system-health":
    Gauge,

  notifications:
    Bell,

  activity:
    Clock3,

  "activity-logs":
    Clock3,

};


/* ============================================================
   GET ICON
============================================================ */

function getIcon(
  key,
  IconFromNav
) {

  return (
    iconMap[key] ||
    IconFromNav ||
    Activity
  );

}


/* ============================================================
   ADMIN SIDEBAR
============================================================ */

export default function AdminSidebar({
  nav = [],
  activeKey,
  onNavigate,
  onExit,
}) {

  const [
    open,
    setOpen,
  ] =
    useState(false);


  /* ==========================================================
     NAVIGATION HANDLER
  ========================================================== */

  const go =
    (key) => {

      if (
        typeof onNavigate ===
        "function"
      ) {

        onNavigate(key);

      }

      setOpen(false);

    };


  return (

    <>

      {/* ======================================================
          MOBILE MENU BUTTON
      ====================================================== */}

      <button
        type="button"
        onClick={() =>
          setOpen(true)
        }
        aria-label="Open admin navigation"
        className="admin-sidebar-v2-mobile-menu"
      >

        <Menu
          size={21}
          strokeWidth={1.8}
        />

      </button>


      {/* ======================================================
          MOBILE OVERLAY
      ====================================================== */}

      {open && (

        <button
          type="button"
          aria-label="Close admin navigation"
          onClick={() =>
            setOpen(false)
          }
          className="admin-sidebar-v2-overlay"
        />

      )}


      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <aside
        className={`
          admin-sidebar-v2
          ${open
            ? "admin-sidebar-v2-open"
            : ""
          }
        `}
      >

        {/* ====================================================
            BRAND
        ==================================================== */}

        <div className="admin-sidebar-v2-brand">

          <div className="admin-sidebar-v2-brand-mark">

            <ShieldPlus
              size={34}
              strokeWidth={2.05}
            />

          </div>


          <div className="admin-sidebar-v2-brand-text">

            <strong>
              HYPERLOCAL
            </strong>

            <span>
              DISEASE SURVEILLANCE
            </span>

          </div>


          {/* MOBILE CLOSE */}

          <button
            type="button"
            className="admin-sidebar-v2-close"
            onClick={() =>
              setOpen(false)
            }
            aria-label="Close admin navigation"
          >

            <X
              size={19}
              strokeWidth={1.8}
            />

          </button>

        </div>


        {/* ====================================================
            NAVIGATION
        ==================================================== */}

        <nav
          className="admin-sidebar-v2-nav"
          aria-label="Admin navigation"
        >

          <div className="admin-sidebar-v2-nav-list">

            {nav.map(
              (group, groupIndex) => {

                const items =
                  group.items ||
                  [group];


                return (

                  <div
                    key={
                      group.section ||
                      group.key ||
                      groupIndex
                    }
                    className={`
                      admin-sidebar-v2-group
                      ${groupIndex > 0
                        ? "admin-sidebar-v2-group-spaced"
                        : ""
                      }
                    `}
                  >

                    {/* SECTION TITLE
                        Hidden for current flat
                        admin navigation.
                    */}

                    {group.section && (

                      <div className="admin-sidebar-v2-section-title">

                        {group.section}

                      </div>

                    )}


                    <div className="admin-sidebar-v2-items">

                      {items.map(
                        (item) => {

                          const Icon =
                            getIcon(
                              item.key,
                              item.icon
                            );


                          const isActive =
                            activeKey ===
                            item.key;


                          return (

                            <button
                              key={
                                item.key
                              }
                              type="button"
                              onClick={() =>
                                go(
                                  item.key
                                )
                              }
                              className={`
                                admin-sidebar-v2-item
                                ${isActive
                                  ? "active"
                                  : ""
                                }
                              `}
                            >

                              <span className="admin-sidebar-v2-icon">

                                <Icon
                                  size={19}
                                  strokeWidth={
                                    isActive
                                      ? 2
                                      : 1.7
                                  }
                                />

                              </span>


                              <span className="admin-sidebar-v2-label">

                                {
                                  item.label
                                }

                              </span>


                              {item.key ===
                                "notifications" && (

                                  <span className="admin-sidebar-v2-badge">

                                    7

                                  </span>

                                )}

                            </button>

                          );

                        }
                      )}

                    </div>

                  </div>

                );

              }
            )}

          </div>

        </nav>


        {/* ====================================================
            SIDEBAR FOOTER
        ====================================================*/}
        {/*
        <div className="admin-sidebar-v2-footer">

          <button
            type="button"
            className="admin-sidebar-v2-logout"
            onClick={onExit}
          >

            <LogOut
              size={18}
              strokeWidth={1.8}
            />

            <span>
              Logout
            </span>

          </button>

        </div>
        */}
      </aside>

    </>

  );

}