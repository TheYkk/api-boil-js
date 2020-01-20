const db = require('./db');

const app = require('./app');

const queue = require('./queue');

const redis = require('./redis');

const loggerConf = require('./logger');

const logger = require('pino')(loggerConf);

const packagec = require('../../package.json');

module.exports = {
  db,
  app,
  logger,
  redis,
  queue,
  version: packagec.version,
};
