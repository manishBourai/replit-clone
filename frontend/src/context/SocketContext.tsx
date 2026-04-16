import React, { createContext, useContext, useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initializeSocket } from '../util/socketClient';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context.socket;
};

interface SocketProviderProps {
  children: React.ReactNode;
  projectName: string;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children, projectName }) => {
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (projectName) {
      const newSocket = initializeSocket(projectName);
      setSocket(newSocket);
      console.log('Socket initialized with project:', projectName);
    }

    return () => {
      // Optional: disconnect socket on unmount
      // socket?.disconnect();
    };
  }, [projectName]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
};