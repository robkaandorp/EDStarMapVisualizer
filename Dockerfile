FROM node:18-alpine AS builder
RUN apk add --update make gcc g++ python3 zeromq zeromq-dev
WORKDIR /app
COPY . ./
RUN npm install
RUN npx tailwindcss -o ./dist/static/build.css --minify
RUN npx webpack
RUN npx tsc
RUN npm prune --production

FROM node:18-alpine AS dist
EXPOSE 3000
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD [ "node", "./dist/server.js" ]