# NOTE:
# This is a sample Dockerfile. It has not (as of November, 2025) been tested.

# ===========================
# 1. Build Next.js application
# ===========================
FROM node:20 AS builder

WORKDIR /app

# Copy package files first (faster builds)
COPY package.json package-lock.json ./

RUN npm ci

# Copy source
COPY . .

# Copy environment file (pass via build arg)
# Example: docker build --build-arg ENV_FILE=.env.staging …
ARG ENV_FILE=.env.production
COPY ${ENV_FILE} .env.production

# Build NextJS
RUN npm run build


# ===========================
# 2. Node.js runtime container
# ===========================
FROM node:20 AS nextjs

WORKDIR /app

# Copy only required runtime files
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Bring over the built artifacts
COPY --from=builder /app/.next .next
COPY --from=builder /app/public public
COPY --from=builder /app/next.config.js ./

# Start script
CMD ["npm", "start"]


# ===========================
# 3. Nginx SSL reverse proxy
# ===========================
FROM nginx:alpine

# Install tini for safer PID1
RUN apk add --no-cache tini
ENTRYPOINT ["/sbin/tini", "--"]

# Copy your Nginx configuration
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy SSL certificates (pass via build args)
ARG SSL_CERT=cert.pem
ARG SSL_KEY=key.pem
COPY ${SSL_CERT} /etc/nginx/certs/server.crt
COPY ${SSL_KEY} /etc/nginx/certs/server.key

# Copy Next.js runtime server
COPY --from=nextjs /app /app

# Expose HTTPS
EXPOSE 443

# Run both Node and Nginx in supervised mode
CMD sh -c "node /app/node_modules/.bin/next start & nginx -g 'daemon off;'"
