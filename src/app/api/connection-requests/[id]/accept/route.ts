import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/dbconfig/dbconfig';
import ConnectionRequest from "@/models/connectionRequestModel";
import User from "@/models/userModel";
import ChatRoom from '@/models/chatRoom';
import { getSocketServer } from '@/server/socketio';

connect();

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const userHeader = request.headers.get('user');

  if (!userHeader) {
    return NextResponse.json({ message: 'User header is missing' }, { status: 400 });
  }

  const user = JSON.parse(userHeader);
  const expertId = user.id;

  try {
    const connectionRequest = await ConnectionRequest.findOneAndUpdate(
      { _id: id, expert: expertId, status: 'pending' },
      { status: 'accepted' },
      { new: true }
    );

    if (!connectionRequest) {
      return NextResponse.json({ message: 'Connection request not found or already processed' }, { status: 404 });
    }

    const roomId = `${connectionRequest.student}-${expertId}`;
    const newRoom = new ChatRoom({
      studentId: connectionRequest.student,
      expertId,
      roomId
    });

    await newRoom.save();

    const io = getSocketServer();
    io?.to(connectionRequest.student.toString()).emit('connection-accepted', { roomId });
    io?.to(expertId).emit('connection-accepted', { roomId });
    console.log('Emitted connection-accepted event to:', connectionRequest.student.toString(), expertId);
    
    return NextResponse.json({ message: 'Connection request accepted successfully', roomId });
    
  } catch (error: any) {
    console.error('Error accepting connection request:', error);
    return NextResponse.json({ message: 'Error accepting connection request' }, { status: 500 });
  }
}
