import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const initSocket = async (userId?: string): Promise<Socket> => {
  if (!socket) {
    socket = io({
      path: '/socket.io/',
      query: userId ? { userId } : undefined
    });
  }
  return socket;
}
