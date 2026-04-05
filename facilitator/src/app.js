import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import { supportedHandler } from './handlers/supported.js';
import { verifyHandler } from './handlers/verify.js';
import { settleHandler } from './handlers/settle.js';

const app = express();

app.use(cors());
app.use(express.json());

// Bearer token auth — enforced when INTERNAL_TOKEN is set (production).
// /supported is a public discovery endpoint and is always open.
app.use((req, res, next) => {
  if (!env.INTERNAL_TOKEN || req.path === '/supported') return next();
  const auth = req.headers['authorization'] ?? '';
  if (auth !== `Bearer ${env.INTERNAL_TOKEN}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});

// Request logger
app.use((req, _res, next) => {
  if (req.path !== '/supported') {
    console.log(`\n→ ${req.method} ${req.path}`);
    if (Object.keys(req.body ?? {}).length) console.log(JSON.stringify(req.body, null, 2));
  }
  next();
});

// x402 facilitator endpoints
app.get('/supported', supportedHandler);
app.post('/verify', verifyHandler);
app.post('/settle', settleHandler);

export default app;
