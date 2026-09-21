"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { getUser, logout as logoutApi, csrf } from "@/services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    /**
     * Clear ALL auth-related data from storage and cookies.
     */
    const clearAuthData = useCallback(() => {
        if (typeof window === "undefined") return;

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("access_token");
        sessionStorage.clear();

        // Clear cookies
        document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "laravel_session=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
        document.cookie = "XSRF-TOKEN=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    }, []);

    /**
     * Fetch the current user from the API and update state.
     * NOTE: Permissions live ONLY in React state (not localStorage).
     */
    const refreshUser = useCallback(async () => {
        // 🎯 GUARD: Skip fetch if user just logged out
        if (typeof window !== "undefined" && sessionStorage.getItem("just_logged_out") === "true") {
            console.log("Skipping refreshUser — user just logged out");
            sessionStorage.removeItem("just_logged_out");
            setUser(null);
            setPermissions([]);
            setLoading(false);
            return;
        }

        try {
            const response = await getUser();

            console.log("========== AUTH ==========");
            console.log("Response:", response);
            console.log("User:", response.user);

            const userData = response.user ?? response;
            setUser(userData);

            const userPermissions = response.permissions || [];
            setPermissions(userPermissions);
            // ❌ NO localStorage write for permissions
        } catch (error) {
            if (error.response?.status === 401) {
                setUser(null);
                setPermissions([]);
            } else {
                console.error("AUTH ERROR:", error);
                setUser(null);
                setPermissions([]);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    /**
     * Log out the user: invalidate backend token, clear state, redirect.
     */
    const logout = useCallback(async () => {
        // 1. Set flag FIRST
        if (typeof window !== "undefined") {
            sessionStorage.setItem("just_logged_out", "true");
        }

        // 2. Call backend logout (token still valid, CSRF fresh)
        try {
            await csrf();
            if (typeof logoutApi === "function") {
                await logoutApi();
            }
        } catch (error) {
            console.error("Logout API error (ignored):", error);
        }

        // 3. Clear React state
        setUser(null);
        setPermissions([]);

        // 4. Clear localStorage (including any stale permissions)
        if (typeof window !== "undefined") {
            localStorage.clear();   // ← nukes everything
        }

        // 5. Clear cookies
        if (typeof window !== "undefined") {
            document.cookie.split(";").forEach((c) => {
                document.cookie = c
                    .replace(/^ +/, "")
                    .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
            });
        }

        // 6. Toast + redirect
        toast.success("Logged out successfully");
        if (typeof window !== "undefined") {
            window.location.href = "/login";
        }
    }, []);

    // ============ Permission Checks (memoized) ============

    const hasPermission = useCallback((permissionName) => {
        if (!user) return false;
        if (
            user.role_id === 1 ||
            user.role === "Administrator" ||
            user.role?.name === "Administrator"
        ) {
            return true;
        }
        return permissions?.includes(permissionName) || false;
    }, [user, permissions]);

    const hasAnyPermission = useCallback((permissionList) => {
        if (!user) return false;
        if (
            user.role_id === 1 ||
            user.role === "Administrator" ||
            user.role?.name === "Administrator"
        ) {
            return true;
        }
        return permissionList.some((perm) => permissions?.includes(perm));
    }, [user, permissions]);

    const hasAllPermissions = useCallback((permissionList) => {
        if (!user) return false;
        if (
            user.role_id === 1 ||
            user.role === "Administrator" ||
            user.role?.name === "Administrator"
        ) {
            return true;
        }
        return permissionList.every((perm) => permissions?.includes(perm));
    }, [user, permissions]);

    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider
            value={{
                user,
                setUser,
                permissions,
                setPermissions,
                loading,
                refreshUser,
                logout,
                clearAuthData,
                hasPermission,
                hasAnyPermission,
                hasAllPermissions,
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