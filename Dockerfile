FROM node:12-alpine AS builder
RUN apk add --update make gcc g++ python zeromq zeromq-dev
WORKDIR /app
COPY . ./
RUN npm install
RUN npx webpack
RUN npx tsc
RUN npm prune --production

FROM node:12-alpine AS dist
EXPOSE 3000
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD [ "node", "./dist/server.js" ]