/**
 * End-to-end smoke test for the backend (Solana auth).
 * Generates a Solana keypair, runs nonce -> sign -> verify -> status -> provision,
 * and checks that a bad signature is rejected.
 *
 *   npm run smoke        (with the server running on :4000)
 */
import nacl from 'tweetnacl';
import { Keypair } from '@solana/web3.js';

const API = process.env.API ?? 'http://127.0.0.1:4000';

const post = (path: string, body?: unknown, headers: Record<string, string> = {}) =>
  fetch(`${API}${path}`, {
    method: 'POST',
    headers: { ...(body ? { 'content-type': 'application/json' } : {}), ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });

async function main() {
  const keypair = Keypair.generate();
  const wallet = keypair.publicKey.toBase58();
  console.log('wallet:', wallet);

  // 1) nonce
  const nonceRes = await post('/auth/nonce', { wallet });
  if (!nonceRes.ok) throw new Error(`nonce failed: ${nonceRes.status}`);
  const { message } = (await nonceRes.json()) as { message: string };
  console.log('nonce ok');

  // 2) sign (ed25519 detached, base64 — same encoding as the web client)
  const sigBytes = nacl.sign.detached(new TextEncoder().encode(message), keypair.secretKey);
  const signature = Buffer.from(sigBytes).toString('base64');

  // 3) verify -> JWT
  const verifyRes = await post('/auth/verify', { wallet, message, signature });
  if (!verifyRes.ok) throw new Error(`verify failed: ${verifyRes.status} ${await verifyRes.text()}`);
  const { token } = (await verifyRes.json()) as { token: string };
  console.log('verify ok, jwt issued');

  const auth = { authorization: `Bearer ${token}` };

  // 4) status
  const statusRes = await fetch(`${API}/access/status`, { headers: auth });
  const status = await statusRes.json();
  console.log('status:', JSON.stringify(status));

  // 5) provision (may 403 when the gate is on and the wallet holds no tokens)
  const provRes = await post('/access/provision', {}, auth);
  console.log('provision:', provRes.status, provRes.ok ? '(config issued)' : '(expected 403 without tokens)');

  // 6) a bad signature must be rejected
  const nonce2 = await post('/auth/nonce', { wallet });
  const { message: message2 } = (await nonce2.json()) as { message: string };
  const badSig = Buffer.from(nacl.sign.detached(new TextEncoder().encode('tampered'), keypair.secretKey)).toString(
    'base64',
  );
  const badRes = await post('/auth/verify', { wallet, message: message2, signature: badSig });
  if (badRes.status !== 401) throw new Error(`bad signature was NOT rejected (got ${badRes.status})`);
  console.log('bad signature correctly rejected (401)');

  console.log('\nSMOKE PASSED');
}

main().catch((e) => {
  console.error('SMOKE FAILED:', e.message ?? e);
  process.exit(1);
});
