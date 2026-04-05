# Repository Improvement Checklist

> Derived from [ASSESSMENT.md](./ASSESSMENT.md).  
> **Legend**: ✅ Done · 🚧 Partial · ⬜ Not started

---

## 🚨 Critical Security

| ID | Item | Status | Notes |
|----|------|--------|-------|
| SEC-01 | Rotate leaked OpenAI API key | ✅ | Key rotated by user, root `.env` deleted |
| SEC-01 | Delete root-level `.env` | ✅ | File removed |
| SEC-01 | Encrypt `.env` with `dotenvx encrypt` | ✅ | Run in `server/` |
| SEC-01 | Harden `.gitignore` (`**/.env`, `!**/.env.example`) | ⬜ | |
| SEC-02 | Prompt injection — sanitize user inputs | ✅ | `sanitizeUserInput()` in `promptService.js`; user input wrapped in `<user_input>` XML tags |
| SEC-03 | Rate limiting | ✅ | Evaluated: API Gateway throttle + WAF is the correct layer; no Express middleware needed |

---

## ⚠️ Security — Medium

| ID | Item | Status | Notes |
|----|------|--------|-------|
| SEC-04 | Restrict CORS `origin` | ✅ | `ALLOWED_ORIGINS` env var; defaults to `localhost:5173,4173` for dev |
| SEC-05 | Move API keys to Secrets Manager | ✅ | `loadCredentials()` in `env.js`; `SECRETS_ARN` param in SAM template; Lambda IAM policy scoped to `oraculo-do-bicho*` |
| SEC-06 | Express body size limit (`express.json({ limit })`) | ✅ | `limit: '16kb'` hardcoded in `app.js` — security constant, not operator config |
| SEC-07 | Validate `numeros` array in `/numerologia` | ✅ | `NumerologiaSchema` (Zod): array, `number().finite().safe()`, max 50 elements |
| SEC-08 | Replace deprecated `gemini-pro` model | ✅ | Default changed to `gemini-2.0-flash`, configurable via `GEMINI_MODEL` env var |
| SEC-09 | Add `SECURITY.md` | ⬜ | |

---

## 🔵 Code Quality

| ID | Item | Status | Notes |
|----|------|--------|-------|
| CQ-01 | Unit + integration tests | ⬜ | |
| CQ-02 | ESLint + Prettier + EditorConfig | ⬜ | |
| CQ-03 | React Error Boundary | ⬜ | |
| CQ-04 | Structured logging (pino / Powertools) | ⬜ | |
| CQ-05 | WalletConnect project ID startup assertion | ⬜ | |
| CQ-06 | `Promise.all` outer timeout on `/palpite` | ⬜ | |
| CQ-07 | Delete root `.env` | ✅ | Done (SEC-01) |
| CQ-08 | Remove dead `dev:legacy` npm script | ⬜ | `server.js` exists and works; script can stay, but should be documented |
| —    | Fix `server.js` broken after `llm.js` refactor | ✅ | `LLM_CONFIG` → `getLLMConfig()` call |
| —    | Zod validation on all POST routes | ✅ | `validate()` middleware + schemas in `server/src/schemas/requests.js` |

---

## 🏗️ Infrastructure / IaC

| ID | Item | Status | Notes |
|----|------|--------|-------|
| INFRA-01 | Secrets Manager (same as SEC-05) | ✅ | |
| INFRA-02 | CloudWatch Alarms in SAM template | ⬜ | |
| INFRA-03 | S3 `DeletionPolicy: Retain` + lifecycle rules | ⬜ | |
| INFRA-04 | WAF WebACL | ⬜ | Noted as future concern; low priority for testnet |
| INFRA-05 | Lambda memory tuning (256 MB → profile) | ⬜ | |
| INFRA-06 | API Gateway per-route throttling | ⬜ | |
| INFRA-07 | `samconfig.yml` — no secrets, non-sensitive overrides only | ✅ | Already the case; just needs to stay clean |

---

## 🌿 Git & Repository Practices

| ID | Item | Status | Notes |
|----|------|--------|-------|
| GIT-01 | Complete `.gitignore` (OS artifacts, coverage, logs, `.env.keys`) | ⬜ | |
| GIT-02 | PR and issue templates (`.github/`) | ✅ | `PULL_REQUEST_TEMPLATE.md`, `bug_report.md`, `feature_request.md` |
| GIT-03 | `CONTRIBUTING.md` | ✅ | Dev setup, branch strategy, commit conventions, structure cheat-sheet |
| GIT-04 | `commitlint` + `husky` | ⬜ | |
| GIT-05 | `CHANGELOG.md` | ✅ | Keep a Changelog format; seeded with full history |
| GIT-06 | Branch protection rules on `main` | ⬜ | |

---

## ⚙️ CI/CD & Automation

| ID | Item | Status | Notes |
|----|------|--------|-------|
| CI-01 | GitHub Actions: `ci.yml` (lint + test on PR) | ⬜ | |
| CI-01 | GitHub Actions: `deploy.yml` (SAM + S3 sync on merge) | ⬜ | |
| CI-01 | OIDC for AWS credentials in CI | ⬜ | |
| CI-02 | Dependabot (`dependabot.yml`) | ⬜ | |
| CI-03 | GitHub secret scanning enabled | ⬜ | |

---

## 📦 Dependencies

| ID | Item | Status | Notes |
|----|------|--------|-------|
| DEP-01 | Deprecated `gemini-pro` model (same as SEC-08) | ✅ | |
| DEP-02 | Pin `express` minor version | ⬜ | Low priority |
| DEP-03 | Use `npm ci` in CI (not `npm install`) | ⬜ | Pending CI setup |
| DEP-04 | Update `lucide-react` to latest | ⬜ | Low priority; Dependabot will handle |

---

## 📄 Documentation

| ID | Item | Status | Notes |
|----|------|--------|-------|
| DOC-01 | Fix `doc/` → `docs/` typo in README | ⬜ | |
| DOC-02 | Architecture diagram in `docs/` | ⬜ | |
| DOC-03 | Add production server URL to OpenAPI spec | ⬜ | |
| DOC-04 | `CONTRIBUTING.md` (same as GIT-03) | ⬜ | |
| SEC-09 | `SECURITY.md` | ⬜ | |

---

## Progress Summary

| Category | Done | Partial | Total |
|----------|------|---------|-------|
| 🚨 Critical | 5/6 | 0 | 6 |
| ⚠️ Medium | 5/6 | 0 | 6 |
| 🔵 Code Quality | 3/10 | 0 | 10 |
| 🏗️ Infrastructure | 2/7 | 0 | 7 |
| 🌿 Git | 3/6 | 0 | 6 |
| ⚙️ CI/CD | 0/5 | 0 | 5 |
| 📦 Dependencies | 1/4 | 0 | 4 |
| 📄 Documentation | 0/5 | 0 | 5 |
| **Total** | **19/49** | **0** | **49** |
