import axios from "axios";

const apiReq = axios.create({
    // baseURL: "https://dixiessystembackend-production.up.railway.app",
    baseURL: "/api",
    withCredentials: true,
    credentials: "include",
});

// Helper: should we trigger a redirect for this error?
const shouldHandleAuthRedirect = (error) => {
    const status = error?.response?.status;
    if (status !== 401 && status !== 403) return false;

    const url = error.config?.url || "";

    // Don't auto-redirect for auth endpoints themselves
    if (url.includes("/auth/signIn") || url.includes("/auth/signOut")) {
        return false;
    }

    return true;
};

apiReq.interceptors.response.use(
    (response) => response,
    (error) => {
        if (shouldHandleAuthRedirect(error)) {
            // For HashRouter: change the hash to go to /login
            const isAlreadyOnLogin =
                window.location.hash.includes("#/login");

            if (!isAlreadyOnLogin) {
                // avoid back-button loop: replace instead of push
                window.location.hash = "#/login";
            }
        }

        // still let callers see the error if they want
        return Promise.reject(error);
    }
);

export default apiReq;
