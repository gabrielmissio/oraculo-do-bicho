const env = require('./env');

const apiKeyMap = {
  openai: env.OPENAI_API_KEY,
  gemini: env.GEMINI_API_KEY,
};

const LLM_CONFIG = {
  provider: env.LLM_PROVIDER,
  apiKey: apiKeyMap[env.LLM_PROVIDER] || null,
  timeout: env.LLM_TIMEOUT
};

module.exports = LLM_CONFIG;
