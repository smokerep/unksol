import { getNonce, verify } from './api';

const TOKEN_KEY = 'unk.token';
const WALLET_KEY = 'unk.wallet';

/** Returns the persisted JWT; with `expectedWallet`, only if it was issued for it. */
export function loadToken(expectedWallet?: string): string | null {
  if (typeof window === 'undefined') return null;
  const token = window.localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  if (expectedWallet) {
    const saved = window.localStorage.getItem(WALLET_KEY);
    if (saved && saved !== expectedWallet) return null;
  }
  return token;
}

/** The wallet the persisted JWT belongs to (if any). */
export function savedWallet(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(WALLET_KEY);
}

export function saveToken(token: string, wallet: string): void {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(TOKEN_KEY, token);
    window.localStorage.setItem(WALLET_KEY, wallet);
  }
}

export function clearToken(): void {
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(TOKEN_KEY);
    window.localStorage.removeItem(WALLET_KEY);
  }
}

function toBase64(bytes: Uint8Array): string {
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

/**
 * Full Sign-in with Solana flow: nonce -> sign -> verify.
 * `signMessage` is the wallet adapter's ed25519 signer (bytes in, bytes out).
 * Persists the JWT together with its wallet and returns it.
 */
export async function requestSignIn(
  wallet: string,
  signMessage: (message: Uint8Array) => Promise<Uint8Array>,
): Promise<string> {
  const { message } = await getNonce(wallet);
  const signature = await signMessage(new TextEncoder().encode(message));
  const { token } = await verify(wallet, message, toBase64(signature));
  saveToken(token, wallet);
  return token;
}
