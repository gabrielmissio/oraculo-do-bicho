import express from 'express';
import cors from 'cors';
import routes from './src/routes/index.js';
import LLM_CONFIG from './src/config/llm.js';
import env from './src/config/env.js';
import { createPaymentMiddleware } from './src/middleware/payment.js';

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

app.listen(env.PORT, () => {
  console.log(`\n🎭 Oráculo do Bicho API v3 · http://localhost:${env.PORT}`);
  console.log(`🤖 LLM Provider : ${LLM_CONFIG.provider}`);
  console.log(
    `💳 x402 payments: ${
      env.EVM_ADDRESS
        ? `✅ active  network=${env.X402_NETWORK}  payTo=${env.EVM_ADDRESS}`
        : '⚠️  disabled  (set EVM_ADDRESS to enable)'
    }`,
  );
  console.log(`📖 Docs         : http://localhost:${env.PORT}\n`);
});

export default app;
