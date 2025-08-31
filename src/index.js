import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import {AuthProvider} from "./context/AuthContext";
import {TablesProvider} from "./context/TablesContext";
import {OrderProvider} from "./context/OrdersContext";
import {MealsProvider} from "./context/MealsContext";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <AuthProvider>
        <TablesProvider>
            <OrderProvider>
                <MealsProvider>
                    <App />
                </MealsProvider>
            </OrderProvider>
        </TablesProvider>
    </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
