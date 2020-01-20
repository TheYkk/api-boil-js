// ? Get configs
const cfg = require('./config');

// ? File reader
const fs = require('fs');

// ? Set logger configs and init
const log = cfg.logger;

const serverSettings =
  cfg.app.mode === 'dev'
    ? {logger: log}
    : {
        logger: log,
        http2: true,
        https: {
          key: fs.readFileSync(cfg.app.ssl_key, 'utf8'),
          cert: fs.readFileSync(cfg.app.ssl_crt, 'utf8'),
        },
      };

// ? Get Http server
const fastify = require('fastify')(serverSettings);

// ? Enable CORS
fastify.register(require('fastify-cors'));

// ? For security
fastify.register(require('fastify-helmet'));

// ? JWT
fastify.register(require('fastify-jwt'), {
  secret: cfg.app.secret,
  sign: {
    expiresIn: '1h',
  },
  verify: {
    maxAge: '1h',
  },
});

// ? Router
fastify.register(require('./routes/GeneralRouter'));

// ? Auth Router
fastify.register(require('./routes/AuthRouter'), {prefix: '/auth'});

// ? User Router
fastify.register(require('./routes/UserRouter'), {prefix: '/user'});

// ? Error Listener
fastify.setErrorHandler((error, req, res) => {
  req.log.error(error.toString());
  res.send({error});
});

// ? Run the server!
fastify.listen(cfg.app.port, '0.0.0.0', err => {
  if (err) throw err;
});
