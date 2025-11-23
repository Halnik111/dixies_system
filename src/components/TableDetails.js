import React, { useEffect, useState } from 'react';
import './TableDetails.css';
import '../components/Elements.css';
import apiReq from "../apiReq";
import { useTables } from "../context/TablesContext";
import {useNavigate} from "react-router-dom";
import TableOrder from "./TableOrder";
import {useOrders} from "../context/OrdersContext";
import {useMeals} from "../context/MealsContext";
import {useAuth} from "../context/AuthContext";
const TableDetails = ({ table, setActiveTable }) => {
    const [order, setOrder] = useState();
    const [tableOrder, setTableOrder] = useState({});
    const { tableOrders } = useOrders();
    const [closing, setClosing] = useState(false);
    const { tables, socket } = useTables();
    const { user } = useAuth();
    const { mealsById } = useMeals();
    const navigate = useNavigate();

    useEffect(() => {
        if (table?.status === 'taken') {
            const activeOrder = tableOrders.filter(i => i._id === table.tableOrderId)[0];
            let index = 0;
            const hydrated = activeOrder.orders?.map(o => ({
                ...o,
                meals: (o.mealIDs || []).map(id => ({
                    index: index++,
                    meal: mealsById[id],
                })).filter(Boolean),
            }));
            setTableOrder({...activeOrder, orders: hydrated});
            console.log({...activeOrder, orders: hydrated});
            setOrder(hydrated);
        }
        else {
            setOrder(null);
            setTableOrder(null);
        }
    }, [tables, table]);

    const closeTable = async () => {
        setClosing(true);
        //await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
        await apiReq.put('/tables/closeTable', {tableId: table._id, closedBy: user._id})
            .then((res) => {
                socket.emit('closeTable', (res) => {
                    setActiveTable(res.data)
                    setOrder(res.tableOrders);
                    setTableOrder(res.tableOrders.orders);
                    setClosing(false)
                });
            })
    };

    return (
        table ? (
        <div className={"table_details"}>
            <div className={'table_details_header'}>
                <div className={'table_details_header_wrapper'}>
                    <div className={'table_details_highlight'}>{table?.name}</div>
                    <div className={'table_details_highlight'}>{tableOrder?.price}€</div>
                </div>
                <div className={'table_buttons'}>
                    <button disabled={table.status === 'taken'} className={"button order_button"}
                            onClick={() => navigate('/order', {state: {table: table}})}>New
                    </button>
                    <button onClick={() => navigate('/order', {state: {table: table, order: tableOrder}})} disabled={table.status !== 'taken'} className={"button order_button"}>Edit</button>
                    <button onClick={closeTable} disabled={table.status !== 'taken'}
                            className={"button order_button"}>Close
                    </button>
                    <button disabled={table.status !== 'taken'}
                            className={"button order_button"} onClick={() => navigate('/print', {state: {order: tableOrder, table: table}})}>Print
                    </button>
                </div>
            </div>
            <div className={'table_details_content'}>
                {order && !closing && <TableOrder tableOrder={order}/>}
                {closing && <div className="tablesDetails_loading">
                    <div className="tablesDetails_spinner"></div>
                </div>}
            </div>
        </div>
        ) : (
            <div></div>
        )
    );
};

export default TableDetails;