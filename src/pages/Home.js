import React from 'react';
import './Home.css';
import {useNavigate} from "react-router-dom";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className={'home'}>
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
        </div>
    );
};

export default Home;