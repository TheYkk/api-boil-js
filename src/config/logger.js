const env = require('./getenv');

module.exports = {
  name: env('LOGGER_NAME', 'backend-api'),
  level: env('LOGGER_LEVEL', 'debug'),
  useLevelLabels: true,
};
