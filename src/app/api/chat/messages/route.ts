import { NextRequest, NextResponse } from "next/server";
import Message from "@/models/Message";
import { timeStamp } from "console";
import { connect } from '@/dbconfig/dbconfig';

export async function POST(request: NextRequest) {
  await connect();
  const body = await request.json();
  const { roomId, username, text } = body;

  const message = new Message({ roomId, username, text });
  await message.save();

  return NextResponse.json(message, { status: 201 });
}

export async function GET(request: NextRequest) {
  await connect();
  const { searchParams } = new URL(request.url);
  const roomId = searchParams.get('roomId');

  if (!roomId) {
    return NextResponse.json({ error: 'room id is required' }, { status: 400 })
  }

  const messages = await Message.find({ roomId }).sort({ timestamp: -1 }).limit(10)

  return NextResponse.json(messages.reverse());
}