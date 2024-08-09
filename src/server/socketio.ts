import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import Message from '@/models/Message';

let io: SocketIOServer | null = null;

const pendingRequests = new Map<string, { studentSocket: Socket, studentId: string }>();

export function initSocketServer(server: HttpServer): SocketIOServer {
  if (!io) {
    io = new SocketIOServer(server, {
      path: '/socket.io/',
    });
    io.on('connection', (socket: Socket) => {
      console.log('New client connected');

      socket.on('join-room', (roomId: string) => {
        socket.join(roomId);
        console.log(`Client joined room: ${roomId}`);
      });

      socket.on('send-message', async (message: any) => {
        try {
          const newMessage = new Message(message);
          await newMessage.save();
          io?.to(message.roomId).emit('receive-message', message);
          console.log(`Message saved and sent in room ${message.roomId}:`, message);
        } catch (error) {
          console.error('Error saving message:', error);
        }
      });


      socket.on('connection-request-sent', (data: { studentId: string, expertId: string }) => {
        console.log(`Connection request sent from student ${data.studentId} to expert ${data.expertId}`);
        pendingRequests.set(data.expertId, { studentSocket: socket, studentId: data.studentId });
      });

      socket.on('expert-accept-request', (data: { expertId: string, roomId: string }) => {
        console.log(`Expert ${data.expertId} accepted request, room created: ${data.roomId}`);
        const pendingRequest = pendingRequests.get(data.expertId);
        if (pendingRequest) {
          console.log(`Emitting connection-accepted to student ${pendingRequest.studentId}`);
          pendingRequest.studentSocket.emit('connection-accepted', { roomId: data.roomId });
          pendingRequests.delete(data.expertId);
        } else {
          console.log(`No pending request found for expert ${data.expertId}`);
        }
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
        pendingRequests.forEach((request, expertId) => {
          if (request.studentSocket === socket) {
            pendingRequests.delete(expertId);
          }
        });
      });
    });
    console.log('Socket.io server initialized');
  }

  if (!io) {
    throw new Error('Failed to initialize socket.io server');
  }

  return io;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}
