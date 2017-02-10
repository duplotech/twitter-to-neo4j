#!/usr/bin/env node

const debug = require('debug')('twitter-to-neo4j:daemon');
const map = require('through2-map');
const tap = require('tap-stream');

const {
  createAmqpStream,
  emitFromStream,
  streams,
  config
} = require('../src');

const parse = map.obj(s => JSON.parse(s));

const toDebugLog = tap(data => debug(data));
const toErrorLog = console.error.bind(console);

const output = process.stdout;

createAmqpStream(config)
  .then(rpc =>
    rpc
      .pipe(parse)
      .pipe(emitFromStream(streams))
      .pipe(toDebugLog)
      // .pipe(output)
  )
  .catch(toErrorLog);
