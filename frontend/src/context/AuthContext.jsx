"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getUser, logout as logoutApi } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const refreshUser = async () => {
        try {
            const response = await getUser();

            console.log("========== AUTH ==========");
            console.log("Response:", response);
            console.log("User:", response.user);

            setUser(response.user ?? response);
        } catch (error) {
            // Silently handle expected 401 when user is not logged in yet
            if (error.response?.status === 401) {
                setUser(null);
            } else {
                console.error("AUTH ERROR:", error);
                setUser(null);
            }
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        try {
            // 1. Call your actual API service to invalidate backend token/session
            if (typeof logoutApi === "function") {
                await logoutApi();
            }
        } catch (error) {
            console.error("Logout API error:", error);
        } finally {
            // 2. Clear client-side state & tokens from local storage
            setUser(null);
            localStorage.removeItem("user");
            localStorage.removeItem("token"); // Clear your auth token if stored here
            localStorage.removeItem("access_token");
            sessionStorage.clear();

            // 3. Clear cookies on client side if using cookie-based auth
            document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
            document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

            // 4. Toast notification
            toast.success("Logged out successfully");

            // 5. Hard redirect to prevent Next.js layout state rehydration
            window.location.href = "http://localhost:3000/";
        }
    };

    useEffect(() => {
        refreshUser();
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                loading,
                refreshUser,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}