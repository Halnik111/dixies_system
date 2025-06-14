import './Dashboard.css';

import React, {useContext} from 'react';
import {AuthContext} from "../context/AuthContext";
import NoAccess from "../components/NoAccess";

const Dashboard = () => {
    const { currentUser } = useContext(AuthContext);


    return (
        <div className={'dashboard'}>
            {currentUser.isAdmin ? (
                <div className={'dashboard_wrapper'}>
                    <div className={'dashboard_nav'}>
                        <div className={'dashboard_nav_wrapper'}>
                            <div className={'dashboard_nav_week dashboard_nav_button'}>Today</div>
                            <div className={'dashboard_nav_week dashboard_nav_button'}>Week</div>
                            <div className={'dashboard_nav_month dashboard_nav_button'}>Month</div>
                            <div className={'dashboard_nav_year dashboard_nav_button'}>Year</div>
                        </div>
                    </div>
                    <div className={'dashboard_overview'}></div>
                    <div className={'dashboard_graph'}></div>
                </div>
            ) : (
                <NoAccess />
            )}
        </div>
    );
};

export default Dashboard;