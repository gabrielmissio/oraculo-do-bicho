const env = {
  PORT: process.env.PORT || 3001,
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  LLM_TIMEOUT: Number(process.env.LLM_TIMEOUT) || 10000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  // x402
  EVM_ADDRESS: process.env.EVM_ADDRESS || null,
  FACILITATOR_URL: process.env.FACILITATOR_URL || 'http://localhost:3002',
  PRICE_PER_REQUEST: process.env.PRICE_PER_REQUEST || '0.10',
  PRICE_PALPITE: process.env.PRICE_PALPITE || '0.25',
  X402_NETWORK: process.env.X402_NETWORK || 'eip155:84532',
};

export default env;
