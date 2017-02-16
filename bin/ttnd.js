#!/usr/bin/env node

const debug = require('debug')('twitter-to-neo4j:daemon');
const map = require('through2-map');
const tap = require('tap-stream');
const {
  createStreamToDatabase,
  createNodeStatement,
  createRelationshipStatement
} = require('stream-to-neo4j');

const {
  createAmqpStream,
  emitFromStream,
  streams,
  config
} = require('../src');

const createUserConnectionStatements = (following, follower) => {
  return [
    createNodeStatement({ label: 'User', props: following, idName: 'screenName' }),
    createNodeStatement({ label: 'User', props: follower, idName: 'screenName' }),
    createRelationshipStatement({
      left: { label: 'User', id: following.screenName, idName: 'screenName' },
      right: { label: 'User', id: follower.screenName, idName: 'screenName' },
      type: 'FOLLOWS',
      direction: 'DIRECTION_LEFT'
    })
  ];
};
const createTweetStatements = (parentUser, tweet) => {
  const tweeter = { screenName: tweet.screenName };
  const tweetUserConnection = [
    createNodeStatement({ label: 'User', props: tweeter, idName: 'screenName' }),
    createNodeStatement({ label: 'Tweet', props: tweet, idName: 'id' }),
    createRelationshipStatement({
      left: { label: 'User', id: tweeter.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: tweet.id, idName: 'id' },
      type: 'TWEETED',
      direction: 'DIRECTION_RIGHT'
    })
  ];
  const retweetUserConnection = tweet.isRetweet ? [
    createNodeStatement({ label: 'User', props: parentUser, idName: 'screenName' }),
    createRelationshipStatement({
      left: { label: 'User', id: parentUser.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: tweet.id, idName: 'id' },
      type: 'RETWEETED',
      direction: 'DIRECTION_RIGHT'
    })
  ] : [];

  return [].concat(
    tweetUserConnection,
    retweetUserConnection
  );
};
const createLikeStatements = (parentUser, tweet) => {
  const tweeter = { screenName: tweet.screenName };
  const tweetUserConnection = [
    createNodeStatement({ label: 'User', props: tweeter, idName: 'screenName' }),
    createNodeStatement({ label: 'Tweet', props: tweet, idName: 'id' }),
    createRelationshipStatement({
      left: { label: 'User', id: tweeter.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: tweet.id, idName: 'id' },
      type: 'TWEETED',
      direction: 'DIRECTION_RIGHT'
    })
  ];
  const likeUserConnection = [
    createNodeStatement({ label: 'User', props: parentUser, idName: 'screenName' }),
    createRelationshipStatement({
      left: { label: 'User', id: parentUser.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: tweet.id, idName: 'id' },
      type: 'LIKED',
      direction: 'DIRECTION_RIGHT'
    })
  ];

  return [].concat(
    tweetUserConnection,
    likeUserConnection
  );
};

const parse = map.obj(s => JSON.parse(s));

const toDebugLog = tap(data => debug(data));
const toErrorLog = console.error.bind(console);

const output = process.stdout;

const toTweet = message => {
  const parentUser = { screenName: message._context.payload.username };
  const tweet = {
    screenName: message.data.screenName,
    id: message.data.id,
    time: message.data.time,
    text: message.data.text,
    isRetweet: message.data.isRetweet
  };
  return createTweetStatements(parentUser, tweet);
};
const toLike = message => {
  const parentUser = { screenName: message._context.payload.username };
  const tweet = {
    screenName: message.data.screenName,
    id: message.data.id,
    time: message.data.time,
    text: message.data.text,
    isRetweet: message.data.isRetweet
  };
  return createLikeStatements(parentUser, tweet);
};
const toProfile = message => {
  const profile = {
    screenName: message.data.screenName,
    name: message.data.name,
    profileImage: message.data.profileImage,
    bio: message.data.bio,
    location: message.data.location,
    url: message.data.url,
    joinDate: message.data.joinDate,
    tweetCount: message.data.tweetCount,
    followingCount: message.data.followingCount,
    followerCount: message.data.followerCount,
    likeCount: message.data.likeCount
  };
  return createNodeStatement({ label: 'User', props: profile, idName: 'screenName' });
};
const toFollowers = message => {
  const following = { screenName: message._context.payload.username };
  const follower = {
    screenName: message.data.screenName,
    name: message.data.name,
    profileImage: message.data.profileImage,
    bio: message.data.bio
  };
  return createUserConnectionStatements(following, follower);
};
const toFollowing = message => {
  const following = {
    screenName: message.data.screenName,
    name: message.data.name,
    profileImage: message.data.profileImage,
    bio: message.data.bio
  };
  const follower = { screenName: message._context.payload.username };
  return createUserConnectionStatements(following, follower);
};
const toFinished = () => ({ commit: true });

const streamToDatabase = createStreamToDatabase(
  { url: 'bolt://localhost', username: 'neo4j', password: 'neo4j-password' },
  {
    'tweet': toTweet,
    'tweet-like': toLike,
    'profile': toProfile,
    'profile-connection-followers': toFollowers,
    'profile-connection-following': toFollowing,
    'finished': toFinished
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
