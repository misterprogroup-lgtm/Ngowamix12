import Mux from '@mux/mux-node';

const muxTokenId = process.env.MUX_TOKEN_ID;
const muxTokenSecret = process.env.MUX_TOKEN_SECRET;

function getMuxClient() {
  if (!muxTokenId || !muxTokenSecret) return null;
  return new Mux({ tokenId: muxTokenId, tokenSecret: muxTokenSecret });
}

export async function createMuxLiveStream(title: string) {
  const mux = getMuxClient();
  if (!mux) return null;

  const liveStream = await mux.video.liveStreams.create({
    playback_policy: 'public',
    new_asset_settings: { playback_policy: 'public' },
    latency_mode: 'low',
    reconnect_window: 60,
    generate_recording_title: true,
  });

  return {
    muxLiveStreamId: liveStream.id,
    muxPlaybackId: liveStream.playback_ids?.[0]?.id || null,
    muxStreamKey: liveStream.stream_key || null,
    muxRtmpUrl: `rtmps://global-live.mux.com:443/app`,
  };
}

export async function getMuxLiveStream(muxLiveStreamId: string) {
  const mux = getMuxClient();
  if (!mux) return null;
  return mux.video.liveStreams.retrieve(muxLiveStreamId);
}

export async function deleteMuxLiveStream(muxLiveStreamId: string) {
  const mux = getMuxClient();
  if (!mux) return;
  await mux.video.liveStreams.delete(muxLiveStreamId);
}

export async function signalMuxLiveStreamComplete(muxLiveStreamId: string) {
  const mux = getMuxClient();
  if (!mux) return;
  await mux.video.liveStreams.signalComplete(muxLiveStreamId);
}

export function parseMuxData(streamKey: string): {
  muxLiveStreamId?: string;
  muxPlaybackId?: string;
  muxStreamKey?: string;
  muxRtmpUrl?: string;
} | null {
  try {
    const parsed = JSON.parse(streamKey);
    if (parsed?.muxLiveStreamId) return parsed;
  } catch { /* not JSON, old format */ }
  return null;
}

export function encodeMuxData(data: {
  muxLiveStreamId: string;
  muxPlaybackId: string | null;
  muxStreamKey: string | null;
  muxRtmpUrl: string | null;
}): string {
  return JSON.stringify(data);
}
