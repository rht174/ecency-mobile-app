const QUERIES = {
  DRAFTS: {
    GET: 'QUERY_GET_DRAFTS',
  },
  SCHEDULES: {
    GET: 'QUERY_GET_SCHEDULES',
  },
  NOTIFICATIONS: {
    GET: 'QERUY_GET_NOTIFICATIONS',
  },
  ANNOUNCEMENTS: {
    GET: 'QERUY_GET_ANNOUNCEMENTS',
  },
  SNIPPETS: {
    GET: 'QUERY_GET_SNIPPETS',
  },
  MEDIA: {
    GET: 'QUERY_GET_UPLOADS',
    GET_VIDEOS: 'QUERY_GET_VIDEO_UPLOADS',
  },
  WALLET: {
    GET: 'QUERY_GET_ASSETS',
    UNCLAIMED_GET: 'QUERY_GET_UNCLAIMED',
    GET_ACTIVITIES: 'QUERY_GET_ACTIVITIES',
    GET_PENDING_REQUESTS: 'GET_PENDING_REQUESTS',
  },
  POST: {
    GET: 'QUERY_GET_POST',
    GET_POLL: 'QUERY_GET_POLL',
    GET_DISCUSSION: 'QUERY_GET_DISCUSSION',
    SIGN_POLL_VOTE: 'SIGN_POLL_VOTE',
    GET_REBLOGS: 'GET_REBLOGS',
    REBLOG_POST: 'REBLOG_POST',
  },
  LEADERBOARD: {
    GET: 'QUERY_GET_LEADERBOARD',
  },
  WAVES: {
    GET: 'QUERY_GET_WAVES',
    INITIAL_CONTAINERS: 'QUERY_DATA_INITIAL_CONTAINERS',
  },
  SETTINGS: {
    GET_SERVERS: 'QUERY_GET_SERVERS_LIST',
  },
  REDEEM: {
    GET_BOOST_PLUS_PRICES: 'REDEEM_GET_BOOST_PLUS_PRICES',
  },
};

export default QUERIES;
