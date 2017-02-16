const { Readable } = require('readable-stream');
const {
  TimelineStream,
  LikeStream,
  ConnectionStream,
  ConversationStream,
  TweetStream,
  ListStream,
  getUserProfile
} = require('scrape-twitter');

class ProfileStream extends Readable {

  constructor(username) {
    super({ objectMode: true })
    this.username = username
  }

  _read() {
    getUserProfile(this.username)
      .then(profile => {
        this.push(profile);
        this.push(null);
      })
      .catch(error => {
        console.error(error);
        this.push(null);
      });
  }

}

const streams = {
  timeline: {
    class: TimelineStream,
    toArgs: (payload) => [ payload.username, { count: payload.count } ],
    type: 'tweet'
  },
  likes: {
    class: LikeStream,
    toArgs: (payload) => [ payload.username, { count: payload.count, env: process.env } ],
    type: 'tweet-like'
  },
  followers: {
    class: ConnectionStream,
    toArgs: (payload) => [ payload.username, 'followers', process.env ],
    type: 'profile-connection-followers'
  },
  following: {
    class: ConnectionStream,
    toArgs: (payload) => [ payload.username, 'following', process.env ],
    type: 'profile-connection-following'
  },
  conversation: {
    class: ConversationStream,
    toArgs: (payload) => [ payload.username, payload.id, { count: payload.count } ],
    type: 'tweet'
  },
  search: {
    class: TweetStream,
    toArgs: (payload) => [ payload.query, payload.type || 'top', { count: payload.count } ],
    type: 'tweet'
  },
  list: {
    class: ListStream,
    toArgs: (payload) => [ payload.username, payload.listName || 'list', { count: payload.count } ],
    type: 'tweet'
  },
  profile: {
    class: ProfileStream,
    toArgs: (payload) => [ payload.username ],
    type: 'profile'
  }
};

module.exports = streams;
