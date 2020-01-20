# Install npm packages
FROM node:12-alpine as builder
WORKDIR /usr/src/app
COPY package.json .
RUN apk --no-cache add --virtual builds-deps build-base python
RUN yarn install
RUN yarn cache clean

# Push js files
FROM node:12-alpine
WORKDIR /usr/src/app
EXPOSE 8080 443 80 8443
COPY --from=builder /usr/src/app/ /usr/src/app/
COPY . .
CMD node src/index.js
