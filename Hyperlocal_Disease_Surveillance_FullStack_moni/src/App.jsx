import {
  useState,
  useEffect,
} from "react";

import {
  AuthProvider,
  useAuth,
} from "./context/AuthContext";

import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import PlatformCapabilities from "./components/PlatformCapabilities";
import Footer from "./components/Footer";

import Login from "./pages/Login";

import UserEntry from "./pages/user/UserEntry";
import UserPortal from "./pages/user/UserPortal";

import AgentPortal from "./pages/agent/AgentPortal";
import AdminPortal from "./pages/admin/AdminPortal";
import MedicalSupervisorPortal from "./pages/medical/MedicalSupervisorPortal";


function AppContent() {

  const { session, logout } = useAuth();

  const getInitialView = () => {
    if (session?.role) {
      return session.role;
    }

    const storedUser = sessionStorage.getItem(
      "kt_user_default_location"
    );

    if (storedUser) {
      return "user";
    }

    return "landing";
  };

  const [view, setView] =
    useState(getInitialView);

  const [pendingRole, setPendingRole] =
    useState(null);

  const [userInfo, setUserInfo] =
    useState(() => {
      const storedLocation = sessionStorage.getItem(
        "kt_user_default_location"
      );

      if (storedLocation) {
        try {
          return {
            username: null,
            defaultLocation: JSON.parse(storedLocation),
          };
        } catch {
          return null;
        }
      }

      return null;
    });


  useEffect(() => {
    if (!session && view !== "landing" && view !== "login" && view !== "user-entry" && view !== "user") {
      setView("landing");
    }
  }, [session]);


  const goToLogin = (role) => {

    if (role === "user") {
      setView("user-entry");
      return;
    }

    setPendingRole(role);
    setView("login");
  };


  const handleUserEntry = ({
    username,
    defaultLocation,
  }) => {

    const userData = {
      username,
      defaultLocation,
    };

    setUserInfo(userData);

    sessionStorage.setItem(
      "kt_user_default_location",
      JSON.stringify(
        defaultLocation
      )
    );

    setView("user");
  };


  const handleLoginSuccess = (
    session
  ) => {

    setView(session.role);
  };


  // ==========================================================
  // HOME / EXIT — now ALSO logs out of Firebase, so a stale
  // session can never survive a reload after exiting a portal.
  // ==========================================================

  const goHome = () => {

    logout();

    setView("landing");

    setPendingRole(null);

    setUserInfo(null);

    sessionStorage.removeItem(
      "kt_user_default_location"
    );
  };


  if (view === "user-entry") {

    return (
      <UserEntry
        onEnter={handleUserEntry}
        onBack={goHome}
      />
    );
  }


  if (view === "login") {

    return (
      <Login
        role={pendingRole}
        onSuccess={handleLoginSuccess}
        onBack={goHome}
      />
    );
  }


  if (
    view === "user" &&
    userInfo
  ) {

    return (
      <UserPortal
        username={
          userInfo.username
        }
        defaultLocation={
          userInfo.defaultLocation
        }
        onExit={goHome}
      />
    );
  }


  if (view === "agent") {

    return (
      <AgentPortal
        onExit={goHome}
      />
    );
  }


  if (view === "medical_supervisor") {

    return (
      <MedicalSupervisorPortal
        onExit={goHome}
      />
    );
  }


  if (view === "admin") {

    return (
      <AdminPortal
        onExit={goHome}
      />
    );
  }


  return (
    <>
      <Navbar
        onSelectRole={goToLogin}
      />

      <Hero
        onSelectRole={goToLogin}
      />

      <PlatformCapabilities />

      <Footer />
    </>
  );
}


function App() {

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}


export default App;