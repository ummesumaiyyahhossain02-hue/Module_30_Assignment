import { createContext, useContext, useEffect, useState } from "react";
import * as authApi from "../api/auth";
import { setTokens, clearTokens } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const access = localStorage.getItem("access");
    if (!access) {
      setLoading(false);
      return;
    }
    authApi
      .fetchMe()
      .then((data) => setUser(data))
      .catch(() => {
        clearTokens();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  async function login(username, password) {
    const tokens = await authApi.login(username, password);
    setTokens(tokens);
    const me = await authApi.fetchMe();
    setUser(me);
    return me;
  }

  async function register(data) {
    await authApi.register(data);
    return login(data.username, data.password);
  }

  function logout() {
    clearTokens();
    setUser(null);
  }

  const value = { user, loading, login, register, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
