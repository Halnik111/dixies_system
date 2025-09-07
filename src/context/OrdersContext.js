import {createContext, useContext, useEffect, useRef, useState} from "react";
import apiReq from "../apiReq";
import { useTables } from "./TablesContext";
import { useAuth } from "./AuthContext";
import {tab} from "@testing-library/user-event/dist/tab";

export const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
    const { socket } = useTables();
    const { user } = useAuth();
    const [tableOrders, setTableOrders] = useState([]);
    const [ orders, setOrders ] = useState([]);
    const [loading, setLoading] = useState(false);


    useEffect(() => {
        // Fetch all active orders on mount
        fetchActiveTableOrders()
    }, [])

    useEffect(  () =>{
        socket?.on('tableChanged', async (data) => {
            console.log('Table change');
            setTableOrders(data);
            setOrders(data.orders)
        });

        socket?.on('tableClosed', async (data) => {
            console.log('Table closed');
            setTableOrders(data);
            setOrders(data.orders)
        });
    }, [socket]);
    
    const confirmOrder = async (orders, table, tableOrderId) => {
        setLoading(true);
        let totalPrice = 0;
        orders.forEach(a => totalPrice += a.price);
        const totalPriceRound = Math.round(totalPrice * 100) / 100;
        //await new Promise(resolve => setTimeout(resolve, 2000)); // 2-second delay
        
        if (tableOrderId) {
            await apiReq.put(`/tableOrder/editTableOrder/${tableOrderId}`, {orders: orders, tableId: table._id, price: totalPriceRound})
                .then(() => {
                    socket.emit('tableChange', table, (res) => {
                        setTableOrders(res.tableOrders);
                        setOrders(res.tableOrders.orders);
                    });
                    setLoading(false);
                    return true;
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });
        }
        else {
            await apiReq.post('/tableOrder/newTableOrder', {orders: orders, openedBy: user.id, tableId: table._id, price: totalPriceRound})
                .then(async res => {
                    await apiReq.post('/tables/openTable', { table: table, tableOrderId: res.data._id });
                })
                .then(() => {
                    socket.emit('tableChange', table, (res) => {
                        setTableOrders(res.tableOrders);
                        setOrders(res.tableOrders.orders);
                    });
                    setLoading(false);
                })
                .catch(err => {
                    console.log(err);
                    setLoading(false);
                });   
        }
    };
    
    const fetchActiveTableOrders = async () => {
        await apiReq.get('/tableOrder/getAllActiveTableOrders', {})
            .then(res => {
                setTableOrders(res.data);
                setOrders(res.data.orders)
            })
            .catch(err => console.log(err));
    };

    return (
        <OrderContext.Provider value={{ confirmOrder, tableOrders, orders, fetchActiveTableOrders, orderLoading: loading }}>
            {children}
        </OrderContext.Provider>
    );
};

export const useOrders = () => useContext(OrderContext);