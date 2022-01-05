const env = require('./getenv');

module.exports = {
  port: env('APP_PORT', '30478'),
  ssl_key: env('SSL_KEY', '/etc/nginx/ssl/tls.key'),
  ssl_crt: env('SSL_CRT', '/etc/nginx/ssl/tls.crt'),
  secret: env('APP_SECRET', 'HZBokFclSOtQOnJY'),
  mode: env('APP_MODE', 'dev'),
};
