import './Dashboard.css';
import React from 'react';

const Dashboard = () => {
    return (
        <div className={'dashboard'}>
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
        </div>
    );
};

export default Dashboard;