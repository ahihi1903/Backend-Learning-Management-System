import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, hasAccessToken, setAccessToken } from "../api/client.js";

const AuthContext = createContext(null);

function normalizeUser(user) {
  return user ? { ...user, id: user.id || user._id } : null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      if (!hasAccessToken()) {
        try {
          const refreshed = await api("/auth/refresh", {
            method: "POST",
            body: {},
          });
          setAccessToken(refreshed.accessToken);
        } catch {
          if (active) setLoading(false);
          return;
        }
      }

      try {
        const profile = await api("/users/me");
        if (active) setUser(normalizeUser(profile));
      } catch {
        setAccessToken("");
      } finally {
        if (active) setLoading(false);
      }
    }
    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  async function login(credentials) {
    const result = await api("/auth/login", {
      method: "POST",
      body: credentials,
    });
    setAccessToken(result.accessToken);
    setUser(normalizeUser(result.user));
    return result.user;
  }

  async function loginWithGoogle(googleAuth) {
    const body =
      typeof googleAuth === "string" ? { credential: googleAuth } : googleAuth;
    const result = await api("/auth/google", {
      method: "POST",
      body,
    });
    setAccessToken(result.accessToken);
    setUser(normalizeUser(result.user));
    return result.user;
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST", body: {} }, false);
    } finally {
      setAccessToken("");
      setUser(null);
    }
  }

  const value = useMemo(
    () => ({ user, loading, login, loginWithGoogle, logout, setUser }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
