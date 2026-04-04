import express from 'express';
import cors from 'cors';
import routes from './routes/index.js';
import { createPaymentMiddleware } from './middleware/payment.js';

const app = express();

// Expose x402 response headers and allow the payment-signature request header
app.use(
  cors({
    exposedHeaders: ['PAYMENT-REQUIRED', 'PAYMENT-RESPONSE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'PAYMENT-SIGNATURE', 'X-Payment'],
  }),
);

app.use(express.json());

// x402 payment middleware — gracefully disabled when EVM_ADDRESS is not set
const payment = createPaymentMiddleware();
if (payment) app.use(payment);

app.use(routes);

export default app;
