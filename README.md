# `twitter-to-neo4j`
> Twitter to Neo4j Daemon

## Installation

1. `brew install rabbitmq`
2. `brew install neo4j` (and setup a username and password)
3. `git clone git@github.com:duplotech/twitter-to-neo4j.git && npm install`

## Start 

Ensure that there are valid environment variables set [for the configuration](https://github.com/duplotech/twitter-to-neo4j/blob/master/src/config.js).

Run `twitter-to-neo4j-daemon` and then run `twitter-to-neo4j [command]` to create an execute environment in which you can send commands to the daemon.
