import React, {useContext, useEffect, useState} from 'react';
import './Tables.css';
import {AuthContext} from "../context/AuthContext";
import NoAccess from "../components/NoAccess";
import apiReq from "../apiReq";
import Table from "../components/Table";
import {SocketContext} from "../context/SocketContext";
import TableDetails from "../components/TableDetails";
import {useNavigate} from "react-router-dom";

const Tables = () => {
    const { currentUser } = useContext(AuthContext);
    const { socket } = useContext(SocketContext);
    const [tables, setTables] = useState([]);
    const [activeTable, setActiveTable] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchTables();
        }, [activeTable]);

    useEffect(() => {
        socket?.on('tableClosed', data => {
            console.log(data);
            fetchTables();
        });
        socket?.on('tableOpened', data => {
            console.log(data);
            fetchTables();
        })
    }, [socket])

    const fetchTables = () => {
        apiReq.get("/tables/getTables")
            .then(res => setTables(res.data))
            .catch(err => navigate('/'))
    }

    return (
        <div className={'tables'}>
            {currentUser ? (
                <div className={'tables_wrapper'}>
                    <div>ORDER SYSTEM</div>
                    <div className={'tables_window'}>
                        <div className={'tables_grid'}>
                            {tables.map(table => <Table key={table._id} table={table} setActiveTable={setActiveTable}/>)}
                        </div>
                    </div>
                    <TableDetails tables={tables} table={activeTable} setActiveTable={setActiveTable} user={currentUser}/>
                </div>
            ) : (
                <NoAccess />
            )}
            <div className={''}>

            </div>
        </div>
    );
};

export default Tables;