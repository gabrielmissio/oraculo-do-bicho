const env = {
  PORT: process.env.PORT || 3001,
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  LLM_TIMEOUT: Number(process.env.LLM_TIMEOUT) || 10000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
};

module.exports = env;
