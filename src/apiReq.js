import axios from "axios";

const apiReq = axios.create({
    baseURL: "http://localhost:8080/",
    withCredentials: true,
    credentials: true,
});

export default apiReq;