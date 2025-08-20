...import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import fs from 'fs';
import path from 'path';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
  PutSecretValueCommand,
  CreateSecretCommand,
} from '@aws-sdk/client-secrets-manager';

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

// Token storage helpers with optional AWS Secrets Manager support.
// Priority:
// 1. Use `GOOGLE_TOKENS` env var (JSON string) if present.
// 2. If `GOOGLE_SECRET_NAME` + AWS env vars present, use AWS Secrets Manager.
// 3. Fallback to a local file at `GOOGLE_TOKENS_FILE_PATH` or ./google_tokens.json.
const TOKENS_FILE = process.env.GOOGLE_TOKENS_FILE_PATH || path.join(process.cwd(), 'google_tokens.json');

function createAwsClientIfConfigured(): SecretsManagerClient | null {
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION;
  if (!region || !process.env.GOOGLE_SECRET_NAME) {
    return null;
  }

  const credsPresent = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
  const clientConfig: any = { region };
  if (credsPresent) {
    clientConfig.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }
  return new SecretsManagerClient(clientConfig);
}

export async function storeToken(tokens: any): Promise<void> {
  if (!tokens) {
    return;
  }

  // 1) If GOOGLE_TOKENS env var exists we won't overwrite it programmatically.
  if (process.env.GOOGLE_TOKENS) {
    console.warn('GOOGLE_TOKENS env var is set, skipping programmatic store.');
    return;
  }

  // 2) Try AWS Secrets Manager if configured
  const awsClient = createAwsClientIfConfigured();
  const secretName = process.env.GOOGLE_SECRET_NAME;
  if (awsClient && secretName) {
    const secretString = JSON.stringify(tokens);
    try {
      // Try to update the secret value; if it doesn't exist, create it.
      const put = new PutSecretValueCommand({ SecretId: secretName, SecretString: secretString });
      await awsClient.send(put);
      return;
    } catch (putErr: any) {
      // If the secret doesn't exist, create it.
      if (putErr && putErr.name === 'ResourceNotFoundException') {
        try {
          const create = new CreateSecretCommand({ Name: secretName, SecretString: secretString });
          await awsClient.send(create);
          return;
        } catch (createErr) {
          console.error('Failed to create AWS secret for Google tokens:', createErr);
          // fallthrough to file fallback
        }
      } else {
        console.error('Failed to put secret value in AWS Secrets Manager:', putErr);
        // fallthrough to file fallback
      }
    }
  }

  // 3) File fallback
  try {
    await fs.promises.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2), { encoding: 'utf8' });
  } catch (err) {
    console.error('Failed to store Google tokens to file:', err);
    throw err;
  }
}

export async function getStoredToken(): Promise<any | null> {
  // 1) Env var
  if (process.env.GOOGLE_TOKENS) {
    try {
      return JSON.parse(process.env.GOOGLE_TOKENS);
    } catch (err) {
      console.warn('Failed to parse GOOGLE_TOKENS env var as JSON:', err);
    }
  }

  // 2) AWS Secrets Manager
  const awsClient = createAwsClientIfConfigured();
  const secretName = process.env.GOOGLE_SECRET_NAME;
  if (awsClient && secretName) {
    try {
      const get = new GetSecretValueCommand({ SecretId: secretName });
      const resp = await awsClient.send(get);
      if (resp && resp.SecretString) {
        return JSON.parse(resp.SecretString);
      }
    } catch (err) {
      console.error('Failed to read Google tokens from AWS Secrets Manager:', err);
      // fallthrough to file fallback
    }
  }

  // 3) File fallback
  try {
    const raw = await fs.promises.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    // File doesn't exist or can't be read — return null so callers can handle unauthenticated state.
    return null;
  }
}