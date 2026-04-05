import clients from '../config/networks.js';
import { verifyEip3009 } from '../evm/eip3009.js';

/**
 * POST /verify
 *
 * Body: { x402Version, paymentPayload, paymentRequirements }
 * Response: { isValid, payer, invalidReason? }
 */
export async function verifyHandler(req, res) {
  const { paymentPayload, paymentRequirements } = req.body ?? {};

  if (!paymentPayload || !paymentRequirements) {
    return res.status(400).json({ isValid: false, invalidReason: 'MissingFields' });
  }

  try {
    const result = await verifyEip3009(clients, paymentPayload, paymentRequirements);
    if (!result.isValid) console.warn('[verify] rejected:', result.invalidReason, '| network:', paymentPayload.accepted?.network);
    // Always 200 — @x402/core only reads the body on response.ok; 4xx/5xx are thrown as errors
    return res.status(200).json(result);
  } catch (err) {
    console.error('[verify] unexpected error:', err);
    return res.status(500).json({ isValid: false, invalidReason: 'InternalError' });
  }
}
