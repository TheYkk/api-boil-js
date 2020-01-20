// ? Get configs
const cfg = require('../config');

const redis = require('redis');

const client = redis.createClient(cfg.redis.port, cfg.redis.host);
client.auth(cfg.redis.password);

client.on('error', err => {
  cfg.logger.error(`Redis error ${err}`);
});

module.exports = client;
