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

// Request / response logger — structured for CloudWatch Logs Insights
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const ms = Date.now() - start;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'log';
    console[level]('[request]', JSON.stringify({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms,
      requestId: req.headers['x-amzn-requestid'] ?? undefined,
    }));
  });
  next();
});

// x402 payment middleware — gracefully disabled when EVM_ADDRESS is not set
const payment = createPaymentMiddleware();
if (payment) app.use(payment);

app.use(routes);

// Global error handler — catches unhandled errors from async route handlers (Express 5)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[unhandled-error]', JSON.stringify({
    method: req.method,
    path: req.path,
    error: err.message,
    stack: err.stack,
    requestId: req.headers['x-amzn-requestid'] ?? undefined,
  }));
  if (!res.headersSent) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

export default app;
