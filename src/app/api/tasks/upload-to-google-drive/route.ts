import { NextResponse } from 'next/server';
import { getGoogleDriveClient } from '@/lib/google';
import { google } from 'googleapis';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const filename = formData.get('filename');

    if (!file || !filename) {
      return NextResponse.json({ success: false, error: 'No file or filename provided' }, { status: 400 });
    }

    const drive = getGoogleDriveClient();

    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const blob = new Blob([buffer]);

    const response = await drive.files.create({
      requestBody: {
        name: filename as string,
        mimeType: file.type,
      },
      media: {
        mimeType: file.type,
        body: blob.stream(),
      },
    });

    return NextResponse.json({ success: true, fileId: response.data.id });
  } catch (error) {
    console.error('Error uploading to Google Drive:', error);
    return NextResponse.json({ success: false, error: 'Failed to upload to Google Drive' }, { status: 500 });
  }
}