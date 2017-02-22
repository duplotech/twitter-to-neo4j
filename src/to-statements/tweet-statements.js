const {
  createNodeStatement,
  createRelationshipStatement
} = require('stream-to-neo4j');

// Ensure that we are not sending arrays, undefined or objects into Neo4j.
const cleanProperties = obj => {
  const newObj = Object.assign({}, obj);
  Object.keys(obj).forEach(key => {
    if (typeof newObj[key] === 'undefined') {
      delete newObj[key];
    } else if (Array.isArray(newObj[key]) || typeof newObj[key] === 'object') {
      newObj[key] = JSON.stringify(newObj[key]);
    }
  });
  return newObj;
};

const createRetweetStatements = (parentUser, tweet) => {
  return [
    createNodeStatement({ label: 'User', props: parentUser, idName: 'screenName' }),
    createRelationshipStatement({
      left: { label: 'User', id: parentUser.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: tweet.id, idName: 'id' },
      type: 'RETWEETED',
      direction: 'DIRECTION_RIGHT'
    })
  ];
};

const createQuoteStatements = (tweeter, quote) => {
  const quotee = { screenName: quote.screenName };
  return [
    createNodeStatement({ label: 'User', props: quotee, idName: 'screenName' }),
    createNodeStatement({ label: 'Tweet', props: quote, idName: 'id' }),
    createRelationshipStatement({
      left: { label: 'User', id: quotee.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: quote.id, idName: 'id' },
      type: 'TWEETED',
      direction: 'DIRECTION_RIGHT'
    }),
    createRelationshipStatement({
      left: { label: 'User', id: tweeter.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: quote.id, idName: 'id' },
      type: 'QUOTED',
      direction: 'DIRECTION_RIGHT'
    })
  ];
};

const createReplyToTweetStatement = (tweet) => {
  return [
    createRelationshipStatement({
      left: { label: 'Tweet', id: tweet.id, idName: 'id' },
      right: { label: 'Tweet', id: tweet.isReplyToId, idName: 'id' },
      type: 'REPLIED_TO',
      direction: 'DIRECTION_RIGHT'
    })
  ];
};

const createUrlStatements = (tweetId, urls = []) =>
  urls.reduce((statements, { url }) => {
    const urlEntity = { url };
    statements.push(
      createNodeStatement({ label: 'URL', props: urlEntity, idName: 'url' })
    );
    statements.push(
      createRelationshipStatement({
        left: { label: 'Tweet', id: tweetId, idName: 'id' },
        right: { label: 'URL', id: urlEntity.url, idName: 'url' },
        type: 'LINKED_TO',
        direction: 'DIRECTION_RIGHT'
      })
    );
    return statements;
  }, []);

const createImageStatements = (tweetId, images = []) =>
  images.reduce((statements, url) => {
    const imageEntity = { url };
    statements.push(
      createNodeStatement({ label: 'Image', props: imageEntity, idName: 'url' })
    );
    statements.push(
      createRelationshipStatement({
        left: { label: 'Tweet', id: tweetId, idName: 'id' },
        right: { label: 'Image', id: imageEntity.url, idName: 'url' },
        type: 'LINKED_TO',
        direction: 'DIRECTION_RIGHT'
      })
    );
    return statements;
  }, []);

const createUserMentionStatements = (tweetId, userMentions = []) =>
  userMentions.reduce((statements, { screenName }) => {
    const userMention = { screenName };
    statements.push(
      createNodeStatement({ label: 'User', props: userMention, idName: 'screenName' })
    );
    statements.push(
      createRelationshipStatement({
        left: { label: 'Tweet', id: tweetId, idName: 'id' },
        right: { label: 'User', id: userMention.screenName, idName: 'screenName' },
        type: 'MENTIONED',
        direction: 'DIRECTION_RIGHT'
      })
    );
    return statements;
  }, []);

const createHashtagStatements = (tweetId, hashtags = []) =>
  hashtags.reduce((statements, { hashtag }) => {
    const hashtagProps = { hashtag };
    statements.push(
      createNodeStatement({ label: 'Hashtag', props: hashtagProps, idName: 'hashtag' })
    );
    statements.push(
      createRelationshipStatement({
        left: { label: 'Tweet', id: tweetId, idName: 'id' },
        right: { label: 'Hashtag', id: hashtagProps.hashtag, idName: 'hashtag' },
        type: 'BELONGS_TO',
        direction: 'DIRECTION_RIGHT'
      })
    );
    return statements;
  }, []);

const createTweetStatements = (parentUser, tweet) => {
  const tweeter = { screenName: tweet.screenName };

  const tweetUserConnection = [
    createNodeStatement({ label: 'User', props: tweeter, idName: 'screenName' }),
    createNodeStatement({ label: 'Tweet', props: cleanProperties(tweet), idName: 'id' }),
    createRelationshipStatement({
      left: { label: 'User', id: tweeter.screenName, idName: 'screenName' },
      right: { label: 'Tweet', id: tweet.id, idName: 'id' },
      type: 'TWEETED',
      direction: 'DIRECTION_RIGHT'
    })
  ];
  const retweetUserConnection = tweet.isRetweet ? createRetweetStatements(parentUser, tweet) : [];
  const quoteTweetConnection = tweet.quote ? createQuoteStatements(tweeter, tweet.quote) : [];
  const replyToTweetConnection = tweet.isReplyToId ? createReplyToTweetStatement(tweet) : [];
  const tweetToUrls = createUrlStatements(tweet.id, tweet.urls);
  const tweetToImages = createImageStatements(tweet.id, tweet.images);
  const tweetToUserMentions = createUserMentionStatements(tweet.id, tweet.userMentions);
  const tweetToHashtags = createHashtagStatements(tweet.id, tweet.hashtags);

  return [].concat(
    tweetUserConnection,
    retweetUserConnection,
    quoteTweetConnection,
    replyToTweetConnection,
    tweetToUrls,
    tweetToImages,
    tweetToUserMentions,
    tweetToHashtags
  );
};

module.exports = createTweetStatements;
