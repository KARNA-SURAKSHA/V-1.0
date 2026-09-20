import { useState } from "react";

import {
  ArrowLeft,
  ClipboardList,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  LogIn,
  ShieldCheck,
  ShieldPlus,
  Stethoscope,
  User,
  UsersRound,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";

import "./AdminLogin.css";
import "./AgentLogin.css";

import agentLoginImage from "../assets/ui/agent-login-left-reference.png";


// ============================================================
// ROLE CONFIGURATION
// ============================================================

const ROLE_META = {
  agent: {
    label: "Agent Portal",
    icon: ClipboardList,
    hint: "Submit your taluk's weekly disease report.",
  },

  medical_supervisor: {
    label: "Medical Supervisor Portal",
    icon: Stethoscope,
    hint: "Verify disease reports and review agent issues.",
  },

  admin: {
    label: "Admin Portal",
    icon: ShieldCheck,
    hint: "Manage agents, reports, and predictions.",
  },
};


// ============================================================
// MAIN LOGIN COMPONENT
// ============================================================

export default function Login({
  role,
  onSuccess,
  onBack,
}) {

  /*
   * Admin remains completely separate.
   *
   * Agent has its own dedicated login page.
   *
   * Medical Supervisor continues using StandardLogin.
   */

  if (role === "admin") {

    return (
      <AdminLogin
        onSuccess={onSuccess}
        onBack={onBack}
      />
    );

  }


  if (role === "agent") {

    return (
      <AgentLogin
        onSuccess={onSuccess}
        onBack={onBack}
      />
    );

  }


  return (
    <StandardLogin
      role={role}
      onSuccess={onSuccess}
      onBack={onBack}
    />
  );
}


// ============================================================
// AGENT LOGIN
// ============================================================

function AgentLogin({
  onSuccess,
  onBack,
}) {

  const { login } = useAuth();

  const [
    username,
    setUsername,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    if (loading) {
      return;
    }

    setError("");

    const cleanUsername =
      username.trim();


    if (!cleanUsername) {

      setError(
        "Please enter your username."
      );

      return;
    }


    if (!password) {

      setError(
        "Please enter your password."
      );

      return;
    }


    setLoading(true);


    try {

      /*
       * IMPORTANT:
       *
       * Existing authentication flow is unchanged.
       */

      const session =
        await login(
          cleanUsername,
          password,
          "agent"
        );


      onSuccess(session);

    } catch (err) {

      setError(
        err?.message ||
        "Unable to log in. Please check your credentials and try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="agent-login-page">

      {/* ======================================================
          LEFT REFERENCE ARTWORK
      ====================================================== */}

      <div
        className="agent-login-background"
        aria-hidden="true"
      >

        <img
          src={agentLoginImage}
          alt=""
          className="agent-login-background-image"
        />

      </div>


      {/* ======================================================
          SOFT TRANSITION INTO LOGIN AREA
      ====================================================== */}

      <div
        className="agent-login-background-fade"
        aria-hidden="true"
      />


      {/* ======================================================
          TOP RIGHT DECORATION
      ====================================================== */}

      <div
        className="agent-login-top-shape"
        aria-hidden="true"
      >

        <div className="agent-login-dots">

          {Array.from({
            length: 15,
          }).map((_, index) => (

            <span
              key={index}
            />

          ))}

        </div>

      </div>


      {/* ======================================================
          BOTTOM RIGHT DECORATION
      ====================================================== */}

      <div
        className="agent-login-bottom-shape"
        aria-hidden="true"
      />


      {/* ======================================================
          LOGIN CONTENT
      ====================================================== */}

      <main className="agent-login-content">

        <section className="agent-login-card">


          {/* ==================================================
              AGENT ICON
          ================================================== */}

          <div
            className="agent-login-icon"
            aria-hidden="true"
          >

            <UsersRound
              size={39}
              strokeWidth={2}
            />

          </div>


          {/* ==================================================
              HEADING
          ================================================== */}

          <div className="agent-login-heading">

            <h1>
              Agent Portal
            </h1>

            <p>
              Submit your taluk's weekly disease report.
            </p>

          </div>


          {/* ==================================================
              LOGIN FORM
          ================================================== */}

          <form
            className="agent-login-form"
            onSubmit={handleSubmit}
            noValidate
          >


            {/* =================================================
                USERNAME
            ================================================= */}

            <div className="agent-login-field">

              <label htmlFor="agent-username">
                Username
              </label>


              <div className="agent-login-input-wrapper">

                <User
                  className="agent-login-input-icon"
                  size={22}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />


                <input
                  id="agent-username"
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
                  placeholder="agent_virajpet"
                  autoComplete="username"
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* =================================================
                PASSWORD
            ================================================= */}

            <div className="agent-login-field">

              <label htmlFor="agent-password">
                Password
              </label>


              <div className="agent-login-input-wrapper">

                <LockKeyhole
                  className="agent-login-input-icon"
                  size={22}
                  strokeWidth={1.9}
                  aria-hidden="true"
                />


                <input
                  id="agent-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) => {

                    setPassword(
                      event.target.value
                    );

                    if (error) {
                      setError("");
                    }

                  }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />


                <button
                  type="button"
                  className="agent-login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  disabled={loading}
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                >

                  {showPassword ? (

                    <EyeOff
                      size={20}
                      strokeWidth={1.9}
                    />

                  ) : (

                    <Eye
                      size={20}
                      strokeWidth={1.9}
                    />

                  )}

                </button>

              </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div
                className="agent-login-error"
                role="alert"
              >

                {error}

              </div>

            )}


            {/* =================================================
                LOGIN BUTTON
            ================================================= */}

            <button
              type="submit"
              className="agent-login-submit"
              disabled={loading}
            >

              {loading ? (

                <>

                  <Loader2
                    size={21}
                    className="agent-login-spinner"
                    aria-hidden="true"
                  />

                  <span>
                    Logging in...
                  </span>

                </>

              ) : (

                <>

                  <LogIn
                    size={22}
                    strokeWidth={2.4}
                    aria-hidden="true"
                  />

                  <span>
                    Log in
                  </span>

                </>

              )}

            </button>

          </form>


          {/* ==================================================
              DIVIDER
          ================================================== */}

          <div className="agent-login-divider" />


          {/* ==================================================
              DEMO CREDENTIALS
          ================================================== */}

          <div className="agent-login-demo">

            <p>
              Demo credentials (after running the backend seed script):
            </p>

            <strong>
              agent_virajpet / agent123
            </strong>

            <span>
              (or any seeded agent username)
            </span>

          </div>


          {/* ==================================================
              BACK TO HOME
          ================================================== */}

          <button
            type="button"
            className="agent-login-back"
            onClick={onBack}
            disabled={loading}
          >

            <ArrowLeft
              size={16}
              strokeWidth={1.9}
              aria-hidden="true"
            />

            <span>
              Back to home
            </span>

          </button>


        </section>

      </main>

    </div>
  );
}


// ============================================================
// ADMIN LOGIN
//
// EXISTING ADMIN LOGIN
// ============================================================

function AdminLogin({
  onSuccess,
  onBack,
}) {

  const { login } = useAuth();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    username,
    setUsername,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    showPassword,
    setShowPassword,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();


    if (loading) {
      return;
    }


    setError("");


    const cleanUsername =
      username.trim();


    if (!cleanUsername) {

      setError(
        "Please enter your username."
      );

      return;
    }


    if (!password) {

      setError(
        "Please enter your password."
      );

      return;
    }


    setLoading(true);


    try {

      const session =
        await login(
          cleanUsername,
          password,
          "admin"
        );


      onSuccess(session);

    } catch (err) {

      setError(
        err?.message ||
        "Unable to log in. Please check your credentials and try again."
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="admin-login-page">


      {/* ======================================================
          LEFT SIDE
      ====================================================== */}

      <section
        className="admin-login-hero"
        aria-label="Karna Suraksha administration"
      >

        <div className="admin-login-hero-image" />

      </section>


      {/* ======================================================
          RIGHT SIDE
      ====================================================== */}

      <section className="admin-login-panel">


        {/* Decorative shapes */}

        <div
          className="admin-login-decoration admin-login-decoration-top"
          aria-hidden="true"
        />

        <div
          className="admin-login-decoration admin-login-decoration-bottom"
          aria-hidden="true"
        />


        {/* ====================================================
            CARD
        ==================================================== */}

        <div className="admin-login-card">


          {/* SHIELD */}

          <div className="admin-login-icon">

            <ShieldPlus
              size={44}
              strokeWidth={2.15}
            />

          </div>


          {/* TITLE */}

          <div className="admin-login-heading">

            <h1>
              Admin Portal
            </h1>

            <p>
              Sign in to access the admin dashboard and
              <br className="admin-login-desktop-break" />
              manage the surveillance system.
            </p>

          </div>


          {/* ==================================================
              FORM
          ================================================== */}

          <form
            className="admin-login-form"
            onSubmit={handleSubmit}
          >


            {/* USERNAME */}

            <div className="admin-login-field">

              <label htmlFor="admin-username">
                Username
              </label>

              <div className="admin-login-input-wrapper">

                <User
                  className="admin-login-input-icon"
                  size={23}
                  strokeWidth={2}
                />

                <input
                  id="admin-username"
                  type="text"
                  value={username}
                  onChange={(event) =>
                    setUsername(
                      event.target.value
                    )
                  }
                  placeholder="e.g. admin123"
                  autoComplete="username"
                  disabled={loading}
                  required
                />

              </div>

            </div>


            {/* PASSWORD */}

            <div className="admin-login-field">

              <label htmlFor="admin-password">
                Password
              </label>

              <div className="admin-login-input-wrapper">

                <LockKeyhole
                  className="admin-login-input-icon"
                  size={23}
                  strokeWidth={2}
                />

                <input
                  id="admin-password"
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  value={password}
                  onChange={(event) =>
                    setPassword(
                      event.target.value
                    )
                  }
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />


                <button
                  type="button"
                  className="admin-login-password-toggle"
                  onClick={() =>
                    setShowPassword(
                      (previous) =>
                        !previous
                    )
                  }
                  aria-label={
                    showPassword
                      ? "Hide password"
                      : "Show password"
                  }
                  disabled={loading}
                >

                  {showPassword ? (

                    <EyeOff
                      size={21}
                      strokeWidth={2}
                    />

                  ) : (

                    <Eye
                      size={21}
                      strokeWidth={2}
                    />

                  )}

                </button>

              </div>

            </div>


            {/* ERROR */}

            {error && (

              <div
                className="admin-login-error"
                role="alert"
              >

                {error}

              </div>

            )}


            {/* LOGIN BUTTON */}

            <button
              type="submit"
              className="admin-login-submit"
              disabled={loading}
            >

              {loading ? (

                <>

                  <Loader2
                    size={21}
                    className="admin-login-spinner"
                  />

                  <span>
                    Logging in...
                  </span>

                </>

              ) : (

                <>

                  <LogIn
                    size={22}
                    strokeWidth={2.4}
                  />

                  <span>
                    Log in
                  </span>

                </>

              )}

            </button>

          </form>


          {/* DIVIDER */}

          <div className="admin-login-divider" />


          {/* DEMO */}

          <div className="admin-login-demo">

            <p>
              Demo credentials (after running the backend
              seed script):
            </p>

            <strong>
              admin / admin123
            </strong>

          </div>


          {/* BACK */}

          <button
            type="button"
            className="admin-login-back"
            onClick={onBack}
            disabled={loading}
          >

            <ArrowLeft
              size={16}
            />

            <span>
              Back to home
            </span>

          </button>

        </div>

      </section>

    </div>
  );
}


// ============================================================
// STANDARD LOGIN
//
// MEDICAL SUPERVISOR
// ============================================================

function StandardLogin({
  role,
  onSuccess,
  onBack,
}) {

  const { login } = useAuth();


  const [
    username,
    setUsername,
  ] = useState("");


  const [
    password,
    setPassword,
  ] = useState("");


  const [
    error,
    setError,
  ] = useState("");


  const [
    loading,
    setLoading,
  ] = useState(false);


  const meta =
    ROLE_META[role];


  // ==========================================================
  // INVALID ROLE
  // ==========================================================

  if (!meta) {

    return (

      <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center px-6">

        <div className="w-full max-w-[440px]">

          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-[14px] text-[#445064] hover:text-[#0B6D2E] mb-6 transition-colors"
          >

            <ArrowLeft size={16} />

            Back to home

          </button>


          <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm p-8">

            <h2 className="text-[24px] font-semibold text-[#1F3144]">
              Invalid Portal
            </h2>

            <p className="text-[14px] text-[#445064] mt-2">
              The selected portal is not configured correctly.
            </p>

          </div>

        </div>

      </div>
    );
  }


  const Icon =
    meta.icon;


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (event) => {

    event.preventDefault();

    setError("");
    setLoading(true);


    try {

      const session =
        await login(
          username,
          password,
          role
        );


      onSuccess(session);

    } catch (err) {

      setError(
        err?.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="min-h-screen bg-[#FCFAF6] flex items-center justify-center px-6">

      <div className="w-full max-w-[440px]">


        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-[14px] text-[#445064] hover:text-[#0B6D2E] mb-6 transition-colors"
        >

          <ArrowLeft size={16} />

          Back to home

        </button>


        <div className="bg-white rounded-2xl border border-[#E8E2D8] shadow-sm p-8">


          <div className="w-14 h-14 rounded-xl bg-[#0B7A33] flex items-center justify-center mb-5">

            <Icon
              size={28}
              className="text-white"
            />

          </div>


          <h2 className="text-[24px] font-semibold text-[#1F3144]">

            {meta.label}

          </h2>


          <p className="text-[14px] text-[#445064] mt-1 mb-6">

            {meta.hint}

          </p>


          <form
            onSubmit={handleSubmit}
            className="space-y-4"
          >


            <div>

              <label className="block text-[13px] font-medium text-[#445064] mb-1">
                Username
              </label>

              <input
                type="text"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                required
                className="w-full rounded-lg border border-[#E8E2D8] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/30"
                placeholder="e.g. medical_supervisor"
              />

            </div>


            <div>

              <label className="block text-[13px] font-medium text-[#445064] mb-1">
                Password
              </label>

              <input
                type="password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                required
                className="w-full rounded-lg border border-[#E8E2D8] px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#0B7A33]/30"
                placeholder="••••••••"
              />

            </div>


            {error && (

              <p className="text-[13px] text-[#C62828] bg-[#FBEAEA] rounded-lg px-3 py-2">

                {error}

              </p>

            )}


            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-[#07892F] to-[#049437] hover:from-[#067C2B] hover:to-[#038A31] text-white font-semibold py-3 transition-all disabled:opacity-60"
            >

              {loading
                ? "Logging in..."
                : "Log in"}

            </button>

          </form>


          <div className="mt-6 pt-5 border-t border-[#E8E2D8] text-[12.5px] text-[#7A8598] leading-relaxed">

            Demo credentials (after running the backend seed script):{" "}


            {role === "medical_supervisor" && (
              <>

                <b>
                  medical_supervisor
                </b>{" "}

                / supervisor123

              </>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}