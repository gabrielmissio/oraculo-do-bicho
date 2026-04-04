const SIGNIFICADOS = {
  "Avestruz": "fuga e ilusão", "Águia": "visão e poder", "Cachorro": "lealdade e amizade",
  "Cobra": "sabedoria e perigo", "Macaco": "inteligência e travessura", "Leão": "liderança e força",
  "Gato": "mistério e independência", "Jacaré": "paciência e perigo", "Tigre": "paixão e força",
  "Vaca": "prosperidade e abundância", "Borboleta": "transformação e leveza"
};

function obterSignificadoAnimal(animal) {
  return SIGNIFICADOS[animal] || "características únicas no zodíaco dos bichos";
}

function gerarMensagemOrientadora(confianca, animal) {
  const mensagens = {
    alta: [
      `🌟 Conexão forte com o ${animal}! Os sinais estão alinhados.`,
      `✨ Energia muito positiva! O ${animal} é seu guia hoje.`,
      `🎯 Interpretação com alto nível de precisão espiritual.`
    ],
    media: [
      `🔮 Sinais moderados para o ${animal}. Vale observar coincidências.`,
      `💫 O ${animal} aparece em seus caminhos - preste atenção.`,
      `🍃 Boa intuição para o ${animal}, mas mantenha os pés no chão.`
    ],
    baixa: [
      `🤔 O ${animal} surge como possibilidade, mas os sinais estão sutis.`,
      `🌙 Conexão tênue com o ${animal} - confie mais na sua intuição.`,
      `💭 O ${animal} é uma das interpretações possíveis. Medite mais.`
    ]
  };

  const lista = mensagens[confianca] || mensagens.baixa;
  return lista[Math.floor(Math.random() * lista.length)];
}

module.exports = { obterSignificadoAnimal, gerarMensagemOrientadora };
