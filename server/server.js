import LLM_CONFIG from './src/config/llm.js';
import env from './src/config/env.js';
import app from './src/app.js';

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
