FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY --chown=node:node index.html manifest.webmanifest sw.js ./
COPY --chown=node:node assets ./assets
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node src ./src
COPY --chown=node:node supabase ./supabase

RUN npm run build

USER node
EXPOSE 4173
CMD ["node", "scripts/server.mjs"]
