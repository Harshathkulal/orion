# step 1: Build Stage
FROM node:22-alpine AS build

WORKDIR /src/app

COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY . .
RUN npm run build

# step2: Production Stage
FROM node:22-alpine

WORKDIR /src/app

COPY package.json package-lock.json .npmrc ./
RUN npm ci --omit=dev

COPY --from=build /src/app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
