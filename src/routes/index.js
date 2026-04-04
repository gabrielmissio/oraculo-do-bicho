const { Router } = require('express');
const TABELA_COMPLETA = require('../data/tabela');
const { interpretarComLLM } = require('../services/llmService');
const { gerarMensagemOrientadora, obterSignificadoAnimal } = require('../helpers/mensagens');
const LLM_CONFIG = require('../config/llm');

const router = Router();

router.get('/', (req, res) => {
  res.json({
    nome: "API Místico dos Bichos v3 - Sem Hardcode 🎭",
    versao: "3.0.0",
    filosofía: "Nunca usamos fallback hardcoded - sempre geramos interpretações criativas baseadas no input",
    endpoints: [
      { path: "/interpretar", method: "POST", desc: "Interpretação principal (aceita qualquer input)" },
      { path: "/sonho", method: "POST", desc: "Especialista em interpretação de sonhos" },
      { path: "/palpite", method: "POST", desc: "Gera múltiplos palpites baseados em contexto" },
      { path: "/numerologia", method: "POST", desc: "Análise numerológica personalizada" },
      { path: "/tabela/animais", method: "GET", desc: "Tabela completa com significados" }
    ],
    exemplos: {
      interpretar_sonho: {
        curl: `curl -X POST http://localhost:3001/interpretar \\\n  -H "Content-Type: application/json" \\\n  -d '{"input":"sonhei que nadava com golfinhos", "modalidade":"sonho"}'`
      },
      palpite_custom: {
        curl: `curl -X POST http://localhost:3001/palpite \\\n  -H "Content-Type: application/json" \\\n  -d '{"contexto":"hoje é dia de sorte para quem nasceu em agosto"}'`
      }
    },
    aviso: "⚠️ 100% educacional - Sempre geramos respostas criativas sem fallback fixo!"
  });
});

router.get('/health', (req, res) => {
  res.json({
    status: "online",
    llm_provider: LLM_CONFIG.provider,
    llm_status: LLM_CONFIG.apiKey ? "configured" : "using_emergency_mode",
    timestamp: new Date().toISOString()
  });
});

router.get('/tabela/animais', (req, res) => {
  res.json({
    success: true,
    total_animais: 25,
    animais: Object.entries(TABELA_COMPLETA.animais).map(([id, nome]) => ({
      id: parseInt(id),
      nome,
      dezenas: TABELA_COMPLETA.grupos[nome],
      significado: `O ${nome} representa ${obterSignificadoAnimal(nome)} no imaginário popular.`
    }))
  });
});

router.post('/interpretar', async (req, res) => {
  const { input, modalidade } = req.body;

  if (!input) {
    return res.status(400).json({ success: false, message: "Forneça um 'input' para interpretação" });
  }

  const startTime = Date.now();
  const interpretacao = await interpretarComLLM(input, modalidade);
  const tempoExecucao = Date.now() - startTime;

  const dezenaSorte = interpretacao.dezenas[Math.floor(Math.random() * interpretacao.dezenas.length)];
  const milharSugerida = `${dezenaSorte.toString().padStart(2, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

  res.json({
    success: true,
    metadata: {
      input_recebido: input,
      modalidade: modalidade || "auto",
      timestamp: new Date().toISOString(),
      tempo_processamento_ms: tempoExecucao,
      fonte_interpretacao: interpretacao.source
    },
    interpretacao: {
      tipo: interpretacao.tipo_interpretacao,
      animal: interpretacao.animal,
      grupo: interpretacao.grupo,
      dezenas: interpretacao.dezenas.map(d => d.toString().padStart(2, '0')),
      justificativa: interpretacao.justificativa,
      confianca: interpretacao.confianca,
      variacoes: interpretacao.variacoes,
      curiosidade: interpretacao.curiosidade
    },
    sugestoes_aposta: {
      grupo: {
        tipo: "animal",
        valor: interpretacao.animal,
        multiplicador: "18x",
        aposta_minima: 2,
        premio_estimado: "36x o valor"
      },
      dezena: {
        tipo: "dezena",
        valor: dezenaSorte.toString().padStart(2, '0'),
        multiplicador: "60x",
        aposta_minima: 1,
        premio_estimado: "60x o valor"
      },
      milhar_sugerida: {
        tipo: "milhar",
        valor: milharSugerida,
        multiplicador: "4000x",
        aposta_minima: 0.50,
        premio_estimado: "2000x o valor"
      }
    },
    mensagem_orientadora: gerarMensagemOrientadora(interpretacao.confianca, interpretacao.animal)
  });
});

router.post('/sonho', async (req, res) => {
  const { sonho, detalhes } = req.body;

  if (!sonho) {
    return res.status(400).json({ success: false, message: "Descreva seu sonho para interpretação" });
  }

  const contexto = detalhes ? `Detalhes adicionais: ${detalhes}` : "";
  const interpretacao = await interpretarComLLM(sonho, "sonho", contexto);

  res.json({
    success: true,
    sonho,
    interpretacao_onirica: {
      simbolo_principal: interpretacao.animal,
      significado: interpretacao.justificativa,
      acao_recomendada: `Baseado neste sonho, considere apostar no ${interpretacao.animal} (Grupo ${interpretacao.grupo})`,
      forca_do_sinal: interpretacao.confianca === "alta" ? "🌕 Muito forte" :
                      interpretacao.confianca === "media" ? "🌗 Moderada" : "🌑 Sutil"
    },
    mensagem_espiritual: `✨ Seu subconsciente escolheu o ${interpretacao.animal} como mensageiro. ${interpretacao.curiosidade}`
  });
});

router.post('/palpite', async (req, res) => {
  const { contexto, data } = req.body;
  const dataReferencia = data || new Date().toISOString().split('T')[0];

  const palpites = await Promise.all([
    interpretarComLLM(contexto || "palpite geral do dia", "palpite"),
    interpretarComLLM(`baseado no dia ${dataReferencia}`, "palpite"),
    interpretarComLLM(`energia cósmica do momento`, "palpite")
  ]);

  res.json({
    success: true,
    data: dataReferencia,
    contexto_usado: contexto || "palpite geral",
    palpites_do_dia: palpites.map((p, idx) => ({
      id: idx + 1,
      animal: p.animal,
      grupo: p.grupo,
      dezenas: p.dezenas,
      justificativa: p.justificativa.substring(0, 150) + "...",
      forca: p.confianca
    })),
    palpite_principal: {
      animal: palpites[0].animal,
      grupo: palpites[0].grupo,
      mensagem: `🎯 DESTAQUE DO DIA: ${palpites[0].animal} está com energia máxima!`
    }
  });
});

router.post('/numerologia', async (req, res) => {
  const { numeros, nome } = req.body;

  let inputNumerico = numeros ? numeros.join(' ') : "";
  if (nome) inputNumerico += ` nome: ${nome}`;

  const interpretacao = await interpretarComLLM(inputNumerico || "numerologia geral", "numerologia");
  const somaNumeros = numeros ? numeros.reduce((a, b) => a + b, 0) : null;

  res.json({
    success: true,
    numeros_analisados: numeros,
    nome_analisado: nome,
    resultado: {
      animal_da_sorte: interpretacao.animal,
      grupo: interpretacao.grupo,
      dezenas: interpretacao.dezenas,
      soma_numerologica: somaNumeros ? {
        valor: somaNumeros,
        reducao: somaNumeros % 9 || 9,
        animal_correspondente: TABELA_COMPLETA.animais[(somaNumeros % 25) + 1]
      } : null
    },
    analise_completa: interpretacao.justificativa
  });
});

module.exports = router;
