import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from "@aws-sdk/client-secrets-manager";

// Define the shape of the secret we expect from AWS Secrets Manager
interface DbSecret {
  username: string;
  password: string;
  host: string;
  port: number;
  engine: string;
}

// Define a generic type for the Cloudflare environment context
interface EventContext<Env = any, Params = any, Data = any> {
  env: Env;
}

// Cache the secret in the module scope to avoid refetching on every request
let cachedSecret: DbSecret | null = null;

/**
 * Fetches the database credentials from AWS Secrets Manager.
 * The secret is cached after the first successful fetch for the lifetime of the worker instance.
 * @param context - The Cloudflare Pages function context to access environment variables.
 * @returns The parsed database secret.
 */
export async function getDbSecret(context: EventContext<{ AWS_ACCESS_KEY_ID: string; AWS_SECRET_ACCESS_KEY: string; AWS_REGION: string; SECRET_NAME: string; }>): Promise<DbSecret> {
  if (cachedSecret) {
    return cachedSecret;
  }

  const { AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, SECRET_NAME } = context.env;

  if (!AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !AWS_REGION || !SECRET_NAME) {
    throw new Error("Missing required AWS environment variables for Secrets Manager.");
  }

  const client = new SecretsManagerClient({
    region: AWS_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_ACCESS_KEY,
    },
  });

  const command = new GetSecretValueCommand({ SecretId: SECRET_NAME });

  try {
    const response = await client.send(command);
    if (!response.SecretString) {
      throw new Error("SecretString is empty in AWS Secrets Manager response.");
    }
    
    const secret = JSON.parse(response.SecretString) as DbSecret;
    cachedSecret = secret; // Cache the successfully fetched secret
    return secret;
  } catch (error) {
    console.error("Failed to fetch secret from AWS Secrets Manager:", error);
    throw new Error("Could not retrieve database credentials.");
  }
}