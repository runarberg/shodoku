export const LIVE_QUERY_CHANNEL_NAME = "live-query-channel";

export const liveQueryChannel = new BroadcastChannel(LIVE_QUERY_CHANNEL_NAME);
export const liveQueryBroadcaster = new BroadcastChannel(
  LIVE_QUERY_CHANNEL_NAME,
);
