const env = require('./getenv');

module.exports = {
  uri: env('DB_URI', 'postgres://postgres:ykk@localhost:5433/saas'),
  client: env('DB_CLIENT', 'pg'),
};
