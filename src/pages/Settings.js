import './Settings.css';
import React, {useEffect} from 'react';
import MenuEditor from "../components/MenuEditor";

const Settings = () => {

    useEffect(() => {
        
    }, []);
    
    
    return (
        <div className={'settings'}>
            Settings Page
            <MenuEditor />
        </div>
    );
};

export default Settings;