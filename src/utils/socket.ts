import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = async (): Promise<Socket> => {
  if (!socket) {
    socket = io();
  }
  return socket;
}