import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/dbconfig/dbconfig';
import ChatRoom from "@/models/chatRoom";

export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    const { studentId, expertId } = body;

    const chatRoom = new ChatRoom({ studentId, expertId });
    await chatRoom.save()

    return NextResponse.json(chatRoom, { status: 201 });
    
  } catch (error: any) {
    console.error('error creating chat room: ', error);
    return NextResponse.json({ error: 'failed to create chat room' }, { status: 500 });
  }
}