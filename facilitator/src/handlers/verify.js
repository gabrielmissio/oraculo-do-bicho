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

  const start = Date.now();
  try {
    const result = await verifyEip3009(clients, paymentPayload, paymentRequirements);
    const ms = Date.now() - start;
    if (result.isValid) {
      console.log('[verify] ok | payer=%s network=%s ms=%d', result.payer, paymentPayload.accepted?.network, ms);
    } else {
      console.warn('[verify] rejected | reason=%s payer=%s network=%s ms=%d', result.invalidReason, result.payer, paymentPayload.accepted?.network, ms);
    }
    // Always 200 — @x402/core only reads the body on response.ok; 4xx/5xx are thrown as errors
    return res.status(200).json(result);
  } catch (err) {
    console.error('[verify] unexpected error after %dms:', Date.now() - start, err);
    return res.status(500).json({ isValid: false, invalidReason: 'InternalError' });
  }
}
