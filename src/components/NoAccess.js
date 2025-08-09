import React from 'react';
import './NoAccess.css';
import {useNavigate} from "react-router-dom";

const NoAccess = () => {
    const navigate = useNavigate();
    
    return (
        <div className={"noAccess"}>
            <div>No Access</div>
                <button className={'button'} onClick={() => navigate('/login')}>Login</button>
        </div>
    );
};

export default NoAccess;