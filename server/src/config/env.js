import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';

const env = {
  PORT: process.env.PORT || 3001,
  LLM_PROVIDER: process.env.LLM_PROVIDER || 'gemini',
  LLM_TIMEOUT: Number(process.env.LLM_TIMEOUT) || 10000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY || null,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || null,
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.0-flash',
  OPENAI_MODEL: process.env.OPENAI_MODEL || 'gpt-4o-mini',
  // x402
  EVM_ADDRESS: process.env.EVM_ADDRESS || null,
  FACILITATOR_URL: process.env.FACILITATOR_URL || 'https://x402.org/facilitator',
  PRICE_PER_REQUEST: process.env.PRICE_PER_REQUEST || '0.01',
  X402_NETWORK: process.env.X402_NETWORK || 'eip155:84532',
  // CORS
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map((s) => s.trim())
    : ['http://localhost:5173', 'http://localhost:4173'],
  // Secrets Manager
  SECRETS_ARN: process.env.SECRETS_ARN || null,
};

/**
 * Loads LLM API keys from AWS Secrets Manager at Lambda cold-start.
 * The secret must be a JSON object with GEMINI_API_KEY and/or OPENAI_API_KEY.
 * Falls back silently when SECRETS_ARN is not set (local development).
 */
export async function loadCredentials() {
  if (!env.SECRETS_ARN) return;

  try {
    const client = new SecretsManagerClient({});
    const { SecretString } = await client.send(
      new GetSecretValueCommand({ SecretId: env.SECRETS_ARN }),
    );
    const secrets = JSON.parse(SecretString);
    if (secrets.GEMINI_API_KEY) env.GEMINI_API_KEY = secrets.GEMINI_API_KEY;
    if (secrets.OPENAI_API_KEY) env.OPENAI_API_KEY = secrets.OPENAI_API_KEY;
  } catch (err) {
    console.error('❌ [secrets] Failed to load credentials from Secrets Manager:', err.message);
    // Non-fatal: fall back to process.env values (may be null in Lambda without SECRETS_ARN)
  }
}

export default env;
