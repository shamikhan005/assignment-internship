"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ChatRoom from "@/app/components/ChatRoom";


const ChatPage = () => {
  const params = useParams();
  const [username, setUsername] = useState<string>("Unknown User");

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    console.log("Stored username:", storedUsername);
    if (storedUsername) {
      setUsername(storedUsername);
    } else {
      console.log("No username found in localStorage");
    }
  }, []);

  console.log("Current username:", username);

  if (!params.roomId) {
    return <div>Invalid Room ID</div>;
  }

  return (
    <div className="p-4 bg-gradient-to-r from-gradient-start to-gradient-end">
      <h1 className="text-2xl font-bold mb-4">Chat Room</h1>
      <ChatRoom roomId={params.roomId as string} username={username} />
    </div>
  );
};

export default ChatPage;
