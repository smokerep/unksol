import { FastifyInstance } from 'fastify';
import { prisma } from '../db';
import { checkEligibility } from '../solana';
import { getRegion, defaultRegion, publicRegions } from '../regions';
import {
  generateKeyPair,
  allocateAddress,
  providerForRegion,
  buildClientConfig,
} from '../wireguard';

export async function accessRoutes(app: FastifyInstance): Promise<void> {
  // All routes here require a valid session.
  app.addHook('preHandler', async (req, reply) => {
    try {
      await req.jwtVerify();
    } catch {
      return reply.code(401).send({ error: 'unauthorized' });
    }
  });

  // Status: eligibility, the available regions, and which regions are active.
  app.get('/access/status', async (req) => {
    const { wallet } = req.user;
    const elig = await checkEligibility(wallet);
    const user = await prisma.user.findUnique({
      where: { wallet },
      include: { peers: true },
    });
    const activeRegions = (user?.peers ?? []).filter((p) => p.active).map((p) => p.region);

    return {
      wallet,
      eligible: elig.eligible,
      balance: elig.balance,
      required: elig.required,
      reason: elig.reason,
      vpnActive: activeRegions.length > 0,
      regions: publicRegions(),
      activeRegions,
    };
  });

  // Provisioning: if eligible, create (or reuse) the peer for the chosen region
  // and return the config. One active peer per (wallet, region).
  app.post('/access/provision', async (req, reply) => {
    const { wallet } = req.user;
    const body = (req.body ?? {}) as { region?: string };
    const region = body.region ? getRegion(body.region) : defaultRegion();
    if (!region) {
      return reply.code(400).send({ error: 'unknown-region', region: body.region });
    }
    // Never hand out configs that cannot work (e.g. the legacy fallback region
    // before any real node exists) — a syntactically-broken .conf helps nobody.
    if (!region.serverPublicKey) {
      return reply.code(503).send({ error: 'vpn-not-live', region: region.id });
    }

    const elig = await checkEligibility(wallet);
    if (!elig.eligible) {
      return reply.code(403).send({ error: 'not-eligible', ...elig });
    }

    const user = await prisma.user.upsert({
      where: { wallet },
      update: {},
      create: { wallet },
      include: { peers: true },
    });

    let peer = user.peers.find((p) => p.active && p.region === region.id) ?? null;
    if (peer) {
      // Re-install on the node too: `wg set` is idempotent, and this heals
      // peers lost to a node rebuild (or created against a dead node).
      try {
        await providerForRegion(region).addPeer(peer.publicKey, peer.address);
      } catch {
        return reply.code(503).send({ error: 'node-unreachable', region: region.id });
      }
    } else {
      // DB row first (with a retry on address races), node install after —
      // and a compensating delete if the node call fails.
      const keys = generateKeyPair();
      for (let attempt = 0; attempt < 3 && !peer; attempt++) {
        const address = await allocateAddress(region);
        try {
          peer = await prisma.vpnPeer.create({
            data: {
              userId: user.id,
              publicKey: keys.publicKey,
              privateKey: keys.privateKey,
              address,
              region: region.id,
            },
          });
        } catch (e) {
          if ((e as { code?: string }).code === 'P2002') continue; // address taken — reallocate
          throw e;
        }
      }
      if (!peer) {
        return reply.code(503).send({ error: 'no-free-addresses', region: region.id });
      }
      try {
        await providerForRegion(region).addPeer(peer.publicKey, peer.address);
      } catch {
        await prisma.vpnPeer.delete({ where: { id: peer.id } }).catch(() => {});
        return reply.code(503).send({ error: 'node-unreachable', region: region.id });
      }
    }

    return {
      config: buildClientConfig(region, peer.privateKey, peer.address),
      address: peer.address,
      publicKey: peer.publicKey,
      region: region.id,
    };
  });

  // Manually revoke all of the wallet's active peers (across every region).
  app.post('/access/revoke', async (req) => {
    const { wallet } = req.user;
    const user = await prisma.user.findUnique({
      where: { wallet },
      include: { peers: true },
    });

    for (const p of user?.peers.filter((x) => x.active) ?? []) {
      const region = getRegion(p.region);
      if (!region) {
        req.log.warn({ peer: p.id, region: p.region }, 'revoke: region gone, skipping');
        continue;
      }
      try {
        await providerForRegion(region).removePeer(p.publicKey);
      } catch (e) {
        // Fail CLOSED: keep the peer active so the hourly reverify retries it.
        req.log.error({ peer: p.id, err: String(e) }, 'revoke: removePeer failed, will retry');
        continue;
      }
      await prisma.vpnPeer.update({
        where: { id: p.id },
        data: { active: false, address: `freed:${p.id}` },
      });
    }
    return { ok: true };
  });
}
