import React, {useContext} from 'react';
import "./Navbar.css";
import {AuthContext} from "../context/AuthContext";

const Navbar = () => {
    const { currentUser } = useContext(AuthContext);

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