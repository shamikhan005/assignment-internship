"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { initSocket } from "@/utils/socket";
import { getSocketServer } from "@/server/socketio";
import { Socket } from "socket.io-client";


interface ConnectionRequest {
  _id: string;
  student: {
    _id: string;
    username: string;
  };
}

export default function ExpertDashboard() {
  const [connectionRequests, setConnectionRequests] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const socketRef = useRef<Socket | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    console.log('Initializing socket connection');
    fetchConnectionRequests();
    const userId = localStorage.getItem("userId");
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);

    if (!userId) {
      console.error("User ID is missing from localStorage");
      setError("User information is incomplete. Please log in again.");
      return;
    }

    const initializeSocket = async () => {
      try {
        const socket = await initSocket(userId);
        socketRef.current = socket;

        socket.on('connect', () => {
          console.log('Socket connected successfully', socket.id);
        });

        socket.on('connection-accepted', (data) => {
          console.log('Received connection-accepted event:', data);
          if (data && data.roomId) {
            console.log('Redirecting to:', `/chat/${data.roomId}`);
            router.push(`/chat/${data.roomId}`);
          } else {
            console.error('Invalid data received for connection-accepted event:', data);
          }
        });

        socket.on('disconnect', () => {
          console.log('Socket disconnected');
        });

      } catch (error) {
        console.error('Error initializing socket:', error);
      }
    };

    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        console.log('Socket disconnected');
      }
    };
  }, [router]);

  const fetchConnectionRequests = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        console.error("User ID is missing from localStorage");
        setError("User information is incomplete. Please log in again.");
        return;
      }

      const response = await axios.get("/api/connection-requests", {
        headers: {
          user: JSON.stringify({ id: userId }),
        },
      });
      setConnectionRequests(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching connection requests:", error);
      setError("Failed to fetch connection requests. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const acceptConnectionRequest = async (requestId: string, studentId: string) => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        console.error("User ID is missing from localStorage");
        alert("User information is incomplete. Please log in again.");
        return;
      }
      const response = await axios.put(`/api/connection-requests/${requestId}/accept`, null, {
        headers: {
          user: JSON.stringify({ id: userId }),
        },
      });
      const { roomId } = response.data;

      if (socketRef.current) {
        socketRef.current.emit('join-room', roomId);
        console.log('Emitted join-room event with roomId:', roomId);

        socketRef.current.emit('expert-accept-request', { expertId: userId, studentId, roomId });
        console.log('Emitted expert-accept-request event:', { expertId: userId, studentId, roomId });
      } else {
        console.error('Socket is not connected');
      }

      alert("Connection request accepted and chat room created!");
      router.push(`/chat/${roomId}`);  
    } catch (error) {
      console.error("Error accepting connection request:", error);
      alert("Failed to accept connection request. Please try again.");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex items-center justify-center min-h-screen py-2 bg-gradient-to-r from-gradient-start to-gradient-end">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md text-center">
        <h1 className="text-2xl font-bold mb-4">Expert Dashboard</h1>
        <h2 className="text-xl font-semibold mb-2">Connection Requests</h2>
        {connectionRequests.length === 0 ? (
          <p>No pending connection requests.</p>
        ) : (
          <ul className="space-y-2">
            {connectionRequests.map((request) => (
              <li
                key={request._id}
                className="border p-2 rounded flex items-center justify-between"
              >
                <span>{request.student.username} wants to connect</span>
                <button
                  onClick={() =>
                    acceptConnectionRequest(request._id, request.student._id)
                  }
                  className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition"
                >
                  Accept
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  ); 
}
