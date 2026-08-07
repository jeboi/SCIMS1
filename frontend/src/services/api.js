import axios from "axios";
import axiosInstance from "@/lib/axios";
import appConfig from "@/config/app";

// Health
export const getHealth = async () => {
    const response = await axiosInstance.get("/health");
    return response.data;
};

// CSRF
export const csrf = async () => {
    await axios.get(
        `${appConfig.backendUrl}/sanctum/csrf-cookie`,
        {
            withCredentials: true,
        }
    );
};

// Login
export const login = async (credentials) => {
    await csrf();

    const response = await axiosInstance.post("/login", credentials);

    return response.data;
};

// User
export const getUser = async () => {
    const response = await axiosInstance.get("/user");
    return response.data;
};

// Logout
export const logout = async () => {
    console.log("Sending logout request...");

    const response = await axiosInstance.post("/logout");

    console.log("Logout response:", response);

    return response.data;
};