import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const login = async (email, password) => {
    const { data } = await api.login({ email, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
    connectSocket(data.accessToken);
    return data.user;
  };

  const register = async (email, password, displayName) => {
    const { data } = await api.register({ email, password, displayName });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
    connectSocket(data.accessToken);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (_) {}
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
    disconnectSocket();
  };

  const refreshUser = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const { data } = await api.getMe();
      setUser(data.user);
      if (token) connectSocket(token);
      return data.user;
    } catch (err) {
      const refresh = localStorage.getItem("refreshToken");
      if (!refresh) {
        logout();
        return null;
      }
      try {
        const { data } = await api.refreshToken({ refreshToken: refresh });
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        connectSocket(data.accessToken);
        const { data: userData } = await api.getMe();
        setUser(userData.user);
        return userData.user;
      } catch (_) {
        logout();
        return null;
      }
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setLoading(false);
      return;
    }
    refreshUser().finally(() => setLoading(false));
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
