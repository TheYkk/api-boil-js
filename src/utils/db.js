// ? Get configs
const cfg = require('../config');

// ? Setup db configs
const Knex = require('knex')({
  client: cfg.db.client,
  connection: cfg.db.uri,
});

module.exports = Knex;
