import { beforeEach, describe, expect, it, vi } from 'vitest';

const FR = {
  id: 'fr',
  name: 'France',
  flag: '🇫🇷',
  city: 'Paris',
  endpoint: '203.0.113.10:51820',
  serverPublicKey: 'k'.repeat(43) + '=',
  clientSubnet: '10.8.0.0/24',
  dns: '1.1.1.1',
  control: { kind: 'agent', url: 'http://203.0.113.10:8787', secret: 'top-secret' },
  proxy: 'http://203.0.113.10:8888',
};
const PL = { ...FR, id: 'pl', name: 'Poland', clientSubnet: '10.9.0.0/24', proxy: undefined };

async function loadRegions() {
  vi.resetModules();
  return import('../src/regions');
}

describe('regions registry', () => {
  beforeEach(() => {
    delete process.env.REGIONS_JSON;
  });

  it('parses REGIONS_JSON and exposes every region', async () => {
    process.env.REGIONS_JSON = JSON.stringify([FR, PL]);
    const m = await loadRegions();
    expect(m.regions().map((r) => r.id)).toEqual(['fr', 'pl']);
    expect(m.getRegion('pl')?.name).toBe('Poland');
    expect(m.defaultRegion().id).toBe('fr');
  });

  it('never leaks control secrets through the public endpoints', async () => {
    process.env.REGIONS_JSON = JSON.stringify([FR, PL]);
    const m = await loadRegions();
    for (const r of [...m.publicRegions(), ...m.browserNodes()]) {
      expect(JSON.stringify(r)).not.toContain('top-secret');
      expect(JSON.stringify(r)).not.toContain('8787');
    }
  });

  it('browserNodes only lists proxy-equipped regions', async () => {
    process.env.REGIONS_JSON = JSON.stringify([FR, PL]);
    const m = await loadRegions();
    expect(m.browserNodes().map((n) => n.id)).toEqual(['fr']);
  });

  it('throws when two regions share a clientSubnet', async () => {
    process.env.REGIONS_JSON = JSON.stringify([FR, { ...PL, clientSubnet: FR.clientSubnet }]);
    const m = await loadRegions();
    expect(() => m.regions()).toThrow(/share clientSubnet/);
  });

  it('throws on malformed REGIONS_JSON instead of serving garbage', async () => {
    process.env.REGIONS_JSON = '{not json';
    const m = await loadRegions();
    expect(() => m.regions()).toThrow(/not valid JSON/);
  });

  it('falls back to the single legacy region when REGIONS_JSON is unset', async () => {
    const m = await loadRegions();
    const list = m.regions();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('de');
  });
});
