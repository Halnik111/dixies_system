import React, {useContext} from 'react';
import './Home.css';
import {AuthContext} from "../context/AuthContext";
import NoAccess from "../components/NoAccess";

const Home = () => {
    const {currentUser} = useContext(AuthContext);

    return (
        <div className={'home'}>
            {currentUser ? (
                <div>Ordering System</div>
            ) : (
                <NoAccess />
            )}

        </div>
    );
};

export default Home;