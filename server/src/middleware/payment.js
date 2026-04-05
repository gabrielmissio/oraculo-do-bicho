import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import env from '../config/env.js';

// USDC addresses for networks not covered by x402's built-in getDefaultAsset().
// Built-in list covers: Base, Base Sepolia, Polygon, Arbitrum One/Sepolia, Monad, MegaETH.
const CUSTOM_ASSETS = {
  'eip155:80002': { address: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', name: 'USDC', version: '2', decimals: 6 },
};

// Payments on these networks are settled by our self-hosted facilitator.
const CUSTOM_FACILITATOR_NETWORKS = new Set(['eip155:137', 'eip155:8453', 'eip155:80002']);

// All networks we accept, in preference order shown to clients.
// Base Sepolia → public facilitator; the rest → our custom facilitator.
const ACCEPTED_NETWORKS = ['eip155:137', 'eip155:8453', 'eip155:80002', 'eip155:84532'];

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

/**
 * Routes verify/settle to the correct facilitator based on the payment network.
 * Base Sepolia uses the public x402.org facilitator; all other supported networks
 * use our self-hosted facilitator.
 */
class RoutingFacilitatorClient {
  constructor(customClient, publicClient) {
    this._custom = customClient;
    this._public = publicClient;
  }
  _pick(payload) {
    const network = payload.accepted?.network ?? payload.network;
    const isCustom = CUSTOM_FACILITATOR_NETWORKS.has(network);
    console.log('[routing-facilitator] routing | network=%s -> %s facilitator', network, isCustom ? 'custom' : 'public');
    return isCustom ? this._custom : this._public;
  }
  /** Merge supported kinds from both facilitators so x402ResourceServer initializes correctly. */
  async getSupported() {
    const [custom, pub] = await Promise.allSettled([
      this._custom.getSupported(),
      this._public.getSupported(),
    ]);
    const kinds = [
      ...(custom.status === 'fulfilled' ? custom.value.kinds : []),
      ...(pub.status === 'fulfilled' ? pub.value.kinds : []),
    ];
    if (custom.status === 'rejected') console.warn('[routing-facilitator] getSupported custom failed:', custom.reason?.message);
    if (pub.status === 'rejected') console.warn('[routing-facilitator] getSupported public failed:', pub.reason?.message);
    return { kinds, extensions: [], signers: {} };
  }
  verify(paymentPayload, paymentRequirements) {
    console.log('[routing-facilitator] verify | network=%s amount=%s asset=%s payTo=%s',
      paymentPayload.accepted?.network ?? paymentPayload.network,
      paymentRequirements?.amount,
      paymentRequirements?.asset,
      paymentRequirements?.payTo,
    );
    return this._pick(paymentPayload).verify(paymentPayload, paymentRequirements);
  }
  settle(paymentPayload, paymentRequirements) {
    console.log('[routing-facilitator] settle | network=%s amount=%s asset=%s payTo=%s',
      paymentPayload.accepted?.network ?? paymentPayload.network,
      paymentRequirements?.amount,
      paymentRequirements?.asset,
      paymentRequirements?.payTo,
    );
    return this._pick(paymentPayload).settle(paymentPayload, paymentRequirements);
  }
}

function buildAccepts(price) {
  return ACCEPTED_NETWORKS.map(network => ({
    scheme: 'exact',
    network,
    payTo: env.EVM_ADDRESS,
    price,
  }));
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

  const customFacilitator = new HTTPFacilitatorClient({
    url: env.FACILITATOR_URL,
    ...(env.FACILITATOR_TOKEN && {
      createAuthHeaders: async () => ({
        headers: { Authorization: `Bearer ${env.FACILITATOR_TOKEN}` },
      }),
    }),
  });
  const publicFacilitator = new HTTPFacilitatorClient({ url: 'https://x402.org/facilitator' });
  const routingFacilitator = new RoutingFacilitatorClient(customFacilitator, publicFacilitator);

  const resourceServer = new x402ResourceServer(routingFacilitator);
  for (const network of ACCEPTED_NETWORKS) {
    resourceServer.register(network, makeScheme());
  }

  return paymentMiddleware(buildPayableRoutes(), resourceServer);
}
