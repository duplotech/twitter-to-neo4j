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
  const cb = once(callback);

  const _context = Object.assign({}, message);
  const type = messageToType(streams, message);
  const stream = messageToStream(streams, message);

  stream.on('data', data => this.push({ type, data, _context }));
  stream.on('close', () => cb());
  stream.on('end', () => cb());
  stream.on('error', (err) => cb(err));
  stream.on('finish', () => cb());
});

module.exports = emitFromStream;
