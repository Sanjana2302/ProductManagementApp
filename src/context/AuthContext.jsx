import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { loginApi, registerApi, logoutApi } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // blocks render until we know auth state

  // On every page load/refresh — silently try to get new access token using HTTP-only cookie
  useEffect(() => {
    const silentRefresh = async () => {
      try {
        const { data } = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          {},
          { withCredentials: true }
        );
        localStorage.setItem("accessToken", data.accessToken);
        const stored = localStorage.getItem("user");
        if (stored) setUser(JSON.parse(stored));
      } catch {
        // refresh token expired or invalid — clear everything
        localStorage.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    silentRefresh();
  }, []);

  const login = async (email, password) => {
    const { data } = await loginApi({ email, password });
    localStorage.setItem("accessToken", data.accessToken);
    const userData = { fullName: data.fullName, email: data.email, shopName: data.shopName };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const register = async (fullName, email, password, shopName) => {
    const { data } = await registerApi({ fullName, email, password, shopName });
    localStorage.setItem("accessToken", data.accessToken);
    const userData = { fullName: data.fullName, email: data.email, shopName: data.shopName };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try { await logoutApi(); } catch {}
    localStorage.clear();
    setUser(null);
  };

  // show nothing until silent refresh completes — prevents flash of login page
  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
