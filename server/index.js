import app from './src/app.js';
import serverless from 'serverless-http';
import { loadCredentials } from './src/config/env.js';

// Fetch secrets from Secrets Manager once at cold start, before any request.
const initPromise = loadCredentials();

const _handler = serverless(app);

export const handler = async (event, context) => {
  await initPromise;
  return _handler(event, context);
};
