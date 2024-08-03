import { useEffect, useState, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";

interface Message {
  roomId: string;
  username: string;
  text: string;
  timestamp: string;
}

interface ChatRoomProps {
  roomId: string;
  username: string;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ roomId, username }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState<Socket | null>(null);

  const fetchChatHistory = useCallback(async () => {
    try {
      const response = await axios.get(`/api/chat/messages?roomId=${roomId}`);
      setMessages(response.data);
    } catch (error) {
      console.error("Error fetching chat history:", error);
    }
  }, [roomId]);

  useEffect(() => {
    console.log("Connecting to socket for room:", roomId);
    const newSocket = io();

    newSocket.on("connect", () => {
      console.log("Socket connected");
      newSocket.emit("join-room", roomId);
      console.log("Emitted join-room event for room:", roomId);
    });

    newSocket.on("receive-message", (message: Message) => {
      console.log("Received message:", message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    setSocket(newSocket);

    fetchChatHistory();

    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected");
    };
  }, [roomId, fetchChatHistory]);

  const handleSendMessage = () => {
    if (newMessage.trim() && socket) {
      const message: Message = {
        roomId,
        username,
        text: newMessage,
        timestamp: new Date().toISOString(),
      };
      socket.emit("send-message", message);
      setNewMessage("");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-2 bg-gradient-to-r from-gradient-start to-gradient-end">
      <div className="chat-room p-4 border rounded shadow-lg bg-white w-full max-w-md">
        <div className="chat-history overflow-y-scroll h-96 mb-4">
          {messages.map((message, index) => (
            <div 
              key={index} 
              className={`chat-message mb-4 flex ${message.username === username ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.username === username 
                    ? 'bg-blue-500 text-white self-end' 
                    : 'bg-gray-200 text-gray-800 self-start'
                }`}
              >
                <div className="font-bold mb-1">{message.username}</div>
                <div>{message.text}</div>
                <div className="text-xs mt-1 text-gray-500">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="chat-input flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-500 text-white rounded-r hover:bg-blue-600 transition focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatRoom;
