# Stage 1: Build the Next.js application
FROM node:24-alpine3.22 AS builder

RUN apk upgrade --no-cache && npm install -g npm@latest && npm config set allow-remote true

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN npm run build

# Stage 2: Production image
FROM node:24-alpine3.22 AS runner

RUN apk upgrade --no-cache && npm install -g npm@latest && npm config set allow-remote true

WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

COPY docker-entrypoint.sh /app/entrypoint.sh
RUN sed -i 's/\r$//' /app/entrypoint.sh && chmod +x /app/entrypoint.sh

# Roda sem root. Só o que o servidor grava em runtime pertence ao usuário node:
# o runtime-config.js que o entrypoint reescreve a cada start e o cache do
# otimizador de imagens do next/image.
RUN touch /app/public/runtime-config.js \
  && mkdir -p /app/.next/cache \
  && chown node:node /app/public/runtime-config.js /app/.next/cache
USER node

EXPOSE 3000
ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["node", "server.js"]
