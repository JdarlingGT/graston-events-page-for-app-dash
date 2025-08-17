import { NextResponse } from 'next/server';
import { getOAuth2Client, storeToken } from '@/lib/google';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (!code) {
    return new NextResponse('Authorization code not found.', { status: 400 });
  }

  try {
    const oauth2Client = getOAuth2Client();
    const { tokens } = await oauth2Client.getToken(code);
    await storeToken(tokens);

    // Redirect user back to the tasks page
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/dashboard/tasks`);
  } catch (error) {
    console.error('Error exchanging authorization code for tokens:', error);
    return new NextResponse('Failed to authenticate with Google.', { status: 500 });
  }
}