# step 1: Base Stage (install deps only)
FROM node:22-alpine AS base

WORKDIR /app

COPY package.json package-lock.json .npmrc ./
COPY drizzle.config.ts ./
RUN npm ci

COPY . .

# step 2: Runtime Stage
FROM node:22-alpine AS runner

WORKDIR /app

COPY --from=base /app ./

EXPOSE 3000

CMD ["sh", "-c", "npm run build && npm start"]
