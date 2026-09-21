import cron from 'node-cron';
import { prisma } from '../db';
import { checkEligibility } from '../solana';
import { providerForRegion } from '../wireguard';
import { getRegion } from '../regions';
import { config } from '../config';

/**
 * Periodically re-checks balances: anyone who dropped below the threshold
 * (sold the token) loses VPN access.
 */
export function startReverifyWorker(): void {
  cron.schedule(config.reverifyCron, async () => {
    const peers = await prisma.vpnPeer.findMany({
      where: { active: true },
      include: { user: true },
    });
    console.log(`[reverify] checking ${peers.length} active peers`);

    for (const peer of peers) {
      try {
        const elig = await checkEligibility(peer.user.wallet);
        if (!elig.eligible) {
          const region = getRegion(peer.region);
          if (!region) {
            console.warn(`[reverify] region ${peer.region} gone — skipping ${peer.user.wallet}`);
            continue;
          }
          try {
            await providerForRegion(region).removePeer(peer.publicKey);
          } catch (e) {
            // Fail CLOSED: leave the peer active so the next run retries.
            console.error(`[reverify] removePeer failed for ${peer.user.wallet}, will retry`, e);
            continue;
          }
          await prisma.vpnPeer.update({
            where: { id: peer.id },
            data: { active: false, address: `freed:${peer.id}` },
          });
          console.log(
            `[reverify] revoked ${peer.user.wallet} (balance ${elig.balance} < ${elig.required})`,
          );
        } else {
          await prisma.vpnPeer.update({
            where: { id: peer.id },
            data: { lastVerifiedAt: new Date() },
          });
        }
      } catch (e) {
        console.error(`[reverify] error for ${peer.user.wallet}`, e);
      }
    }
  });

  console.log(`[reverify] scheduled (${config.reverifyCron})`);
}
