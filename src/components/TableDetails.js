import React, { useEffect, useState } from 'react';
import './TableDetails.css';
import apiReq from "../apiReq";
import { useTables } from "../context/TablesContext";
import {useNavigate} from "react-router-dom";
import TableOrder from "./TableOrder";

const TableDetails = ({ table, setActiveTable }) => {
    const [order, setOrder] = useState();
    const { tables, socket, orders, loading } = useTables();
    const navigate = useNavigate();

    useEffect(() => {
        if (table?.status === 'taken') {
            setOrder(orders.find(i => i._id === table.orderId));
        }
        else {
            setOrder(null);
        }
    }, [table, orders, tables]);

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
                    {loading && <div className={'loading'}>Loading...</div>}
                    <button disabled={order || loading} className={"button order_button"}
                            onClick={() => navigate('/order', {state: {table: table.name}})}>New
                    </button>
                    <button onClick={() => navigate('/order', {state: {table: table.name, order: order}})} disabled={!order || loading} className={"button order_button"}>Edit</button>
                    <button onClick={closeTable} disabled={!order || loading}
                            className={"button order_button"}>Close
                    </button>
                    <button disabled={!order || loading}
                            className={"button order_button"} onClick={() => navigate('/print', {state: {order: order}})}>Print
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