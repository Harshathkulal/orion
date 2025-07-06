# step 1: Build Stage
FROM node:22-alpine AS build

WORKDIR /src/app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# step2: Production Stage
FROM node:22-alpine

WORKDIR /src/app

COPY package*.json ./
RUN npm install --production

COPY --from=build /src/app/dist ./dist

EXPOSE 5000

CMD ["node", "dist/index.js"]
