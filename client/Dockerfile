# step 1: Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY drizzle.config.ts ./

RUN npm install

COPY . .

RUN npm run build

# step2: Production Stage
FROM node:22-alpine AS runner

WORKDIR /app

COPY package*.json ./
COPY drizzle.config.ts ./

RUN npm install --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/next.config.js ./next.config.js
COPY --from=builder /app/package.json ./package.json

COPY --from=builder /app/drizzle ./drizzle

EXPOSE 3000

CMD ["npm", "start"]