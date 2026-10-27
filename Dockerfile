FROM node:22-alpine AS builder
WORKDIR /site
COPY package.json build.mjs ./
COPY src ./src
ARG TALLY_FORM_ID=""
ENV TALLY_FORM_ID=$TALLY_FORM_ID
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
COPY --from=builder /site/dist /usr/share/nginx/html
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1:8080/health || exit 1
