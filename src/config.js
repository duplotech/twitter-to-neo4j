const AMQP_URL = process.env.AMQP_HOST || 'amqp://localhost:5672'
const AMQP_EXCHANGE = process.env.AMQP_EXCHANGE || 'rpc';
const AMQP_ROUTER_KEY = process.env.AMQP_ROUTER_KEY || 'commands';
const AMQP_QUEUE = process.env.AMQP_QUEUE;

const NEO4J_URL = process.env.NEO4J_URL || 'bolt://localhost';
const NEO4J_USERNAME = process.env.NEO4J_USERNAME || 'neo4j';
const NEO4J_PASSWORD = process.env.NEO4J_PASSWORD || 'neo4j-password';

module.exports = {
  AMQP_URL,
  AMQP_EXCHANGE,
  AMQP_ROUTER_KEY,
  AMQP_QUEUE,
  NEO4J_URL,
  NEO4J_USERNAME,
  NEO4J_PASSWORD
};
