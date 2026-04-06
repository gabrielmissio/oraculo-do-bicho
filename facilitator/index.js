import app from './src/app.js';
import env from './src/config/env.js';
import serverless from 'serverless-http';

// Lambda cold-start marker — appears once per container in CloudWatch
if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
  console.log('[cold-start] facilitator initialized', JSON.stringify({
    function: process.env.AWS_LAMBDA_FUNCTION_NAME,
    networks: Object.keys(env.networks),
    hasSigner: !!env.PRIVATE_KEY,
    authEnabled: !!env.INTERNAL_TOKEN,
  }));
}
export const handler = serverless(app);

// Local development server (skipped on Lambda)
if (!process.env.AWS_LAMBDA_FUNCTION_NAME) {
  const port = env.PORT;
  app.listen(port, () => {
    const networks = Object.keys(env.networks);
    console.log(`🔮 x402 facilitator listening on :${port}`);
    console.log(`   networks : ${networks.length > 0 ? networks.join(', ') : '(none configured)'}`);
  });
}
