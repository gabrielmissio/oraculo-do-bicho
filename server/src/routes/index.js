import { Router } from 'express';
import TABELA_COMPLETA from '../data/tabela.js';
import { interpretarComLLM } from '../services/llmService.js';
import { gerarMensagemOrientadora, obterSignificadoAnimal } from '../helpers/mensagens.js';
import getLLMConfig from '../config/llm.js';
import env from '../config/env.js';
import { validate } from '../middleware/validate.js';
import {
  InterpretarSchema,
  SonhoSchema,
  PalpiteSchema,
  NumerologiaSchema,
} from '../schemas/requests.js';

const router = Router();

// ── Discovery ────────────────────────────────────────────────────────────────
router.get('/', (_req, res) => {
  res.json({
    nome: 'API Místico dos Bichos v3 🎭',
    versao: '3.0.0',
    endpoints: [
      { path: '/interpretar', method: 'POST', desc: 'Interpretação principal (aceita qualquer input)', payable: true },
      { path: '/sonho', method: 'POST', desc: 'Especialista em interpretação de sonhos', payable: true },
      { path: '/palpite', method: 'POST', desc: 'Gera múltiplos palpites baseados em contexto', payable: true },
      { path: '/numerologia', method: 'POST', desc: 'Análise numerológica personalizada', payable: true },
      { path: '/tabela/animais', method: 'GET', desc: 'Tabela completa com significados', payable: false },
    ],
    pagamentos: env.EVM_ADDRESS
      ? { ativo: true, rede: env.X402_NETWORK, preco: `$${env.PRICE_PER_REQUEST} USDC` }
      : { ativo: false },
    aviso: '⚠️ 100% educacional',
  });
});

// ── Health ───────────────────────────────────────────────────────────────────
router.get('/health', (_req, res) => {
  res.json({
    status: 'online',
    llm_provider: getLLMConfig().provider,
    llm_status: getLLMConfig().apiKey ? 'configured' : 'using_emergency_mode',
    x402_active: !!env.EVM_ADDRESS,
    timestamp: new Date().toISOString(),
  });
});

// ── Tabela de Animais (free) ──────────────────────────────────────────────────
router.get('/tabela/animais', (_req, res) => {
  res.json({
    success: true,
    total_animais: 25,
    animais: Object.entries(TABELA_COMPLETA.animais).map(([id, nome]) => ({
      id: parseInt(id),
      nome,
      dezenas: TABELA_COMPLETA.grupos[nome],
      significado: `O ${nome} representa ${obterSignificadoAnimal(nome)} no imaginário popular.`,
    })),
  });
});

// ── POST /interpretar (payable) ───────────────────────────────────────────────
router.post('/interpretar', validate(InterpretarSchema), async (req, res) => {
  const { input, modalidade } = req.body;

  const startTime = Date.now();
  const interpretacao = await interpretarComLLM(input, modalidade);
  const tempoExecucao = Date.now() - startTime;

  const dezenaSorte = interpretacao.dezenas[Math.floor(Math.random() * interpretacao.dezenas.length)];
  const milharSugerida = `${dezenaSorte.toString().padStart(2, '0')}${Math.floor(Math.random() * 100).toString().padStart(2, '0')}`;

  res.json({
    success: true,
    metadata: {
      input_recebido: input,
      modalidade: modalidade || 'auto',
      timestamp: new Date().toISOString(),
      tempo_processamento_ms: tempoExecucao,
      fonte_interpretacao: interpretacao.source,
    },
    interpretacao: {
      tipo: interpretacao.tipo_interpretacao,
      animal: interpretacao.animal,
      grupo: interpretacao.grupo,
      dezenas: interpretacao.dezenas.map((d) => d.toString().padStart(2, '0')),
      justificativa: interpretacao.justificativa,
      confianca: interpretacao.confianca,
      variacoes: interpretacao.variacoes,
      curiosidade: interpretacao.curiosidade,
    },
    sugestoes_aposta: {
      grupo: { tipo: 'animal', valor: interpretacao.animal, multiplicador: '18x', aposta_minima: 2, premio_estimado: '36x o valor' },
      dezena: { tipo: 'dezena', valor: dezenaSorte.toString().padStart(2, '0'), multiplicador: '60x', aposta_minima: 1, premio_estimado: '60x o valor' },
      milhar_sugerida: { tipo: 'milhar', valor: milharSugerida, multiplicador: '4000x', aposta_minima: 0.5, premio_estimado: '2000x o valor' },
    },
    mensagem_orientadora: gerarMensagemOrientadora(interpretacao.confianca, interpretacao.animal),
  });
});

// ── POST /sonho (payable) ────────────────────────────────────────────────────
router.post('/sonho', validate(SonhoSchema), async (req, res) => {
  const { sonho, detalhes } = req.body;

  const contexto = detalhes ? `Detalhes adicionais: ${detalhes}` : '';
  const interpretacao = await interpretarComLLM(sonho, 'sonho', contexto);

  res.json({
    success: true,
    sonho,
    interpretacao_onirica: {
      simbolo_principal: interpretacao.animal,
      significado: interpretacao.justificativa,
      acao_recomendada: `Baseado neste sonho, considere apostar no ${interpretacao.animal} (Grupo ${interpretacao.grupo})`,
      forca_do_sinal:
        interpretacao.confianca === 'alta'
          ? '🌕 Muito forte'
          : interpretacao.confianca === 'media'
            ? '🌗 Moderada'
            : '🌑 Sutil',
    },
    mensagem_espiritual: `✨ Seu subconsciente escolheu o ${interpretacao.animal} como mensageiro. ${interpretacao.curiosidade}`,
  });
});

// ── POST /palpite (payable) ──────────────────────────────────────────────────
router.post('/palpite', validate(PalpiteSchema), async (req, res) => {
  const { contexto, data } = req.body;
  const dataReferencia = data || new Date().toISOString().split('T')[0];

  const palpites = await Promise.all([
    interpretarComLLM(contexto || 'palpite geral do dia', 'palpite'),
    interpretarComLLM(`baseado no dia ${dataReferencia}`, 'palpite'),
    interpretarComLLM('energia cósmica do momento', 'palpite'),
  ]);

  res.json({
    success: true,
    data: dataReferencia,
    contexto_usado: contexto || 'palpite geral',
    palpites_do_dia: palpites.map((p, idx) => ({
      id: idx + 1,
      animal: p.animal,
      grupo: p.grupo,
      dezenas: p.dezenas,
      justificativa: p.justificativa.substring(0, 150) + '...',
      forca: p.confianca,
    })),
    palpite_principal: {
      animal: palpites[0].animal,
      grupo: palpites[0].grupo,
      mensagem: `🎯 DESTAQUE DO DIA: ${palpites[0].animal} está com energia máxima!`,
    },
  });
});

// ── POST /numerologia (payable) ──────────────────────────────────────────────
router.post('/numerologia', validate(NumerologiaSchema), async (req, res) => {
  const { numeros, nome } = req.body;

  let inputNumerico = numeros ? numeros.join(' ') : '';
  if (nome) inputNumerico += ` nome: ${nome}`;

  const interpretacao = await interpretarComLLM(inputNumerico || 'numerologia geral', 'numerologia');
  const somaNumeros = numeros ? numeros.reduce((a, b) => a + b, 0) : null;

  res.json({
    success: true,
    numeros_analisados: numeros,
    nome_analisado: nome,
    resultado: {
      animal_da_sorte: interpretacao.animal,
      grupo: interpretacao.grupo,
      dezenas: interpretacao.dezenas,
      soma_numerologica: somaNumeros
        ? {
            valor: somaNumeros,
            reducao: somaNumeros % 9 || 9,
            animal_correspondente: TABELA_COMPLETA.animais[(somaNumeros % 25) + 1],
          }
        : null,
    },
    analise_completa: interpretacao.justificativa,
  });
});

// ── 404 Fallback ─────────────────────────────────────────────────────────────
const ROTAS_DISPONIVEIS = [
  { method: 'GET',  path: '/' },
  { method: 'GET',  path: '/health' },
  { method: 'GET',  path: '/tabela/animais' },
  { method: 'POST', path: '/interpretar' },
  { method: 'POST', path: '/sonho' },
  { method: 'POST', path: '/palpite' },
  { method: 'POST', path: '/numerologia' },
];

router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Rota não encontrada',
    rota_acessada: `${req.method} ${req.path}`,
    rotas_disponiveis: ROTAS_DISPONIVEIS.map(({ method, path }) => `${method} ${path}`),
  });
});

export default router;
