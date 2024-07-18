import React, {useContext, useEffect, useState} from 'react';
import './TableDetails.css';
import apiReq from "../apiReq";
import {SocketContext} from "../context/SocketContext";
import {useNavigate} from "react-router-dom";
import TableOrder from "./TableOrder";

const TableDetails = ({ tables, table, setActiveTable, user}) => {
    const [order, setOrder] = useState();
    const { socket } = useContext(SocketContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (table?.status === 'taken') {
            fetchTableOrder();
        }
        else setOrder(null)
    }, [table]);

    const fetchTableOrder = async () => {
        await apiReq.get(`/order/getOrder/${table.orderId}`)
            .then(res => {
                setOrder(res.data);
            });
    };

    const closeTable = async () => {
        await apiReq.post('/tables/closeTable', {table: table._id})
            .then((res) => {
                socket.emit('closeTable', 'Closing Table ' + table.name);
                setActiveTable(res.data)
            })
    };

    return (
        table ? (
        <div className={"table_details"}>
            <div className={'table_details_header'}>
                <div className={'table_details_header_wrapper'}>
                    <div className={'table_details_highlight'}>{table?.name}</div>
                    <div className={'table_details_highlight'}>{order?.price}€</div>
                </div>
                <div className={'table_buttons'}>
                    <button disabled={table.status === 'taken'} className={"button order_button"}
                            onClick={() => navigate('/order', {state: {table: table.name}})}>New
                    </button>
                    <button disabled={table.status !== 'taken'} className={"button order_button"}>Edit</button>
                    <button onClick={closeTable} disabled={table.status !== 'taken' || !user.isAdmin}
                            className={"button order_button"}>Close
                    </button>
                    <button disabled={table.status !== 'taken' || !user.isAdmin}
                            className={"button order_button"}>Print
                    </button>
                </div>
            </div>
            <div className={'table_details_content'}>
                {order && <TableOrder order={order}/>}
            </div>
        </div>
        ) : (
            <div></div>
        )
    );
};

export default TableDetails;