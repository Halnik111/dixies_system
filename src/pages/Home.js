import React, {useContext, useEffect} from 'react';
import './Home.css';
import {AuthContext} from "../context/AuthContext";
import NoAccess from "../components/NoAccess";
import {SocketContext} from "../context/SocketContext";

const Home = () => {
    const {currentUser} = useContext(AuthContext);
    const { socket } = useContext(SocketContext);

    useEffect( () => {
        socket?.on('testEmit', data => {
            console.log("socket working!");
        });

    }, [socket]);

    const test = () => {
        console.log('clicked')
        socket.emit('test', "test success?");
    }

    return (
        <div className={'home'}>
            {currentUser ? (
                <div>
                    Ordering System
                    <div onClick={() => test()}>
                        button
                    </div>
                </div>
            ) : (
                <NoAccess />
            )}

        </div>
    );
};

export default Home;