# Contributing to Oráculo do Bicho

First off — thanks for taking the time to contribute! This is an educational project, so clear and well-structured contributions are especially valued.

---

## Table of Contents

1. [Development setup](#1-development-setup)
2. [Branch strategy](#2-branch-strategy)
3. [Commit conventions](#3-commit-conventions)
4. [Submitting a PR](#4-submitting-a-pr)
5. [Code style](#5-code-style)
6. [Project structure cheat-sheet](#6-project-structure-cheat-sheet)

---

## 1. Development setup

**Prerequisites**

- Node.js 18+ (`node -v`)
- npm 8+ (`npm -v`)
- A free [Gemini API key](https://aistudio.google.com/) **or** an [OpenAI API key](https://platform.openai.com/api-keys)

**Steps**

```bash
git clone https://github.com/gabrielmissio/oraculo-do-bicho.git
cd oraculo-do-bicho
npm install --workspaces

# Server
cp server/.env.example server/.env
# edit server/.env and fill in your LLM API key

# Client
cp client/.env.example client/.env
# VITE_WALLETCONNECT_PROJECT_ID is optional for local dev

# Start both in watch mode
npm run dev
```

The frontend is available at `http://localhost:5173` and proxies `/api/*` to the server at `http://localhost:3001`.

> **⚠️ Never commit `.env` files.** `.gitignore` already excludes them; keep it that way.

---

## 2. Branch strategy

| Branch | Purpose |
|--------|---------|
| `main` | Stable, deployed code — never push directly |
| `develop` | Integration branch — merge feature branches here first |
| `feat/<name>` | New feature |
| `fix/<name>` | Bug fix |
| `chore/<name>` | Tooling, deps, CI changes |
| `docs/<name>` | Documentation only |

**Flow:** `feat/my-thing` → PR into `develop` → reviewed → merged → PR `develop` into `main` for release.

---

## 3. Commit conventions

This project follows [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>

[optional body]

[optional footer: Closes #issue]
```

Common types: `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `ci`

Examples:
```
feat(api): add rate limiting via API Gateway throttle
fix(client): handle 402 response when wallet is disconnected
docs: update CONTRIBUTING setup steps
chore(deps): bump zod to 3.25.0
```

---

## 4. Submitting a PR

1. Fork or branch off `develop`
2. Make your changes with focused, atomic commits
3. Open a PR against `develop` (not `main`)
4. Fill in the PR template — especially the checklist
5. Link the related issue (`Closes #N`)

PRs that add behaviour should include a test or explain clearly why one isn't needed.

---

## 5. Code style

- **ES Modules** (`"type": "module"`) in both workspaces — use `import`/`export`, not `require`
- 2-space indentation, single quotes, semicolons
- Keep functions small and focused
- Validate all user input at the route boundary using the Zod schemas in `server/src/schemas/`
- Never embed raw user input directly into LLM prompts — always pass through `sanitizeUserInput()`

---

## 6. Project structure cheat-sheet

```
oraculo-do-bicho/
├── server/src/
│   ├── config/        # env vars + LLM config + credentials loader
│   ├── data/          # static data (25 animals table)
│   ├── helpers/       # pure helpers (messages, meanings)
│   ├── middleware/     # payment.js, validate.js
│   ├── routes/        # all Express route handlers
│   ├── schemas/       # Zod request schemas
│   └── services/      # LLM calls + prompt building
└── client/src/
    ├── components/    # shared UI components
    ├── hooks/         # useX402Fetch (payment flow)
    ├── lib/           # constants, utils
    └── pages/         # one file per route
```
