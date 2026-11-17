
#!/bin/sh
set -eu

echo "[STARTUP] Resolving Neon direct database endpoint..."

DIRECT_HOST="$(node -e 'process.stdout.write(new URL(process.env.DIRECT_URL).hostname)')"

DIRECT_IPV4="$(node -e '
const dns = require("node:dns");
const host = new URL(process.env.DIRECT_URL).hostname;

dns.lookup(host, { family: 4 }, (err, address) => {
  if (err) {
    console.error("IPv4 DNS lookup failed:", err.message);
    process.exit(1);
  }
  process.stdout.write(address);
});
')"

if [ -z "$DIRECT_IPV4" ]; then
  echo "[ERROR] Could not resolve direct endpoint to IPv4"
  exit 1
fi

echo "[STARTUP] Direct endpoint: $DIRECT_HOST"
echo "[STARTUP] Resolved IPv4: $DIRECT_IPV4"

echo "$DIRECT_IPV4 $DIRECT_HOST" >> /etc/hosts

export NODE_OPTIONS="--dns-result-order=ipv4first"

echo "[STARTUP] Running Prisma migrations..."

npx prisma migrate deploy

echo "[STARTUP] Starting Express backend..."

exec npm start
