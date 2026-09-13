# ─── Base image ───────────────────────────────────────────────────────────────
FROM node:20-alpine

# Install openssl for Prisma query engine
RUN apk add --no-cache openssl

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies strictly from package-lock
RUN npm ci

# Generate Prisma Client (runs postinstall hook too)
RUN npx prisma generate

# Bundle app source
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose port (must match PORT in env)
EXPOSE 5000

# Start command — run migrations then start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
