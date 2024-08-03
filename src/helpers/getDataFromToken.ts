import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

export const getDataFromToken = (request: NextRequest) => {
  try {
    const authHeader = request.headers.get('authorization') || '';
    const token = authHeader.split('')[1];
    
    if (!token) throw new Error('no token found');

    const decodedToken: any = jwt.verify(token, process.env.TOKEN_SECRET!);
    return decodedToken.id;

  } catch (error: any) {
    throw new Error(error.message);
  }
};