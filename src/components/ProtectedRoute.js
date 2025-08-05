import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {useEffect} from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return <div>Loading...</div>
        else if (!user) {
            navigate("/login", { replace: true });
        } else if (!allowedRoles.includes(user.role)) {
            navigate("/unauthorized", { replace: true });
        }
    }, [user, allowedRoles, navigate]);

    if (!user || !allowedRoles.includes(user.role)) return null;

    return children;
}
