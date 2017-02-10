#!/usr/bin/env node

const debug = require('debug')('twitter-to-neo4j:daemon');
const tap = require('tap-stream');

const {
  createAmqpStream,
  config
} = require('../src');

const toDebugLog = tap(data => debug(data.toString()));
const toErrorLog = console.error.bind(console);

const output = process.stdout;

createAmqpStream(config)
  .then(rpc =>
    rpc
      .pipe(toDebugLog)
      .pipe(output)
  )
  .catch(toErrorLog);
