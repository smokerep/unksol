import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { randomBytes } from 'node:crypto';
import { prisma } from '../db';
import { buildSignInMessage, verifySignature } from '../siws';

// Solana addresses are base58 and case-sensitive — never lowercase them.
const walletSchema = z.string().regex(/^[1-9A-HJ-NP-Za-km-z]{32,44}$/, 'invalid Solana address');

export async function authRoutes(app: FastifyInstance): Promise<void> {
  // 1) The client requests a nonce to sign.
  app.post('/auth/nonce', async (req) => {
    const { wallet } = z.object({ wallet: walletSchema }).parse(req.body);

    // Opportunistic cleanup so expired nonces don't pile up forever.
    await prisma.authNonce.deleteMany({ where: { expiresAt: { lt: new Date() } } });

    const nonce = randomBytes(16).toString('hex');
    const issuedAt = new Date();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.authNonce.create({ data: { wallet, nonce, issuedAt, expiresAt } });

    return { message: buildSignInMessage(wallet, nonce, issuedAt.toISOString()), nonce };
  });

  // 2) The client sends the signed message; we verify it and issue a session (JWT).
  app.post('/auth/verify', async (req, reply) => {
    const { wallet, message, signature } = z
      .object({ wallet: walletSchema, message: z.string().max(2000), signature: z.string().max(500) })
      .parse(req.body);

    // The signature must cover EXACTLY the message this server issued for this
    // wallet — never a look-alike signed elsewhere that merely embeds a valid
    // nonce somewhere in its text.
    const candidates = await prisma.authNonce.findMany({
      where: { wallet, expiresAt: { gte: new Date() } },
    });
    const record = candidates.find(
      (c) => message === buildSignInMessage(wallet, c.nonce, c.issuedAt.toISOString()),
    );
    if (!record) return reply.code(401).send({ error: 'nonce-invalid-or-expired' });

    if (!verifySignature(message, signature, wallet)) {
      return reply.code(401).send({ error: 'bad-signature' });
    }

    // Atomic one-time consumption: of N concurrent replays, exactly one wins.
    const consumed = await prisma.authNonce.deleteMany({ where: { id: record.id } });
    if (consumed.count !== 1) return reply.code(401).send({ error: 'nonce-invalid-or-expired' });
    await prisma.authNonce.deleteMany({ where: { wallet } });

    await prisma.user.upsert({ where: { wallet }, update: {}, create: { wallet } });

    const token = await reply.jwtSign({ wallet });
    return { token };
  });
}
