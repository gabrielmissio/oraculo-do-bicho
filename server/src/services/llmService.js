import LLM_CONFIG from '../config/llm.js';
import TABELA_COMPLETA from '../data/tabela.js';
import { criarPromptInterpretacao, promptEmergencia } from './promptService.js';

function criarSignal() {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LLM_CONFIG.timeout);
  return { signal: controller.signal, clear: () => clearTimeout(timer) };
}

async function chamarLLM(prompt) {
  if (!LLM_CONFIG.apiKey && LLM_CONFIG.provider !== 'mock') {
    console.warn('⚠️ Sem API key, usando modo emergência criativa');
    return null;
  }

  const { signal, clear } = criarSignal();
  console.debug(`🔍 [llm] provider=${LLM_CONFIG.provider} promptLength=${prompt.length}`);

  try {
    let response;

    if (LLM_CONFIG.provider === 'openai') {
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${LLM_CONFIG.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.9,
          max_tokens: 500,
        }),
        signal,
      });
      if (!response.ok) {
        const corpo = await response.text().catch(() => '(sem corpo)');
        console.error(`❌ [openai] HTTP ${response.status}  ${corpo}`);
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.choices[0].message.content;
    } else if (LLM_CONFIG.provider === 'gemini') {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${LLM_CONFIG.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.9, maxOutputTokens: 500 },
          }),
          signal,
        },
      );
      if (!response.ok) {
        const corpo = await response.text().catch(() => '(sem corpo)');
        console.error(`❌ [gemini] HTTP ${response.status}  ${corpo}`);
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      return data.candidates[0].content.parts[0].text;
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`❌ [${LLM_CONFIG.provider}] Timeout após ${LLM_CONFIG.timeout}ms`);
    } else {
      console.error(`❌ [${LLM_CONFIG.provider}] ${error.message}`);
    }
    return null;
  } finally {
    clear();
  }
}

export async function interpretarComLLM(input, modalidade, contextoAdicional = '') {
  const prompt = criarPromptInterpretacao(input, modalidade, contextoAdicional);
  let respostaLLM = await chamarLLM(prompt);

  if (respostaLLM) {
    try {
      respostaLLM = respostaLLM.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      const parsed = JSON.parse(respostaLLM);

      if (TABELA_COMPLETA.animais[parsed.grupo] === parsed.animal) {
        return { source: 'llm', ...parsed };
      }

      console.warn('⚠️ LLM retornou animal inválido, usando emergência');
      return { source: 'emergencia_validacao', ...promptEmergencia(input, modalidade) };
    } catch (parseError) {
      console.error('❌ Erro ao parsear resposta da LLM:', parseError.message);
      return { source: 'emergencia_parse', ...promptEmergencia(input, modalidade) };
    }
  }

  console.log('🔄 Usando modo emergência criativa (LLM retornou null)');
  return { source: 'emergencia', ...promptEmergencia(input, modalidade) };
}
