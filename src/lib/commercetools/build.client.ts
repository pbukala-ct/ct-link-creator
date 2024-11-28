// src/lib/commercetools/build.client.ts
import { 
  ClientBuilder,
  AuthMiddlewareOptions,
  HttpMiddlewareOptions 
} from '@commercetools/sdk-client-v2';

export interface CommercetoolsConfig {
  projectKey: string;
  clientId: string;
  clientSecret: string;
  apiUrl: string;
  authUrl: string;
  scopes: string[];
}

function getConfig(): CommercetoolsConfig {
  if (!process.env.CTP_PROJECT_KEY) {
    console.error('Environment variables:', {
      projectKey: process.env.CTP_PROJECT_KEY,
      apiUrl: process.env.CTP_API_URL,
      authUrl: process.env.CTP_AUTH_URL,
    });
    throw new Error('Missing required environment variables');
  }

  return {
    projectKey: process.env.CTP_PROJECT_KEY,
    clientId: process.env.CTP_CLIENT_ID!,
    clientSecret: process.env.CTP_CLIENT_SECRET!,
    apiUrl: process.env.CTP_API_URL!,
    authUrl: process.env.CTP_AUTH_URL!,
    scopes: [process.env.CTP_SCOPE || `manage_project:${process.env.CTP_PROJECT_KEY}`],
  };
}

export const createClient = () => {
  const config = getConfig();
  
  return new ClientBuilder()
    .withProjectKey(config.projectKey)
    .withClientCredentialsFlow({
      host: config.authUrl,
      projectKey: config.projectKey,
      credentials: {
        clientId: config.clientId,
        clientSecret: config.clientSecret,
      },
      scopes: config.scopes,
      fetch
    })
    .withHttpMiddleware({
      host: config.apiUrl,
      fetch
    })
    .build();
};