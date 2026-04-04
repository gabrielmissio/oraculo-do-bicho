const express = require('express');
const cors = require('cors');
const routes = require('./src/routes');
const LLM_CONFIG = require('./src/config/llm');
const env = require('./src/config/env');

const app = express();
const PORT = env.PORT;

app.use(cors());
app.use(express.json());
app.use(routes);

app.listen(PORT, () => {
  console.log(`\n🎭 API Místico dos Bichos v3 rodando em http://localhost:${PORT}`);
  console.log(`🤖 Provider: ${LLM_CONFIG.provider}`);
  console.log(`✨ Filosofia: SEMPRE interpretamos, nunca usamos fallback hardcoded`);
  console.log(`📖 Docs: http://localhost:${PORT}\n`);
});

module.exports = app;
