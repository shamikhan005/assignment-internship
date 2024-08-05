"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import { initSocket } from "@/utils/socket";
import { getSocketServer } from "@/server/socketio";

interface Expert {
  _id: string;
  username: string;
  expertise: string;
}

export default function StudentDashboard() {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const [username, setUsername] = useState<string | null>(null);

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    setUsername(storedUsername);

    fetchExperts();

    console.log('Initializing socket connection');
    const userId = localStorage.getItem("userId");

     const initializeSocket = async () => {
      try {
      const socket = await initSocket();
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

      socket.emit('set-user-id', userId);

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

  const fetchExperts = async () => {
    try {
      const response = await axios.get("/api/experts");
      setExperts(response.data);
      setError(null);
    } catch (error) {
      console.error("Error fetching experts:", error);
      setError("Failed to fetch experts. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const sendConnectionRequest = async (expertId: string) => {
    try {
      const userId = localStorage.getItem("userId");
      const userRole = localStorage.getItem("userRole");

      if (!userId) {
        alert("User information is incomplete. Please log in again.");
        return;
      }

      const response = await axios.post(
        "/api/connection-requests",
        { expertId },
        {
          headers: {
            user: JSON.stringify({ id: userId, role: userRole }),
          },
        }
      );
      alert("Connection request sent successfully!");

      if (socketRef.current) {
        socketRef.current.emit('connection-request-sent', { 
          studentId: userId, 
          expertId: expertId 
        });
      }
      
    } catch (error) {
      console.error("Error sending connection request:", error);
      alert("Failed to send connection request. Please try again.");
    }

  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="flex items-center justify-center min-h-screen py-2 bg-gradient-to-r from-gradient-start to-gradient-end">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Student Dashboard</h1>
        <h2 className="text-xl font-semibold mb-2 text-center">Available Experts</h2>
        {experts.length === 0 ? (
          <p className="text-center">No experts available at the moment.</p>
        ) : (
          <ul className="space-y-2">
            {experts.map((expert) => (
              <li key={expert._id} className="border p-2 rounded flex justify-between items-center">
                <span className="font-medium">{expert.username}</span> - {expert.expertise}
                <button
                  onClick={() => sendConnectionRequest(expert._id)}
                  className="ml-2 bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-600 transition"
                >
                  Send Connection Request
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
  
}

