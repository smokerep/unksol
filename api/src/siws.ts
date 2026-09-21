import nacl from 'tweetnacl';
import { PublicKey } from '@solana/web3.js';

const DOMAIN = 'unk';

/**
 * Builds the human-readable message the user will sign in their wallet.
 * NOTE: deliberately NOT in the formal SIWS shape ("<domain> wants you to sign
 * in with your Solana account:") — Phantom auto-detects that header and
 * strictly validates the whole message against the SIWS ABNF, rejecting ours
 * with "signature request cannot be shown due to invalid formatting".
 * A plain text message renders fine in every wallet.
 */
export function buildSignInMessage(wallet: string, nonce: string, issuedAt: string): string {
  return [
    `Sign in to ${DOMAIN} — the private layer.`,
    '',
    `Wallet: ${wallet}`,
    `Nonce: ${nonce}`,
    `Issued At: ${issuedAt}`,
    '',
    'This signature proves you own this wallet. It is free and creates no transaction.',
  ].join('\n');
}

/**
 * Verifies an ed25519 (Solana) signature over the message.
 * `signatureB64` is the signature encoded as base64 (see the frontend).
 */
export function verifySignature(message: string, signatureB64: string, wallet: string): boolean {
  try {
    const msgBytes = new TextEncoder().encode(message);
    const sigBytes = Buffer.from(signatureB64, 'base64');
    const pubkeyBytes = new PublicKey(wallet).toBytes();
    return nacl.sign.detached.verify(msgBytes, sigBytes, pubkeyBytes);
  } catch {
    return false;
  }
}
