// src/lib/commercetools/create.client.ts
import { createApiBuilderFromCtpClient } from '@commercetools/platform-sdk';
import { createClient } from './build.client';

// Singleton pattern for API root
let apiRoot: ReturnType<typeof createApiBuilderFromCtpClient> | undefined;

export const createApiRoot = () => {
  if (apiRoot) {
    return apiRoot.withProjectKey({ projectKey: process.env.CTP_PROJECT_KEY! });
  }

  apiRoot = createApiBuilderFromCtpClient(createClient());
  return apiRoot.withProjectKey({ projectKey: process.env.CTP_PROJECT_KEY! });
};