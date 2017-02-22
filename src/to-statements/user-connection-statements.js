const {
  createNodeStatement,
  createRelationshipStatement
} = require('stream-to-neo4j');

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

module.exports = createUserConnectionStatements;
