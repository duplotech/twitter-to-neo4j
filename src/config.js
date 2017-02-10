const AMQP_URL = process.env.AMQP_HOST || 'amqp://localhost:5672'
const AMQP_EXCHANGE = process.env.AMQP_EXCHANGE || 'rpc';
const AMQP_ROUTER_KEY = process.env.AMQP_ROUTER_KEY || 'commands';
const AMQP_QUEUE = process.env.AMQP_QUEUE;

module.exports = {
  AMQP_URL,
  AMQP_EXCHANGE,
  AMQP_ROUTER_KEY,
  AMQP_QUEUE
};
