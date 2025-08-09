import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {useEffect} from "react";

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading) {
            if (!user) {
                navigate("/login", { replace: true });
            } else if (!allowedRoles.includes(user.role)) {
                navigate("/noAccess", { replace: true });
            }
        }
    }, [user, allowedRoles, navigate]);

    if (loading) return <div>Loading...</div>;
    if (!user || !allowedRoles.includes(user.role)) return null;

    return children;
}
