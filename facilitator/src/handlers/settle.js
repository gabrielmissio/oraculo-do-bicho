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

  try {
    const result = await settleEip3009(clients, paymentPayload, paymentRequirements);
    // Always 200 — @x402/core only reads the body on response.ok; 4xx/5xx are thrown as errors
    return res.status(200).json(result);
  } catch (err) {
    console.error('[settle] unexpected error:', err);
    return res.status(500).json({
      success: false,
      transaction: '',
      network: paymentPayload.network ?? '',
      payer: '',
      errorReason: 'InternalError',
    });
  }
}
