import { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";
import apiReq from "../apiReq";

export const TablesContext = createContext();

export const TablesProvider = ({ children }) => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        // Fetch tables on mount
        fetchTables();
        console.log('Fetching tables on mount');

        // Decide socket URL based on environment
        const socketInstance = io({                       // same origin as frontend gateway
                    path: '/socket.io',
                    withCredentials: true,
                    transports: ['websocket', 'polling'],
                    reconnection: true,
                    reconnectionAttempts: Infinity,
                    reconnectionDelay: 1000,
                });

        setSocket(socketInstance);

        // Cleanup on unmount
        return () => {
            socketInstance.disconnect();
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handleTableChanged = async () => {
            console.log("Table change");
            await fetchTables();
        };

        const handleTableClosed = async () => {
            console.log("Table closed");
            await fetchTables();
        };

        socket.on("tableChanged", handleTableChanged);
        socket.on("tableClosed", handleTableClosed);

        // Cleanup listeners when socket changes/unmounts
        return () => {
            socket.off("tableChanged", handleTableChanged);
            socket.off("tableClosed", handleTableClosed);
        };
    }, [socket]);

    const fetchTables = async () => {
        setLoading(true);
        await apiReq
            .get("/tables/getTables")
            .then((res) => {
                setTables(res.data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
                console.error("Failed to fetch tables");
            });
    };

    return (
        <TablesContext.Provider value={{ tables, loading, fetchTables, socket }}>
            {children}
        </TablesContext.Provider>
    );
};

// Custom hook for easy usage
export const useTables = () => useContext(TablesContext);
