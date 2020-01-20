# Install npm packages
FROM node:12-alpine as builder
WORKDIR /usr/src/app
#COPY package.json .
RUN yarn add knex dotenv pg

# Push js files
FROM node:12-alpine
WORKDIR /usr/src/app
COPY --from=builder /usr/src/app/ /usr/src/app/
COPY . .
#CMD top
CMD ./node_modules/.bin/knex migrate:latest
