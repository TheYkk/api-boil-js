const env = require('./getenv');

module.exports = {
  uri: env('QUEUE_URI', 'amqp://user:password@localhost:5672'),
  client: env('QUEUE_CLIENT', 'rabbitmq'),
};
