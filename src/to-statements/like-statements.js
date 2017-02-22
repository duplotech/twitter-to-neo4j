const {
  createNodeStatement,
  createRelationshipStatement
} = require('stream-to-neo4j');

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

module.exports = createLikeStatements;
