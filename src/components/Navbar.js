import React, {useContext, useEffect} from 'react';
import "./Navbar.css";
import {AuthContext} from "../context/AuthContext";
import apiReq from "../apiReq";

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);
    const { updateUser } = useContext(AuthContext);

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = async () => {
        await apiReq.post("auth/ping", {})
            .then(res => {
                if (res.data === 'not found') {
                    updateUser(null);
                }
            })
            .catch(() => {
                console.log("failed")
            });
    }

    return (
        <div className={'navbar'}>
            {currentUser ? (
                <div className={'navbar_wrapper'}>
                    <div className={'navbar_status'}>
                        {currentUser.isAdmin ? (
                            <div>*Admin</div>
                        ) : (
                            <div>User</div>
                        )}
                    </div>
                    <div className={'navbar_user'}>
                        Connected: {currentUser.name}
                    </div>
                </div>
            ) : (
                <div className={'navbar_wrapper'}>
                    || User not Connected ||
                </div>
            )}
        </div>
    );
};

export default Navbar;