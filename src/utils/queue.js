// ? Get configs
const cfg = require('../config');

// ? Setup db configs
const Queue = require('amqplib').connect(cfg.queue.uri);

module.exports = Queue;
