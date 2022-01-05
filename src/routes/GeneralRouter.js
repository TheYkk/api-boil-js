// ? Get utils
const {db, cfg, helpers} = require('../utils');

module.exports = async (fastify, opts, next) => {
  // ? No favicon
  fastify.get('/favicon.ico', (_req, res) => {
    res.code(404).send();
  });

  // ? Healt router
  fastify.get('/health', (_req, res) => {
    res.send('ok');
  });

  // ? User ip
  fastify.get('/ip', (req, res) => {
    res.send(req.ip);
  });

  // ? Healt router
  fastify.get('/ready', async (_req, res) => {
    await db.raw('select 1+1 as result').then(async _result => {
      res.send('ok');
    });
  });

  // ? Version router
  fastify.get('/version', (_req, res) => {
    res.send(cfg.version);
  });

  // ? Uptime router
  fastify.get('/uptime', (_req, res) => {
    res.send(helpers.formatTime(process.uptime()));
  });

  next();
};
