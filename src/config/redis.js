const env = require('./getenv');

module.exports = {
  port: env('REDIS_PORT', '6379'),
  host: env('REDIS_HOST', '127.0.0.1'),
  password: env('REDIS_PASSWORD', 'ykk'),
};
