import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { createPaymentMiddleware } from './middleware/payment.js';
import env from './config/env.js';

const app = express();

// Expose x402 response headers and allow the payment-signature request header
app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    exposedHeaders: ['PAYMENT-REQUIRED', 'PAYMENT-RESPONSE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'PAYMENT-SIGNATURE', 'X-Payment'],
  }),
);

// 16 kb is well above the largest valid payload (~1.8 kb) and well below
// Express's permissive 100 kb default — hardens against body-flooding attacks.
app.use(express.json({ limit: '16kb' }));

// x402 payment middleware — gracefully disabled when EVM_ADDRESS is not set
const payment = createPaymentMiddleware();
if (payment) app.use(payment);

app.use(routes);

export default app;
