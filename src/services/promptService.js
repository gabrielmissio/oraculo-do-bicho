const TABELA_COMPLETA = require('../data/tabela');

function criarPromptInterpretacao(input, modalidade, contextoAdicional = "") {
  return `
Você é um místico especialista em interpretação de sinais para o "jogo do bicho" (contexto cultural brasileiro).

INPUT DO USUÁRIO: "${input}"
MODALIDADE: ${modalidade || "automática (decida baseado no input)"}
${contextoAdicional}

REGRAS IMPORTANTES:
1. Use APENAS os 25 animais oficiais: ${Object.values(TABELA_COMPLETA.animais).join(", ")}
2. Cada animal tem 4 dezenas específicas (vide tabela abaixo)
3. Seja CRIATIVO mas FUNDAMENTADO na cultura brasileira
4. SEMPRE forneça uma justificativa detalhada e convincente
5. NUNCA diga "não sei" - encontre conexões criativas

TABELA DE REFERÊNCIA:
${Object.entries(TABELA_COMPLETA.animais).map(([id, nome]) =>
  `${nome} (Grupo ${id}): dezenas ${TABELA_COMPLETA.grupos[nome].join(", ")}`
).join("\n")}

Responda APENAS com JSON neste formato EXATO:
{
  "tipo_interpretacao": "sonho|placa|palpite|numero|data|cor|generalizado",
  "animal": "nome_do_animal",
  "grupo": numero_do_grupo,
  "dezenas": [numero1, numero2, numero3, numero4],
  "justificativa": "explicação detalhada e criativa (mínimo 30 palavras)",
  "confianca": "alta|media|baixa",
  "variacoes": {
    "alternativa1": "animal_sugestao",
    "alternativa2": "animal_sugestao"
  },
  "curiosidade": "fato interessante sobre este animal no jogo do bicho"
}

Lembre-se: seja criativo, culturalmente relevante e sempre justifique sua escolha!
`;
}

function promptEmergencia(input, modalidade) {
  const numerosEncontrados = input.match(/\d+/g);
  const numeroBase = numerosEncontrados ? parseInt(numerosEncontrados[0]) : null;

  if (numeroBase) {
    const grupoCalculado = (numeroBase % 25) + 1;
    const animalBase = TABELA_COMPLETA.animais[grupoCalculado];

    return {
      tipo_interpretacao: "numerica",
      animal: animalBase,
      grupo: grupoCalculado,
      dezenas: TABELA_COMPLETA.grupos[animalBase],
      justificativa: `✨ ANALISANDO SEUS NÚMEROS: Encontrei o número ${numeroBase} em sua mensagem. Na numerologia do jogo do bicho, este número ressoa com o grupo ${grupoCalculado} (${animalBase}). A energia vibracional do ${numeroBase} está fortemente alinhada com as características deste animal místico.`,
      confianca: "media",
      variacoes: {
        alternativa1: TABELA_COMPLETA.animais[(grupoCalculado + 3) % 25 + 1],
        alternativa2: TABELA_COMPLETA.animais[(grupoCalculado + 7) % 25 + 1]
      },
      curiosidade: `O ${animalBase} é conhecido no jogo do bicho por trazer sorte quando aparece em contextos numéricos.`
    };
  }

  const primeiraPalavra = input.split(' ')[0].toLowerCase();
  const somaLetras = primeiraPalavra.split('').reduce((sum, letra) => sum + letra.charCodeAt(0), 0);
  const grupoFonetico = (somaLetras % 25) + 1;
  const animalFonetico = TABELA_COMPLETA.animais[grupoFonetico];

  return {
    tipo_interpretacao: "fonetica",
    animal: animalFonetico,
    grupo: grupoFonetico,
    dezenas: TABELA_COMPLETA.grupos[animalFonetico],
    justificativa: `🔮 INTERPRETAÇÃO MÍSTICA: Sua mensagem começa com a palavra "${primeiraPalavra}". Analisando sua vibração energética através da fonética quântica, esta palavra ressoa com o ${animalFonetico} (Grupo ${grupoFonetico}). As letras emitem frequências que se alinham perfeitamente com as características deste animal no universo do jogo do bicho.`,
    confianca: "baixa",
    variacoes: {
      alternativa1: TABELA_COMPLETA.animais[(grupoFonetico + 5) % 25 + 1],
      alternativa2: TABELA_COMPLETA.animais[(grupoFonetico + 13) % 25 + 1]
    },
    curiosidade: `A cultura popular brasileira acredita que palavras com sons guturais remetem a animais terrestres, enquanto sons agudos remetem a aves.`
  };
}

module.exports = { criarPromptInterpretacao, promptEmergencia };
