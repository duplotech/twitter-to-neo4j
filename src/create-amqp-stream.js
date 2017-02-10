const debug = require('debug')('twitter-to-neo4j:amqp-stream');

const amqp = require('amqp');
const promisify = require('any-promisify');
const amqpStream = promisify(require('amqp-stream'));

const createAmqpStream = ({
  AMQP_URL,
  AMQP_EXCHANGE,
  AMQP_ROUTER_KEY,
  AMQP_QUEUE
}) => {
  const connection = amqp.createConnection(AMQP_URL);

  connection.on('ready', () => debug('connection ready'));
  connection.on('error', (err) => debug(err.message));
  connection.on('close', () => debug('connection ended'));

  return amqpStream({ connection, exchange: AMQP_EXCHANGE, routingKey: AMQP_ROUTER_KEY, queue: AMQP_QUEUE });
}

module.exports = createAmqpStream;
