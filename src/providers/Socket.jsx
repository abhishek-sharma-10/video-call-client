import React, { useMemo } from "react";
import { io } from "socket.io-client";

const SocketContext = React.createContext(null);

export const useSocket = () => {
    return React.useContext(SocketContext);
}

export const SocketProvider = (props) => {
    console.log('socket ', props.socket);
    const socket = useMemo(() => io('http://localhost:8001'), []);
    return (
        <SocketContext.Provider value={{socket}}>
            {props.children}
        </SocketContext.Provider>
    );
};