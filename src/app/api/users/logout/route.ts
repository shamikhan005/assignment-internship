import { connect } from '@/dbconfig/dbconfig';
import { NextRequest, NextResponse } from 'next/server';

connect();

export async function GET(request: NextRequest) {
  try {
    const response = NextResponse.json({
      message: "logout successful",
      success: true
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}