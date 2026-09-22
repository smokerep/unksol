import { describe, expect, it } from 'vitest';
import { buildClientConfig, generateKeyPair } from '../src/wireguard';
import type { Region } from '../src/regions';

const WG_KEY = /^[A-Za-z0-9+/]{43}=$/;

const REGION: Region = {
  id: 'fr',
  name: 'France',
  flag: '🇫🇷',
  city: 'Paris',
  endpoint: '203.0.113.10:51820',
  serverPublicKey: 'S'.repeat(43) + '=',
  clientSubnet: '10.8.0.0/24',
  dns: '9.9.9.9',
  control: { kind: 'mock' },
};

describe('wireguard', () => {
  it('generates valid Curve25519 keypairs in wg format', () => {
    const a = generateKeyPair();
    const b = generateKeyPair();
    expect(a.publicKey).toMatch(WG_KEY);
    expect(a.privateKey).toMatch(WG_KEY);
    expect(a.publicKey).not.toBe(a.privateKey);
    expect(a.publicKey).not.toBe(b.publicKey); // fresh keys every time
  });

  it('builds a complete client config for the region', () => {
    const cfg = buildClientConfig(REGION, 'P'.repeat(43) + '=', '10.8.0.7/32');
    expect(cfg).toContain('[Interface]');
    expect(cfg).toContain('Address = 10.8.0.7/32');
    expect(cfg).toContain('PrivateKey = ' + 'P'.repeat(43) + '=');
    expect(cfg).toContain('DNS = 9.9.9.9');
    expect(cfg).toContain('[Peer]');
    expect(cfg).toContain('PublicKey = ' + 'S'.repeat(43) + '=');
    expect(cfg).toContain('Endpoint = 203.0.113.10:51820');
  });
});
