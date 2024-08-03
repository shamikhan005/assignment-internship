import { connect } from "@/dbconfig/dbconfig";
import User from '@/models/userModel';
import { NextRequest, NextResponse } from "next/server";
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';

connect();

export async function POST(request: NextRequest) {
  try {
    const reqBody = await request.json();
    const { username, password } = reqBody;
    console.log(reqBody);

    const user = await User.findOne({ username });
    if (!user) {
      return NextResponse.json({ error: "User does not exist" }, { status: 400 });
    }
    console.log('User exists');

    const validPassword = await bcryptjs.compare(password, user.password);
    if (!validPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 400 });
    }

    const tokenData = {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role
    };

    const token = await jwt.sign(tokenData, process.env.TOKEN_SECRET!, { expiresIn: '1d' });

    const response = NextResponse.json({
      message: "Login successful",
      success: true,
      token,
      id: user._id,
      role: user.role,
      username: user.username
    });

    response.headers.set('Authorization', `Bearer ${token}`);
    return response;

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}