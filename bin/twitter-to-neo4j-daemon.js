#!/usr/bin/env node

const debug = require('debug')('twitter-to-neo4j:daemon');
const map = require('through2-map');
const tap = require('tap-stream');

const { createStreamToDatabase } = require('stream-to-neo4j');
const {
  createAmqpStream,
  emitFromStream,
  streams,
  toStatements,
  config
} = require('../src');

const parse = map.obj(s => JSON.parse(s));

const toDebugLog = tap(data => debug(data));
const toErrorLog = console.error.bind(console);

const output = process.stdout;

const streamToDatabase = createStreamToDatabase(
  { url: config.NEO4J_URL, username: config.NEO4J_USERNAME, password: config.NEO4J_PASSWORD },
  {
    'tweet': toStatements.fromTweet,
    'tweet-like': toStatements.fromLike,
    'profile': toStatements.fromProfile,
    'profile-connection-followers': toStatements.fromFollowers,
    'profile-connection-following': toStatements.fromFollowing,
    'finished': toStatements.fromFinished
  }
);

createAmqpStream(config)
  .then(rpc =>
    streamToDatabase(
      rpc.pipe(parse).pipe(emitFromStream(streams)).pipe(toDebugLog),
      10
    )
  )
  .catch(toErrorLog);
