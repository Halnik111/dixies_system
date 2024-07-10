import React, {useContext, useEffect, useRef, useState} from 'react';
import './Order.css';
import {io} from "socket.io-client";
import {AuthContext} from "../context/AuthContext";
import NoAccess from "../components/NoAccess";
import apiReq from "../apiReq";
import Table from "../components/Table";

const Order = () => {
    const [socket, setSocket] = useState(null);
    const { currentUser } = useContext(AuthContext);
    const [tables, setTables] = useState([]);

    useEffect(() => {
        setSocket(io('ws://localhost:8900/'));

        fetchTables()
        }, []);

    const fetchTables = () => {
        apiReq.get("/tables/getTables")
            .then(res => setTables(res.data))
    }

    return (
        <div className={'order'}>
            {currentUser ? (
                    <div className={'order_wrapper'}>
                        ORDER SYSTEM
                <div className={'table_window'}>

                    <div className={'boxes'}>
                        {tables.map(table => <Table table={table} />)}
                    </div>
                    <div className={"tables"}>
                        <div id={'t-10'} className={'table'}>S-10</div>
                        <div id={'t-9'} className={'table'}>S-9</div>
                        <div id={'t-8'} className={'table'}>S-8</div>
                        <div id={'t-7'} className={'table'}>S-7</div>
                        <div id={'t-6'} className={'table'}>S-6</div>
                        <div id={'t-BAR'} className={'table'}>BAR</div>
                        <div id={'t-4'} className={'table'}>S-4</div>
                        <div id={'t-3'} className={'table'}>S-3</div>
                        <div id={'t-2'} className={'table'}>S-2</div>
                        <div id={'t-1'} className={'table'}>S-1</div>
                    </div>
                </div>
                    </div>
            ) : (
                <NoAccess />
            )}
            <div className={''}>

            </div>
        </div>
    );
};

export default Order;