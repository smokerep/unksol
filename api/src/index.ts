import Fastify from 'fastify';
import { ZodError } from 'zod';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import { config } from './config';
import { authRoutes } from './routes/auth';
import { accessRoutes } from './routes/access';
import { regionRoutes } from './routes/regions';
import { searchRoutes } from './routes/search';
import { downloadRoutes } from './routes/download';
import { startReverifyWorker } from './worker/reverify';

async function main(): Promise<void> {
  if (config.nodeEnv === 'production' && !process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET must be set in production');
  }

  const app = Fastify({ logger: true });

  // Accept body-less POSTs even when content-type is application/json
  // (e.g. /access/provision, /access/revoke have no body).
  app.addContentTypeParser('application/json', { parseAs: 'string' }, (_req, body, done) => {
    if (!body || body.length === 0) return done(null, undefined);
    try {
      done(null, JSON.parse(body as string));
    } catch (err) {
      (err as { statusCode?: number }).statusCode = 400;
      done(err as Error);
    }
  });

  // Validation errors are the client's fault: answer 400, not a leaky 500.
  app.setErrorHandler((err, req, reply) => {
    if (err instanceof ZodError) {
      return reply.code(400).send({ error: 'bad-request', issues: err.issues.map((i) => i.message) });
    }
    const status = (err as { statusCode?: number }).statusCode ?? 500;
    if (status >= 500) req.log.error(err);
    return reply.code(status).send({ error: status >= 500 ? 'internal-error' : err.message });
  });

  // A lone "*" in CORS_ORIGIN means "allow any origin" (handy for early testing).
  const corsOrigin =
    config.corsOrigin.length === 1 && config.corsOrigin[0] === '*' ? true : config.corsOrigin;
  await app.register(cors, { origin: corsOrigin, credentials: true });
  await app.register(jwt, { secret: config.jwtSecret, sign: { expiresIn: config.jwtTtl } });

  app.get('/health', async () => ({ ok: true, env: config.nodeEnv }));

  await app.register(authRoutes);
  await app.register(accessRoutes);
  await app.register(regionRoutes);
  await app.register(searchRoutes);
  await app.register(downloadRoutes);

  startReverifyWorker();

  await app.listen({ port: config.port, host: '0.0.0.0' });
  app.log.info(`unk API listening on :${config.port}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
