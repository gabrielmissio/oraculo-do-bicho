import env from './env.js';

/**
 * Returns a fresh config snapshot from `env` on every call so that API keys
 * loaded lazily via loadCredentials() are always reflected.
 */
export function getLLMConfig() {
  return {
    provider: env.LLM_PROVIDER,
    apiKey: env.LLM_PROVIDER === 'openai' ? env.OPENAI_API_KEY : env.GEMINI_API_KEY,
    timeout: env.LLM_TIMEOUT,
    model: env.LLM_PROVIDER === 'openai' ? env.OPENAI_MODEL : env.GEMINI_MODEL,
  };
}

export default getLLMConfig;
