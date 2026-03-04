import { createContext, useContext, useEffect, useState } from "react";
import { io } from 'socket.io-client'
import { useSelector } from 'react-redux';

const SocketContext = createContext(null);

export const useSocket = () => {
    return useContext(SocketContext);
}

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const user = useSelector((state) => state.auth.user);

    const userId = user?._id || user?.id;

    useEffect(() => {
        let newSocket = null;
        if (userId) {
            const baseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/api\/v1\/?$/, '') || 'http://localhost:3000';
            newSocket = io(baseUrl, {
                withCredentials: true,
                autoConnect: true,
            });
            setSocket(newSocket);
        } else {
            setSocket(null);
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [userId]);

    return (
        <SocketContext.Provider value={socket} >
            {children}
        </SocketContext.Provider>
    )
}