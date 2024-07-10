import './Login.css';

import React, {useContext, useState} from 'react';
import {useNavigate} from "react-router-dom";
import apiReq from "../apiReq";
import {AuthContext} from "../context/AuthContext";

const Login = () => {
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { updateUser } = useContext(AuthContext);


    const signIn = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const formData = new FormData(e.target);
        const name = formData.get("name");
        const password = formData.get("password");

        await apiReq.post("auth/signIn", {name, password}, )
            .then(res => {
                updateUser(res.data);
                console.log(res.data);
            })
            .then(() => {
                navigate('/');
            })
            .catch((err) => {
                console.log("failed")
                setError(err.response.data);
            }).finally(() => {
                setIsLoading(false);
            })
    };

    const signOut = async () => {
        await apiReq.post("auth/signOut", {})
            .then(res => {
                updateUser(null);
                setError(res.data)
            })
            .catch((err) => {
                console.log("failed")
                setError(err.response.data);
            });
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
                <button disabled={isLoading} className={'form_button button'}>Login</button>
            </form>
            <button className={'form_button button'} onClick={() => signOut()}>Sign out</button>
            {error && <span>{error}</span>}
        </div>
    );
};

export default Login;