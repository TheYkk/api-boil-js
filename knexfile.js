// ? Set envs from .env file
require('dotenv').config({
  path: process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env',
});

module.exports = {
  development: {
    client: 'postgresql',
    connection: process.env.DB_URI,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },

  staging: {
    client: 'postgresql',
    connection: process.env.DB_URI,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './src/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },

  production: {
    client: 'postgresql',
    connection: process.env.DB_URI,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './data/migrations',
    },
    seeds: {
      directory: './src/seeds',
    },
  },
};
