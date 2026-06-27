import express, { Application } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env';
import { swaggerSpec } from './config/swagger';
import { globalErrorHandler, AppError } from './middlewares/errorMiddleware';
import v1Routes from './routes/v1/index';

const app: Application = express();

// ─── Trust Proxy (required on Render / Heroku / Railway) ─────────────────────
// Without this, express-rate-limit sees all requests as coming from the same
// internal proxy IP, causing the rate limit to fire for ALL users at once.
app.set('trust proxy', 1);

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
});

// ─── Security & Optimization Middlewares ─────────────────────────────────────
app.use(helmet());
app.use(cors({ 
  origin: [env.clientUrl, /^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/], 
  credentials: true 
}));
app.use(globalLimiter);
app.use(compression());

// ─── Swagger Docs ─────────────────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { customSiteTitle: 'Car Rental API Docs' }));

// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// ─── Data Sanitization ────────────────────────────────────────────────────────
// Manual NoSQL injection prevention (express-mongo-sanitize not compatible with Express 5)
app.use((req, _res, next) => {
  const sanitize = (obj: unknown): unknown => {
    if (typeof obj !== 'object' || obj === null) return obj;
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>)
        .filter(([k]) => !k.startsWith('$'))
        .map(([k, v]) => [k, sanitize(v)])
    );
  };
  if (req.body) req.body = sanitize(req.body);
  next();
});
// XSS prevention — sanitize string values in req.body (skip auth credential fields)
app.use((req, _res, next) => {
  // Fields that should NEVER be HTML-escaped (passwords, tokens)
  const SKIP_FIELDS = new Set(['password', 'confirmPassword', 'token', 'refreshToken']);

  const escapeHtml = (str: string) =>
    str.replace(/&/g, '&amp;')
       .replace(/</g, '&lt;')
       .replace(/>/g, '&gt;')
       .replace(/"/g, '&quot;')
       .replace(/'/g, '&#x27;');

  const sanitizeXss = (obj: unknown, parentKey = ''): unknown => {
    if (typeof obj === 'string') {
      return SKIP_FIELDS.has(parentKey) ? obj : escapeHtml(obj);
    }
    if (typeof obj !== 'object' || obj === null) return obj;
    if (Array.isArray(obj)) return obj.map((v) => sanitizeXss(v, parentKey));
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [k, sanitizeXss(v, k)])
    );
  };

  if (req.body) req.body = sanitizeXss(req.body);
  next();
});

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/v1', v1Routes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((req, res, next) => {
  next(new AppError(404, `Cannot find ${req.originalUrl} on this server.`));
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(globalErrorHandler);

export default app;
