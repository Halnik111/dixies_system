import axios from "axios";

const apiReq = axios.create({
    // baseURL: "https://dixiessystembackend-production.up.railway.app/",
    baseURL: "http://localhost:8080",
    withCredentials: true,
});

export default apiReq;