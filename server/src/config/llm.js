import env from './env.js';

const PROVIDER_FIELDS = {
  openai: { apiKey: 'OPENAI_API_KEY', model: 'OPENAI_MODEL' },
  gemini: { apiKey: 'GEMINI_API_KEY', model: 'GEMINI_MODEL' },
};

/**
 * Returns a fresh config snapshot from `env` on every call so that API keys
 * populated by loadCredentials() at cold-start are always reflected.
 */
export function getLLMConfig() {
  const fields = PROVIDER_FIELDS[env.LLM_PROVIDER];
  if (!fields) {
    console.warn(`⚠️ [llm] Unknown provider "${env.LLM_PROVIDER}", falling back to openai`);
  }
  const { apiKey, model } = fields ?? PROVIDER_FIELDS.openai;
  return {
    provider: env.LLM_PROVIDER,
    apiKey: env[apiKey],
    timeout: env.LLM_TIMEOUT,
    model: env[model],
  };
}

export default getLLMConfig;
