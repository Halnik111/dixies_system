import axios from "axios";

const apiReq = axios.create({
    baseURL: process.env.REQ_URL,
    withCredentials: true,
});

export default apiReq;