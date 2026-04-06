import clients, { FACILITATOR_ADDRESS } from '../config/networks.js';
import env from '../config/env.js';

/**
 * GET /supported
 *
 * Advertises which (scheme, network) pairs this facilitator can handle.
 * The x402 resource server calls this on startup to validate route config.
 */
export function supportedHandler(_req, res) {
  const kinds = Object.keys(env.networks).map((network) => ({
    x402Version: 2,
    scheme: 'exact',
    network,
  }));

  const signers = FACILITATOR_ADDRESS
    ? { eip155: [FACILITATOR_ADDRESS] }
    : {};

  res.json({ kinds, extensions: [], signers });
}
