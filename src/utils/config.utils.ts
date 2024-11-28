import { CommercetoolsConfig } from '../lib/commercetools/build.client';

export const readConfiguration = (): CommercetoolsConfig => {
  // Validate that all required environment variables are present
  const requiredEnvVars = [
    'CTP_PROJECT_KEY',
    'CTP_CLIENT_ID',
    'CTP_CLIENT_SECRET',
    'CTP_API_URL',
    'CTP_AUTH_URL',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }

  return {
    projectKey: process.env.CTP_PROJECT_KEY!,
    clientId: process.env.CTP_CLIENT_ID!,
    clientSecret: process.env.CTP_CLIENT_SECRET!,
    apiUrl: process.env.CTP_API_URL!,
    authUrl: process.env.CTP_AUTH_URL!,
    scopes: process.env.CTP_SCOPES?.split(',') || [],
  };
};