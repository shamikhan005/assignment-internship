import { NextRequest, NextResponse } from "next/server";
import { connect } from '@/dbconfig/dbconfig';
import ConnectionRequest from "@/models/connectionRequestModel";
import User from "@/models/userModel";

connect();

export async function GET(request: NextRequest) {
  try {
    const experts = await User.find({ role: 'expert' }).select('username expertise');

    return NextResponse.json(experts);

  } catch (error: any) {
    return NextResponse.json({ message: 'error fetching experts' }, { status: 500 });
  }
}