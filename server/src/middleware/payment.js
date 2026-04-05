import { paymentMiddleware, x402ResourceServer } from '@x402/express';
import { ExactEvmScheme } from '@x402/evm/exact/server';
import { HTTPFacilitatorClient } from '@x402/core/server';
import env from '../config/env.js';

function buildPayableRoutes() {
  const price = `$${env.PRICE_PER_REQUEST}`;
  const pricePalpite = `$${env.PRICE_PALPITE}`;
  const base = { scheme: 'exact', network: env.X402_NETWORK, payTo: env.EVM_ADDRESS };

  return {
    'POST /interpretar': {
      accepts: [{ ...base, price }],
      description:
        'Interpretação mística de qualquer input via LLM — sonhos, números, cores, frases ou qualquer sinal do cotidiano.',
      mimeType: 'application/json',
    },
    'POST /sonho': {
      accepts: [{ ...base, price }],
      description: 'Interpretação onírica especializada — transforma seu sonho em palpite do jogo do bicho.',
      mimeType: 'application/json',
    },
    'POST /palpite': {
      accepts: [{ ...base, price: pricePalpite }],
      description: 'Três palpites simultâneos via LLM baseados em contexto, data e energia cósmica.',
      mimeType: 'application/json',
    },
    'POST /numerologia': {
      accepts: [{ ...base, price }],
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

  const facilitator = new HTTPFacilitatorClient({ url: env.FACILITATOR_URL });
  const resourceServer = new x402ResourceServer(facilitator).register(
    env.X402_NETWORK,
    new ExactEvmScheme(),
  );

  return paymentMiddleware(buildPayableRoutes(), resourceServer);
}
