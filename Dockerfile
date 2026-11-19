FROM node:22-slim

WORKDIR /app

# Copy storefront package manifests first for efficient caching
COPY storefront/package*.json ./storefront/

WORKDIR /app/storefront
RUN npm install

# Copy the full storefront project source
WORKDIR /app
COPY storefront ./storefront

# Build the editorial hero and Next.js / framework bundles
WORKDIR /app/storefront
RUN npm run build

# Expose web port
EXPOSE 3000

ENV PORT=3000
ENV NODE_ENV=production

# Start wrangler local runner bound to 0.0.0.0 and port 3000 for VPS reverse proxy
CMD ["node", "--import", "./scripts/sites-env.mjs", "./node_modules/wrangler/bin/wrangler.js", "dev", "--config", "dist/server/wrangler.json", "--local", "--persist-to", ".wrangler/state", "--ip", "0.0.0.0", "--port", "3000", "--inspector-port", "0"]
