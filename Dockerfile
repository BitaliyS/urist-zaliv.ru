# SEO-сайт urist-zaliv.ru — изолированный образ, не связан с ur-agent.
FROM node:22-alpine AS deps
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS build
RUN apk add --no-cache python3 make g++
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# PUBLIC_* попадают в клиентский бандл на этапе build (SvelteKit dynamic/public)
ARG PUBLIC_SITE_URL=https://urist-zaliv.ru
ARG PUBLIC_YANDEX_METRIKA_ID=
ARG PUBLIC_YANDEX_WEBVISOR=false
ARG PUBLIC_INDEXNOW_KEY=b7e3f2a1c4d8490e8f1a2b3c4d5e6f70
ENV PUBLIC_SITE_URL=$PUBLIC_SITE_URL \
    PUBLIC_YANDEX_METRIKA_ID=$PUBLIC_YANDEX_METRIKA_ID \
    PUBLIC_YANDEX_WEBVISOR=$PUBLIC_YANDEX_WEBVISOR \
    PUBLIC_INDEXNOW_KEY=$PUBLIC_INDEXNOW_KEY
RUN npm run build && npm prune --omit=dev

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000
ENV LEAD_DB_PATH=/app/data/leads.sqlite
RUN apk add --no-cache su-exec libstdc++ \
	&& addgroup -S app && adduser -S app -G app \
	&& mkdir -p /app/data && chown app:app /app/data
COPY --from=build --chown=app:app /app/build ./build
COPY --from=build --chown=app:app /app/package.json ./package.json
COPY --from=build --chown=app:app /app/node_modules ./node_modules
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
# entrypoint стартует root → chown data → su-exec app
EXPOSE 3000
ENTRYPOINT ["/docker-entrypoint.sh"]
