import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export const initializeSocket = (roomId: string) => {
  if (socket) {
    socket.disconnect();
  }
  
  socket = io("http://localhost:3000", {
    query: { roomId },
  });
  
  return socket;
};

export const getSocket = (): Socket => {
  if (!socket) {
    socket = io("http://localhost:3000", {
      query: { roomId: "default" },
    });
  }
  return socket;
};