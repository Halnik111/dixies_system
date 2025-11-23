import axios from "axios";

const apiReq = axios.create({
    // baseURL: "https://dixiessystembackend-production.up.railway.app",
    baseURL: "/api",
    withCredentials: true,
    credentials: "include",
});

export default apiReq;