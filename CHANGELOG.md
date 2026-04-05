# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).  
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- `CONTRIBUTING.md` with dev setup, branch strategy, and commit conventions
- `CHANGELOG.md` (this file)
- `.github/PULL_REQUEST_TEMPLATE.md` and issue templates (bug report, feature request)
- `docs/ASSESSMENT.md` — full repository quality and security assessment
- `docs/CHECKLIST.md` — actionable improvement checklist derived from assessment

### Security
- Prompt injection guard: `sanitizeUserInput()` in `promptService.js`; user input wrapped in `<user_input>` XML tags
- CORS locked to `ALLOWED_ORIGINS` env var (defaults to localhost in dev)
- LLM API keys moved to AWS Secrets Manager via `loadCredentials()` at Lambda cold-start; `SECRETS_ARN` SAM parameter + scoped IAM policy added
- Express body size capped at `16kb` (`express.json({ limit: '16kb' })`)
- Zod validation on all POST routes (`server/src/schemas/requests.js`, `validate()` middleware)

### Changed
- Gemini model updated from deprecated `gemini-pro` to `gemini-2.0-flash` (configurable via `GEMINI_MODEL` env var)
- `getLLMConfig()` is now a function instead of a frozen object, so lazily-loaded credentials are always reflected
- `server.js` local dev entrypoint fixed after `llm.js` refactor

---

## [3.0.0] — 2026-04-04

### Added
- x402 Protocol payment middleware (`@x402/express`) — POST endpoints gated behind USDC micropayments on Base Sepolia
- `useX402Fetch` React hook: handles 402 → EIP-3009 sign → retry flow without any x402 client SDK
- CloudFront + S3 frontend hosting via SAM/CloudFormation (OAC, fully private bucket, security headers policy, SPA fallback)
- API Gateway HTTP API v2 + Lambda (Node.js 24) backend via SAM
- OpenAPI 3.0.3 specification (`docs/spec/openapi.yaml`) with full x402 flow documentation
- `GEMINI_MODEL` / `OPENAI_MODEL` env vars for model selection
- npm workspaces monorepo (`server/` + `client/`)
- `dotenvx` for encrypted environment variable management

### Changed
- Full rewrite from v2; Express 5 + ESM modules throughout

---

## [2.0.0] — (internal)

Initial x402 proof-of-concept.

---

## [1.0.0] — (internal)

Initial API implementation with Gemini/OpenAI LLM interpretation.

[Unreleased]: https://github.com/gabrielmissio/oraculo-do-bicho/compare/v3.0.0...HEAD
[3.0.0]: https://github.com/gabrielmissio/oraculo-do-bicho/releases/tag/v3.0.0
