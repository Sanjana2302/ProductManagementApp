import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { loginApi, registerApi, logoutApi } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const silentRefresh = async () => {
      const storedUser = localStorage.getItem("user");

      // no user in storage at all — no point calling refresh
      if (!storedUser) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.post(
          "http://localhost:8080/api/auth/refresh",
          {},
          { withCredentials: true, timeout: 8000 } // 8s timeout
        );
        localStorage.setItem("accessToken", data.accessToken);
        setUser(JSON.parse(storedUser));
      } catch (err) {
        const status = err.response?.status;

        if (status === 401) {
          // refresh token truly expired — logout
          localStorage.clear();
          setUser(null);
        } else {
          // network error, BE down, timeout — keep user logged in
          // accessToken in localStorage may still be valid
          setUser(JSON.parse(storedUser));
        }
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

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
