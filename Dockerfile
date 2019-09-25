FROM node:10-alpine AS builder
WORKDIR /app
COPY . ./
RUN rm -rf ./dist ./node_modules
RUN apk add --update make gcc g++ python zeromq zeromq-dev
RUN npm install -g webpack webpack-cli typescript
RUN npm install
RUN webpack
RUN tsc

FROM node:10-alpine AS dist
EXPOSE 3000
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
CMD [ "node", "./dist/server.js" ]