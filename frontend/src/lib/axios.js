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

axiosInstance.interceptors.request.use((config) => {
    console.log("========== REQUEST ==========");
    console.log("URL:", config.baseURL + config.url);
    console.log("withCredentials:", config.withCredentials);
    console.log("withXSRFToken:", config.withXSRFToken);
    console.log("Headers:", config.headers);

    return config;
});

export default axiosInstance;