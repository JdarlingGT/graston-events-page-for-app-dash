import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

let oauth2Client: OAuth2Client;

export function getOAuth2Client() {
  if (!oauth2Client) {
    oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI,
    );

    // Set the credentials from the environment variables
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
  }

  return oauth2Client;
}

export function getGoogleDriveClient() {
  const authClient = getOAuth2Client();
  return google.drive({ version: 'v3', auth: authClient });
}

export function getGmailClient() {
  const authClient = getOAuth2Client();
  return google.gmail({ version: 'v1', auth: authClient });
}