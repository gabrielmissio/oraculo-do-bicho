import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import env from '../config/env.js';

// USDC addresses for networks not in x402's default asset list.
// getDefaultAsset() covers: Base, Base Sepolia, Polygon, Arbitrum One/Sepolia, Monad, MegaETH.
const CUSTOM_ASSETS = {
  'eip155:80002': { address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', name: 'USDC', version: '2', decimals: 6 },
};

/** Build an ExactEvmScheme that falls back to CUSTOM_ASSETS for unknown networks. */
function makeScheme() {
  const scheme = new ExactEvmScheme();
  scheme.registerMoneyParser(async (amount, network) => {
    const asset = CUSTOM_ASSETS[network];
    if (!asset) return null; // let the default handler try
    const tokenAmount = String(Math.round(amount * Math.pow(10, asset.decimals)));
    return { amount: tokenAmount, asset: asset.address, extra: { name: asset.name, version: asset.version } };
  });
  return scheme;
}

function buildAccepts(price) {
  return [
    { scheme: 'exact', network: env.X402_NETWORK, payTo: env.EVM_ADDRESS, price },
  ];
}

function buildPayableRoutes() {
  const price = `$${env.PRICE_PER_REQUEST}`;
  const pricePalpite = `$${env.PRICE_PALPITE}`;

  return {
    'POST /interpretar': {
      accepts: buildAccepts(price),
      description:
        'Interpretação mística de qualquer input via LLM — sonhos, números, cores, frases ou qualquer sinal do cotidiano.',
      mimeType: 'application/json',
    },
    'POST /sonho': {
      accepts: buildAccepts(price),
      description: 'Interpretação onírica especializada — transforma seu sonho em palpite do jogo do bicho.',
      mimeType: 'application/json',
    },
    'POST /palpite': {
      accepts: buildAccepts(pricePalpite),
      description: 'Três palpites simultâneos via LLM baseados em contexto, data e energia cósmica.',
      mimeType: 'application/json',
    },
    'POST /numerologia': {
      accepts: buildAccepts(price),
      description: 'Análise numerológica personalizada — converte números e nomes em palpites.',
      mimeType: 'application/json',
    },
  };
}

export function createPaymentMiddleware() {
  if (!env.EVM_ADDRESS) {
    console.warn('⚠️  EVM_ADDRESS not configured — x402 payment protection disabled');
    return null;
  }

  const facilitator = new HTTPFacilitatorClient({
    url: env.FACILITATOR_URL,
    ...(env.FACILITATOR_TOKEN && {
      createAuthHeaders: async () => ({
        headers: { Authorization: `Bearer ${env.FACILITATOR_TOKEN}` },
      }),
    }),
  });
  const resourceServer = new x402ResourceServer(facilitator).register(
    env.X402_NETWORK,
    makeScheme(),
  );

  return paymentMiddleware(buildPayableRoutes(), resourceServer);
}
