import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbconfig/dbconfig";
import ConnectionRequest from "@/models/connectionRequestModel";
import User from "@/models/userModel";
import mongoose from "mongoose";

connect();

function ensureUserModel() {
  if (!mongoose.models.User) {
    mongoose.model("User", User.schema);
  }
}

export async function POST(request: NextRequest) {
  try {
    const { expertId } = await request.json();
    const userHeader = request.headers.get('user');
    if (!userHeader) {
      console.error('User header is missing');
      return NextResponse.json({ message: 'User header is missing' }, { status: 400 });
    }

    const user = JSON.parse(userHeader);
    const studentId = user.id;

    if (!studentId) {
      console.error('Student ID is missing');
      return NextResponse.json({ message: 'Student ID is missing' }, { status: 400 });
    }

    if (!expertId) {
      console.error('Expert ID is missing');
      return NextResponse.json({ message: 'Expert ID is missing' }, { status: 400 });
    }

    const connectionRequest = new ConnectionRequest({
      student: studentId,
      expert: expertId,
      status: 'pending'
    });

    await connectionRequest.save();
    return NextResponse.json({ message: 'Connection request sent successfully' }, { status: 201 });

  } catch (error: any) {
    console.error('Error creating connection request:', error);
    return NextResponse.json({ message: 'Error creating connection request' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {

    ensureUserModel();
    console.log('GET request received for connection requests');

    const userHeader = request.headers.get('user');
    if (!userHeader) {
      console.error('User header is missing');
      return NextResponse.json({ message: 'User header is missing' }, { status: 400 });
    }

    const user = JSON.parse(userHeader);
    const expertId = user.id;
    if (!expertId) {
      console.error('Expert ID is missing');
      return NextResponse.json({ message: 'Expert ID is missing' }, { status: 400 });
    }

    console.log('Fetching connection requests for expert:', expertId);

    console.log('Registered models:', Object.keys(mongoose.models));

    const requests = await ConnectionRequest.find({ expert: expertId, status: 'pending' })
      .populate('student', 'username')
      .exec();

    console.log('Fetched requests:', requests);

    return NextResponse.json(requests);

  } catch (error: any) {
    console.error('Error fetching connection requests:', error);
    return NextResponse.json({ message: 'Error fetching connection requests', error: error.message }, { status: 500 });
  }
}