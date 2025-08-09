import './Login.css';
import React, {useState} from 'react';
import {useNavigate} from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, logout } = useAuth();
    
    
    const signIn = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const formData = new FormData(e.target);
        const name = formData.get("name");
        const password = formData.get("password");

        try {
            await login(name, password);
            navigate("/"); // Redirect to home or dashboard
        } catch (err) {
            setError("Invalid name or password");
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        setError("");
        setLoading(true);
        
        try {
            await logout();
        } catch (err) {
            setError("Failed to sign out");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={'login'}>
            <form className={'form'} onSubmit={signIn}>
                <div className={'form_wrapper'}>
                    <div className={'form_title'}>
                        Username:
                    </div>
                    <input name={"name"} className={'input'}/>
                </div>
                <div className={'form_wrapper'}>
                    <div className={'form_title'}>
                        Password:
                    </div>
                    <input name={"password"} type={"password"} id={'field_password'} className={'input'}/>
                </div>
                <button disabled={loading} className={'form_button button'}>Login</button>
            </form>
            <button className={'form_button button'} onClick={() => signOut()}>Sign out</button>
            {error && <span>{error}</span>}
        </div>
    );
};

export default Login;