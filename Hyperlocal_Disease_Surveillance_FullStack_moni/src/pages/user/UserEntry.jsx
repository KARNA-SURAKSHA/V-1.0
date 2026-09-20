import {
  useRef,
  useState,
} from "react";

import {
  Eye,
  User,
} from "lucide-react";

import LocationSelector from "../../components/LocationSelector";

import {
  AssistantIcon,
  BrandShield,
  CalendarIcon,
  HomeReliefIcon,
  MapPinIcon,
  ShieldBellIcon,
} from "./UserEntryIcons";

import landscapeImage from "../../assets/ui/user-entry-landscape.png";

import "./UserEntry.css";


// ============================================================
// FEATURE HIGHLIGHTS (row of five icons under the headline)
// ============================================================

const FEATURES = [
  {
    key: "weekly",
    tone: "green",
    Icon: CalendarIcon,
    label: ["Weekly", "Health Updates"],
  },
  {
    key: "map",
    tone: "mint",
    Icon: MapPinIcon,
    label: ["Community", "Risk Map"],
  },
  {
    key: "alerts",
    tone: "violet",
    Icon: ShieldBellIcon,
    label: ["Precautions &", "Alerts"],
  },
  {
    key: "assistant",
    tone: "sky",
    Icon: AssistantIcon,
    label: ["Medical", "Assistant"],
  },
  {
    key: "relief",
    tone: "leaf",
    Icon: HomeReliefIcon,
    label: ["Home Relief"],
    note: "(Quick Support)",
  },
];


// ============================================================
// USER ENTRY (User Portal login page)
// ============================================================

export default function UserEntry({
  onEnter,
  onBack,
}) {

  const [username, setUsername] =
    useState("");

  const [location, setLocation] =
    useState(null);

  const [error, setError] =
    useState("");

  const nameRef = useRef(null);


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = (event) => {

    event.preventDefault();

    const cleanName =
      username.trim();


    if (!cleanName) {

      setError(
        "Please enter your name."
      );

      nameRef.current?.focus();

      return;
    }


    if (!location?.talukId) {

      setError(
        "Please select your State, District, and Taluk."
      );

      return;
    }


    setError("");

    onEnter({
      username: cleanName,
      defaultLocation: location,
    });
  };


  // Any edit clears a stale error message
  const handleLocationChange = (next) => {

    setLocation(next);

    if (error) {
      setError("");
    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="ku-page">

      {/* ====================================================
          BACKGROUND LANDSCAPE
      ==================================================== */}

      <img
        className="ku-landscape"
        src={landscapeImage}
        alt=""
        aria-hidden="true"
        draggable="false"
      />


      <div className="ku-shell">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="ku-header">

          <button
            type="button"
            className="ku-brand"
            onClick={onBack}
            aria-label="Karna Suraksha - back to home"
          >

            <BrandShield className="ku-brand-shield" />

            <span className="ku-brand-text">

              <span className="ku-brand-name">
                Karna Suraksha
              </span>

              <span className="ku-brand-sub">
                Disease Surveillance Platform
              </span>

            </span>

          </button>


          <p className="ku-tagline">

            <span>Safer Communities</span>

            <i aria-hidden="true" />

            <span>Healthier Tomorrow</span>

          </p>

        </header>


        {/* ==================================================
            MAIN
        ================================================== */}

        <main className="ku-main">


          {/* ----------------------------------------------
              LEFT: MESSAGE + FEATURES
          ---------------------------------------------- */}

          <section className="ku-hero">

            <h1 className="ku-headline">
              <span>Stay Informed.</span>
              <span>Stay Protected.</span>
              <span>Stay Healthy.</span>
            </h1>


            <p className="ku-lead">
              Access local health updates,
              community risk information,
              precautions and alerts — all in one place.
            </p>


            <ul className="ku-features">

              {FEATURES.map(
                ({
                  key,
                  tone,
                  Icon,
                  label,
                  note,
                }) => (

                  <li
                    key={key}
                    className="ku-feature"
                  >

                    <span
                      className={`ku-feature-icon ku-tone-${tone}`}
                    >
                      <Icon />
                    </span>

                    <span className="ku-feature-label">

                      {label.map((line) => (
                        <span key={line}>
                          {line}
                        </span>
                      ))}

                      {note && (
                        <span className="ku-feature-note">
                          {note}
                        </span>
                      )}

                    </span>

                  </li>

                )
              )}

            </ul>

          </section>


          {/* ----------------------------------------------
              RIGHT: USER PORTAL CARD
          ---------------------------------------------- */}

          <section
            className="ku-card"
            aria-labelledby="ku-card-title"
          >

            <div
              className="ku-avatar"
              aria-hidden="true"
            >
              <User
                size={40}
                strokeWidth={1.9}
              />
            </div>


            <h2 id="ku-card-title">
              User Portal
            </h2>


            <p className="ku-card-sub">
              Enter your name and select your
              default location to view disease
              surveillance data.
            </p>


            <form
              className="ku-form"
              onSubmit={handleSubmit}
              noValidate
            >

              {/* NAME */}

              <div className="ku-field">

                <label htmlFor="ku-name">
                  Your Name
                </label>

                <div className="ku-input">

                  <User
                    className="ku-input-icon"
                    size={25}
                    strokeWidth={1.6}
                    aria-hidden="true"
                  />

                  <input
                    id="ku-name"
                    ref={nameRef}
                    type="text"
                    value={username}
                    onChange={(event) => {

                      setUsername(
                        event.target.value
                      );

                      if (error) {
                        setError("");
                      }

                    }}
                    placeholder="e.g. Ramesh Kumar"
                    autoComplete="name"
                    maxLength={60}
                  />

                </div>

              </div>


              {/* LOCATION */}

              <div className="ku-field ku-field-location">

                <span className="ku-field-title">
                  Your Default Location
                </span>

                <LocationSelector
                  variant="portal"
                  onChange={handleLocationChange}
                />

              </div>


              {/* ERROR */}

              {error && (

                <p
                  className="ku-error"
                  role="alert"
                >
                  {error}
                </p>

              )}


              {/* SUBMIT */}

              <button
                type="submit"
                className="ku-submit"
              >

                <Eye
                  size={26}
                  strokeWidth={1.8}
                  aria-hidden="true"
                />

                View Disease Surveillance

              </button>

            </form>

          </section>

        </main>

      </div>

    </div>
  );
}