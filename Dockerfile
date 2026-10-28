FROM node:22-alpine AS builder
WORKDIR /site
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml build.mjs ./
RUN npm install --global "$(node --print 'require("./package.json").packageManager')"
RUN pnpm install --frozen-lockfile --prod
COPY lib ./lib
COPY src ./src
COPY cloudflare ./cloudflare
ARG TALLY_FORM_ID=""
ENV TALLY_FORM_ID=$TALLY_FORM_ID
RUN pnpm build

FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=builder /site/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
