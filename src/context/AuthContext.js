import {createContext, useCallback, useContext, useEffect, useState} from "react";
import apiReq from "../apiReq";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // { id, role }
    const [loading, setLoading] = useState(true);

    // Fetch current logged-in user from backend
    const refreshUser = useCallback(async () => {
        try {
            const res = await apiReq.post("auth/me", {})
                .then(res => res.data);
            if (!res) throw new Error("Not authenticated");
            setUser(await res);
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    // Login function
    const login = useCallback(async (name, password) => {
        await apiReq.post("auth/signIn", { name, password});
        await refreshUser();
    }, [refreshUser]);

    // Logout function
    const logout = useCallback(async () => {
        await apiReq.post("auth/signOut", {});
        setUser(null);
    }, []);

    // Run once on mount to check login state
    useEffect(() => {
        refreshUser();
    }, [refreshUser]);

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook for easy usage
export const useAuth = () => useContext(AuthContext);