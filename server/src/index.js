import fs from 'node:fs';
import path from 'node:path';
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { store } from './store.js';
import routes from './routes/index.js';
import { errorHandler, notFoundHandler } from './lib/http.js';

store.init();

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);

app.use(
  cors({
    origin(origin, callback) {
      // Walang Origin (curl, same-origin, SSR) -> allow.
      if (!origin) return callback(null, true);
      if (config.clientOrigins.includes(origin) || config.clientOrigins.includes('*')) {
        return callback(null, true);
      }
      callback(new Error(`Hindi pinapayagan ang origin: ${origin}`));
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Mga larawang na-upload ng Tanggapan ng Patnugutan.
app.use(
  '/uploads',
  express.static(config.paths.uploads, {
    maxAge: '7d',
    fallthrough: true,
    setHeaders: (res) => res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin'),
  }),
);

app.use(config.apiPrefix, routes);

// I-serve ang built React app kapag mayroon (production / preview).
const hasClientBuild = fs.existsSync(path.join(config.paths.clientDist, 'index.html'));
if (hasClientBuild) {
  app.use(express.static(config.paths.clientDist, { maxAge: '1h', index: false }));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith(config.apiPrefix)) return next();
    res.sendFile(path.join(config.paths.clientDist, 'index.html'));
  });
}

app.use(notFoundHandler);
app.use(errorHandler);

const server = app.listen(config.port, config.host, () => {
  console.log(`\n  Ang Himaya API  →  http://localhost:${config.port}${config.apiPrefix}`);
  console.log(`  Health check    →  http://localhost:${config.port}${config.apiPrefix}/health`);
  console.log(`  Client build    →  ${hasClientBuild ? config.paths.clientDist : '(hindi pa nabuild — `npm run build`)'}`);
  console.log(`  Uploads         →  ${config.paths.uploads}\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    console.log(`\n[api] ${signal} natanggap — isinasara ang server.`);
    server.close(() => process.exit(0));
  });
}

export default app;