import React, {useEffect} from 'react';
import "./Navbar.css";
import {useAuth} from "../context/AuthContext";
import {useNavigate} from "react-router-dom";

const Navbar = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    
    useEffect(() => {
        console.log(user);
    }, []);
    
    return (
        <div className={'navbar'}>
            {user ? (
                <div className={'navbar_wrapper'}>
                    <div className={'navbar_status'} onClick={() => navigate('/')}>
                        <div>*{user.role}</div>
                    </div>
                    <div className={'navbar_user'}>
                        Connected: {user.name}
                    </div>
                </div>
            ) : (
                <div className={'navbar_wrapper'} onClick={() => navigate('/login')}>
                    || User not Connected ||
                </div>
            )}
        </div>
    );
};

export default Navbar;