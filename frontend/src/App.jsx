import React, { useEffect, useState } from "react";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Workspace from "./pages/Workspace";

function App() {
  const [page, setPage] = useState(window.location.pathname);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [user, setUser] = useState(null);

  const checkAuth = async () => {
    try {
      const response = await fetch("http://localhost:5000/auth/me", {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        return;
      }

      const data = await response.json();

      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      setUser(null);
    } finally {
      setCheckingAuth(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setPage(window.location.pathname);
      checkAuth();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setPage(path);
  };

  if (checkingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0d0f] text-zinc-600">
        <div className="text-xs tracking-[0.2em]">
          CHAOS AI
        </div>
      </div>
    );
  }

  if (page === "/workspace") {
    if (!user) {
      window.history.replaceState({}, "", "/login");
      setPage("/login");

      return null;
    }

    return <Workspace user={user} />;
  }

  if (page === "/login") {
    if (user) {
      window.history.replaceState({}, "", "/workspace");
      setPage("/workspace");

      return null;
    }

    return <Login />;
  }

  return (
    <Landing
      onStart={() => navigate("/login")}
    />
  );
}

export default App;