import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || 'development',
  mongoUri: process.env.MONGO_URI as string,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:3000').trim(),
};

// Fail fast on missing critical envs
if (!env.mongoUri || !env.jwt.accessSecret || !env.jwt.refreshSecret) {
  console.error('FATAL ERROR: Missing critical environment variables.');
  process.exit(1);
}

// Warn loudly (or exit) if placeholder secrets slip into production
const PLACEHOLDER_SECRETS = ['super_secret_access_key', 'super_secret_refresh_key', 'generate_in_production'];
const hasWeakSecret = PLACEHOLDER_SECRETS.some(
  (p) => env.jwt.accessSecret.includes(p) || env.jwt.refreshSecret.includes(p)
);
if (hasWeakSecret) {
  if (env.nodeEnv === 'production') {
    console.error('FATAL: Placeholder JWT secrets detected in production. Aborting.');
    process.exit(1);
  } else {
    console.warn('⚠️  WARNING: Using placeholder JWT secrets. Replace before deploying.');
  }
}
