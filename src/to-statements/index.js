const createUserConnectionStatements = require('./user-connection-statements');
const createTweetStatements = require('./tweet-statements');
const createLikeStatements = require('./like-statements');

const fromTweet = message => {
  const parentUser = { screenName: message._context.payload.username };
  const tweet = message.data;
  return createTweetStatements(parentUser, tweet);
};
const fromLike = message => {
  const parentUser = { screenName: message._context.payload.username };
  const tweet = message.data;
  return createLikeStatements(parentUser, tweet);
};
const fromProfile = message => {
  const profile = message.data;
  return createNodeStatement({ label: 'User', props: profile, idName: 'screenName' });
};
const fromFollowers = message => {
  const following = { screenName: message._context.payload.username };
  const follower = message.data;
  return createUserConnectionStatements(following, follower);
};
const fromFollowing = message => {
  const following = message.data;
  const follower = { screenName: message._context.payload.username };
  return createUserConnectionStatements(following, follower);
};
const fromFinished = () => ({ commit: true });

module.exports = {
  fromTweet,
  fromLike,
  fromProfile,
  fromFollowers,
  fromFollowing,
  fromFinished
};
