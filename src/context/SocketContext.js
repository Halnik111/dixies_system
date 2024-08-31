import {createContext, useEffect, useState} from "react";
import {io} from "socket.io-client";

export const SocketContext = createContext();

export const SocketContextProvider = ({children}) => {
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        setSocket(io('wss://dixiessystembackend-production.up.railway.app'));
        console.log('asd')
        // setSocket(io('ws://localhost:8080'));
    },[]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}