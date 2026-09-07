# House Type Valuer — SaaS
FROM node:22-bookworm-slim

# better-sqlite3 is a native module; build tools are needed if no prebuilt
# binary is available for the platform.
RUN apt-get update && apt-get install -y --no-install-recommends \
      python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=4000
ENV DATA_DIR=/data
VOLUME ["/data"]
EXPOSE 4000

CMD ["node", "src/server.js"]
