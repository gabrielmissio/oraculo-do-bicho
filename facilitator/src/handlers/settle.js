import clients from '../config/networks.js';
import { FACILITATOR_ADDRESS } from '../config/networks.js';
import { settleEip3009 } from '../evm/eip3009.js';

/**
 * POST /settle
 *
 * Body: { x402Version, paymentPayload, paymentRequirements }
 * Response: { success, transaction, network, payer, errorReason? }
 */
export async function settleHandler(req, res) {
  if (!FACILITATOR_ADDRESS) {
    return res.status(501).json({
      success: false,
      transaction: '',
      network: req.body?.paymentPayload?.network ?? '',
      payer: '',
      errorReason: 'SettlementSignerNotConfigured',
    });
  }

  const { paymentPayload, paymentRequirements } = req.body ?? {};

  if (!paymentPayload || !paymentRequirements) {
    return res.status(400).json({
      success: false,
      transaction: '',
      network: '',
      payer: '',
      errorReason: 'MissingFields',
    });
  }

  const start = Date.now();
  try {
    const result = await settleEip3009(clients, paymentPayload, paymentRequirements);
    const ms = Date.now() - start;
    if (result.success) {
      console.log('[settle] success | tx=%s network=%s payer=%s ms=%d', result.transaction, result.network, result.payer, ms);
    } else {
      console.warn('[settle] failed | reason=%s network=%s payer=%s ms=%d', result.errorReason, result.network, result.payer, ms);
    }
    // Always 200 — @x402/core only reads the body on response.ok; 4xx/5xx are thrown as errors
    return res.status(200).json(result);
  } catch (err) {
    console.error('[settle] unexpected error after %dms:', Date.now() - start, err);
    return res.status(500).json({
      success: false,
      transaction: '',
      network: paymentPayload.network ?? '',
      payer: '',
      errorReason: 'InternalError',
    });
  }
}
