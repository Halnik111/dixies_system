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
                    Ordering System
                    <div className={'button'} onClick={() => navigate('/tables')}>
                        Tables
                    </div>
                </div>
            ) : (
                <NoAccess />
            )}

        </div>
    );
};

export default Home;