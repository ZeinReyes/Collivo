import { createContext, useState, useEffect } from "react";
import {jwtDecode} from "jwt-decode";
import axios from "axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const API_BASE_URL = "http://localhost:5000/api/users";

    // LOGIN
    const login = async (userData, token) => {
        localStorage.setItem("token", token);
        setLoading(true);

        try {
            const latestUser = userData._id ? await refreshUser(userData._id) : null;
            if (latestUser) {
                localStorage.setItem("user", JSON.stringify(latestUser));
                setUser(latestUser);
            } else {
                localStorage.setItem("user", JSON.stringify(userData));
                setUser(userData);
            }
        } catch (err) {
            console.error("Login failed:", err);
            localStorage.setItem("user", JSON.stringify(userData));
            setUser(userData);
        } finally {
            setLoading(false);
        }
    };

    // LOGOUT
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setUser(null);
    };

    // REFRESH USER
    const refreshUser = async (id) => {
        if (!id) {
            console.warn("No user ID provided for refreshUser.");
            return null;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) return null;

            const res = await axios.get(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const latestUser = res.data;
            setUser(latestUser);
            localStorage.setItem("user", JSON.stringify(latestUser));
            return latestUser;
        } catch (err) {
            console.error("Failed to refresh user data:", err);
            return null;
        }
    };

    // INITIALIZE USER
    useEffect(() => {
        const initializeUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const decoded = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) {
                    logout();
                    return;
                }

                const storedUser = JSON.parse(localStorage.getItem("user") || "null");
                let latestUser = null;

                if (storedUser && storedUser._id) {
                    latestUser = await refreshUser(storedUser._id);
                }

                if (latestUser) setUser(latestUser);
                else if (storedUser && storedUser._id) setUser(storedUser);
                else setUser(null);
            } catch (err) {
                console.error("Invalid token:", err);
                logout();
            } finally {
                setLoading(false);
            }
        };

        initializeUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                login,
                logout,
                loading,
                refreshUser,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
