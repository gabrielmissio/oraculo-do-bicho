import app from './src/app.js';
import env from './src/config/env.js';

const port = env.PORT;

app.listen(port, () => {
  const networks = Object.keys(env.networks);
  console.log(`🔮 x402 facilitator listening on :${port}`);
  console.log(`   networks : ${networks.length > 0 ? networks.join(', ') : '(none configured)'}`);
});
