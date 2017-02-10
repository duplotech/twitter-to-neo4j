#!/usr/bin/env node

const yargs = require('yargs');
const debug = require('debug')('twitter-to-neo4j:client');

const { stringify } = require('JSONStream');
const tap = require('tap-stream');

const {
  createToCommands,
  createAmqpStream,
  config
} = require('../src');

const toDebugLog = tap(data => debug(data));
const toErrorLog = console.error.bind(console);

const input = process.stdin;
input.on('end', () => process.exit(0));

const argv =
  yargs
    .usage('Usage: $0 <command>')
      .demandCommand(1)
      .command('timeline', 'Get timelines')
      .command('likes', 'Get likes')
      .command('following', 'Get following')
      .command('followers', 'Get followers')
      .command('conversation', 'Get conversation')
      .command('search', 'Search tweets')
      .command('list', 'Get lists')
      .command('profile', 'Get profiles')
    .help('h')
    .alias('h', 'help')
    .argv;

const command = argv._[0];

const identity = v => v;
const commandToPayloads = {
  timeline: line => ({ username: line }),
  likes: line => ({ username: line }),
  followers: line => ({ username: line }),
  following: line => ({ username: line }),
  conversation: line => {
    const [ username, id ] = line.split(/\s+/);
    return { username, id };
  },
  search: line => ({ query: line }),
  list: line => {
    const [ username, listName ] = line.split(/\s+/);
    return { username, listName };
  },
  profile: line => ({ username: line })
}
const toCommands = createToCommands(command, commandToPayloads[command] || identity);

createAmqpStream(config)
  .then(rpc =>
    toCommands(input)
      .pipe(toDebugLog)
      .pipe(stringify(false))
      .pipe(rpc)
  )
  .catch(toErrorLog);
