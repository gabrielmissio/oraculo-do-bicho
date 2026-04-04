import app from './src/app.js';
import serverless from "serverless-http";

export const handler = serverless(app);
