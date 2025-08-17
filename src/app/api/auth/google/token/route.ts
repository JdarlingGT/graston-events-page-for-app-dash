import { NextResponse } from 'next/server';
import { getStoredToken } from '@/lib/google';

export async function GET() {
  try {
    const tokens = await getStoredToken();
    if (!tokens || !tokens.access_token) {
      return new NextResponse('User not authenticated or access token missing.', { status: 401 });
    }
    return NextResponse.json({ accessToken: tokens.access_token });
  } catch (error) {
    console.error('Failed to retrieve access token:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}