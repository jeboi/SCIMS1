import axios from "axios";
import appConfig from "@/config/app.js";

const axiosInstance = axios.create({
    baseURL: appConfig.apiUrl,
    withCredentials: true,
    withXSRFToken: true,
    xsrfCookieName: "XSRF-TOKEN",
    xsrfHeaderName: "X-XSRF-TOKEN",
    headers: {
        "X-Requested-With": "XMLHttpRequest",
        Accept: "application/json",
        "Content-Type": "application/json",
    },
});

// ============ REQUEST INTERCEPTOR ============
// Attaches the Bearer token to every request (if present)
axiosInstance.interceptors.request.use(
    (config) => {
        // Get token from localStorage
        const token =
            typeof window !== "undefined"
                ? localStorage.getItem("token") || localStorage.getItem("access_token")
                : null;

        // Attach Authorization header if token exists
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }

        // Debug logging (remove in production)
        console.log("========== REQUEST ==========");
        console.log("URL:", (config.baseURL || "") + (config.url || ""));
        console.log("Has Token:", token ? "yes" : "no");
        console.log("Authorization:", config.headers.Authorization ? "set" : "missing");

        return config;
    },
    (error) => Promise.reject(error)
);

// ============ RESPONSE INTERCEPTOR ============
// Handles 401s globally
axiosInstance.interceptors.response.use(
    (response) => {
        // Strip UTF-8 BOM if present
        if (typeof response.data === "string") {
            const cleaned = response.data.replace(/^\uFEFF/, "").replace(/^ï»¿/, "");
            try {
                response.data = JSON.parse(cleaned);
            } catch (e) {
                // Not JSON, leave as-is
            }
        }
        return response;
    },
    (error) => {
        // If 401, clear stale auth and redirect to login
        if (error.response?.status === 401 && typeof window !== "undefined") {
            const isLoginRequest = error.config?.url?.includes("/login");
            
            // Don't redirect on login page or login request itself
            if (!isLoginRequest && !window.location.pathname.includes("/login")) {
                console.warn("401 Unauthorized — clearing session and redirecting to login");
                localStorage.removeItem("token");
                localStorage.removeItem("access_token");
                localStorage.removeItem("user");
                localStorage.removeItem("permissions");
                sessionStorage.clear();
                window.location.href = "/login";
            }
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;