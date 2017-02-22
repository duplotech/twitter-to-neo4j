const split = require('split');
const filter = require('through2-filter');
const map = require('through2-map');
const toLine = split();
const isNonEmptyLine = filter.obj(line => line.length > 0);

const identity = v => v;

const toCommand = (type, toPayload = identity) =>
  map.obj(line => ({ type: 'command', command: type, payload: toPayload(line) }));

const createToCommands = (type, toPayload = identity) => input =>
  input
    .pipe(toLine)
    .pipe(isNonEmptyLine)
    .pipe(toCommand(type, toPayload));

module.exports = createToCommands;
