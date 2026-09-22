import { describe, expect, it } from 'vitest';
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';
import { buildSignInMessage, verifySignature } from '../src/siws';

function sign(message: string, kp: Keypair): string {
  return Buffer.from(nacl.sign.detached(new TextEncoder().encode(message), kp.secretKey)).toString(
    'base64',
  );
}

describe('SIWS sign-in', () => {
  const kp = Keypair.generate();
  const wallet = kp.publicKey.toBase58();
  const issuedAt = '2026-09-22T10:00:00.000Z';
  const nonce = 'a'.repeat(32);
  const message = buildSignInMessage(wallet, nonce, issuedAt);

  it('builds a deterministic message that embeds wallet, nonce and issuedAt', () => {
    expect(message).toContain(`Wallet: ${wallet}`);
    expect(message).toContain(`Nonce: ${nonce}`);
    expect(message).toContain(`Issued At: ${issuedAt}`);
    expect(buildSignInMessage(wallet, nonce, issuedAt)).toBe(message);
  });

  it('accepts a valid ed25519 signature over the exact message', () => {
    expect(verifySignature(message, sign(message, kp), wallet)).toBe(true);
  });

  it('rejects a signature over a DIFFERENT message', () => {
    const other = sign('something else entirely', kp);
    expect(verifySignature(message, other, wallet)).toBe(false);
  });

  it('rejects a tampered message', () => {
    const sig = sign(message, kp);
    expect(verifySignature(message.replace('Nonce', 'Nonce!'), sig, wallet)).toBe(false);
  });

  it('rejects a signature from a different wallet', () => {
    const attacker = Keypair.generate();
    expect(verifySignature(message, sign(message, attacker), wallet)).toBe(false);
  });

  it('rejects garbage signatures and invalid wallets without throwing', () => {
    expect(verifySignature(message, 'not-base64!!!', wallet)).toBe(false);
    expect(verifySignature(message, sign(message, kp), 'not-a-wallet')).toBe(false);
  });
});
