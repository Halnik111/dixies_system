import React, {useContext, useEffect} from 'react';
import './Home.css';
import {AuthContext} from "../context/AuthContext";
import NoAccess from "../components/NoAccess";
import {SocketContext} from "../context/SocketContext";
import {useNavigate} from "react-router-dom";

const Home = () => {
    const {currentUser} = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();

    useEffect( () => {
        socket?.on('testEmit', data => {
            console.log("socket working!");
        });

    }, [socket]);

    return (
        <div className={'home'}>
            {currentUser ? (
                <div className={'home_header'}>
                    <div className={'home_header_title'}>Ordering System</div>
                    <div className={'home_header_nav'}>
                        <div className={'home_header_nav_button'} onClick={() => navigate('/tables')}>
                            Tables
                        </div>
                        <div className={'home_header_nav_button'} onClick={() => navigate('/dashboard')}>
                            *Dashboard
                        </div>
                        <div className={'home_header_nav_button'} onClick={() => navigate('/settings')}>
                            Settings
                        </div>
                        <div className={'home_header_nav_button'} onClick={() => navigate('/login')}>
                            Login
                        </div>
                    </div>
                </div>
            ) : (
                <NoAccess/>
            )}

        </div>
    );
};

export default Home;