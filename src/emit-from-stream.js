const debug = require('debug')('twitter-to-neo4j:emit-from-stream');
const through = require('through2');
const once = require('once');

const identity = v => v;

function messageToStream(streams = {}, message) {
  const streamConfiguration = streams[message.command];
  let stream;
  if (streamConfiguration) {
    const StreamClass = streamConfiguration.class;
    const args = (streamConfiguration.toArgs || identity)(message.payload);
    stream = new StreamClass(...args);
  }
  return stream;
}

function messageToType(streams = {}, message) {
  const streamConfiguration = streams[message.command];
  const streamType = streamConfiguration ? streamConfiguration.type : null;
  return streamType;
}

const emitFromStream = streams => through.obj(function (message, encoding, callback) {

  const _context = Object.assign({}, message);
  const type = messageToType(streams, message);
  const stream = messageToStream(streams, message);

  const onFinishedStream = once(() => {
    debug(`finished ${type} stream`);
    this.push({ type: 'finished', _context });
    callback();
  });
  const onErroredStream = once((err) => {
    debug(`errored for ${type} stream:`, err)
    callback(err);
  });

  stream.on('data', data => this.push({ type, data, _context }));
  stream.on('error', onErroredStream);
  stream.on('close', onFinishedStream);
  stream.on('end', onFinishedStream);
  stream.on('finish', onFinishedStream);
});

module.exports = emitFromStream;
