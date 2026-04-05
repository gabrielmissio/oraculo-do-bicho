import express from 'express';
import cors from 'cors';
import { supportedHandler } from './handlers/supported.js';
import { verifyHandler } from './handlers/verify.js';
import { settleHandler } from './handlers/settle.js';

const app = express();

app.use(cors());
app.use(express.json());

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
