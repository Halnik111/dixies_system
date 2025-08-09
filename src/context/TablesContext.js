import {createContext, useContext, useEffect, useState} from "react";
import {io} from "socket.io-client";
import apiReq from "../apiReq";

export const TablesContext = createContext();

export const TablesProvider = ({children}) => {
    const [tables, setTables] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Fetch tables on mount
        fetchTables();
        
        // Initialize socket connection
        //setSocket(io('wss://dixiessystembackend-production.up.railway.app'));
         setSocket(io('ws://localhost:8080'));
    },[]);
    
    useEffect(  () =>{
        socket?.on('tableChanged', async () => {
            console.log('Table change');
            await fetchTables();
        });

        socket?.on('tableClosed', async () => {
            console.log('Table closed');
            await fetchTables();
        });
    }, [socket])
    
    const fetchTables = async () => {
        setLoading(true);
        await apiReq.get("/tables/getTables")
            .then(res => {
                setTables(res.data);
                apiReq.post('/order/getAllActiveOrders', {orders: res.data.map(table => table.orderId)})
                    .then(res => setOrders(res.data))
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                console.error("Failed to fetch tables");
            })
    }

    return (
        <TablesContext.Provider value={{ tables, orders, loading, fetchTables, socket }}>
            {children}
        </TablesContext.Provider>
    )
};

// Custom hook for easy usage
export const useTables = () => useContext(TablesContext);