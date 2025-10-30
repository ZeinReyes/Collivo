import { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode"; // remove braces
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const API_BASE_URL = "http://localhost:5000/api/users";

  // === LOGIN ===
  const login = async (userData, token) => {
    localStorage.setItem("token", token);
    setToken(token); // ✅ must set token state
    setLoading(true);

    try {
      const latestUser = userData._id ? await refreshUser(userData._id) : null;
      const finalUser = latestUser || userData;

      localStorage.setItem("user", JSON.stringify(finalUser));
      setUser(finalUser);
    } catch (err) {
      console.error("Login failed:", err);
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } finally {
      setLoading(false);
    }
  };

  // === LOGOUT ===
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setToken(null); // ✅ clear token
  };

  // === REFRESH USER DATA ===
  const refreshUser = async (id) => {
    if (!id) return null;

    try {
      if (!token) return null;

      const res = await axios.get(`${API_BASE_URL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const latestUser = res.data;
      setUser(latestUser);
      localStorage.setItem("user", JSON.stringify(latestUser));
      return latestUser;
    } catch (err) {
      console.warn("Failed to refresh user:", err.message);
      return null;
    }
  };

  // === INITIALIZE USER ON LOAD ===
  useEffect(() => {
    const initializeUser = async () => {
      const storedToken = localStorage.getItem("token");
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");

      if (!storedToken || !storedUser) {
        setLoading(false);
        return;
      }

      try {
        const decoded = jwtDecode(storedToken);
        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn("Token expired — keeping user logged in (dev mode)");
        }

        const latestUser = await refreshUser(storedUser._id);
        setUser(latestUser || storedUser);
        setToken(storedToken); // ✅ set token state here
      } catch (err) {
        console.error("Auth initialization error:", err);
        setUser(storedUser || null);
      } finally {
        setLoading(false);
      }
    };

    initializeUser();
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, refreshUser }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
