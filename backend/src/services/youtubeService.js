import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';
import { env } from '../config/env.js';

const BROWSER_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36';

export function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/|live\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/i
  );
  if (match) return match[1];

  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    if (parsed.searchParams.has('v')) {
      const v = parsed.searchParams.get('v');
      if (v && v.length === 11) return v;
    }
  } catch {
    // ignore
  }

  return null;
}

export function isPlaylistUrl(url) {
  if (!url) return false;
  return /[?&]list=([a-zA-Z0-9_-]+)/.test(url);
}

export function extractPlaylistId(url) {
  if (!url) return null;
  const match = url.match(/[?&]list=([a-zA-Z0-9_-]+)/);
  return match ? match[1] : null;
}

export function parseIsoDuration(duration) {
  if (!duration || typeof duration !== 'string') return 0;
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

export function parseTimeStringToSeconds(timeStr) {
  if (!timeStr) return 0;
  const clean = timeStr.trim().replace(/[\[\]\(\)]/g, '');
  const parts = clean.split(':').map((p) => parseInt(p, 10));
  if (parts.some(isNaN)) return 0;

  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return 0;
}

export function extractChaptersFromDescription(description, totalDuration = 0) {
  if (!description || typeof description !== 'string') return [];

  const lines = description.split(/\r?\n/);
  const rawChapters = [];

  const timestampRegex =
    /(?:^|\s)(?:(?:(\d{1,2}):)?(\d{1,2}):(\d{2}))(?:\s*[-–—:]\s*|\s+)(.+)$/i;
  const altTimestampRegex =
    /(?:^|\s)(?:\[|\()?(?:(?:(\d{1,2}):)?(\d{1,2}):(\d{2}))(?:\]|\))?(?:\s*[-–—:]\s*|\s+)(.+)$/i;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    let match = trimmed.match(timestampRegex) || trimmed.match(altTimestampRegex);
    if (match) {
      const hours = match[1] ? parseInt(match[1], 10) : 0;
      const minutes = parseInt(match[2] || '0', 10);
      const seconds = parseInt(match[3] || '0', 10);
      const startSec = hours * 3600 + minutes * 60 + seconds;
      const title = (match[4] || '').trim().replace(/^[-–—:.\s]+/, '').trim();

      if (title && title.length >= 2) {
        rawChapters.push({
          title,
          start: startSec,
        });
      }
    }
  }

  if (rawChapters.length < 2) return [];

  // Sort chronologically and deduplicate
  rawChapters.sort((a, b) => a.start - b.start);
  const chapters = [];

  for (let i = 0; i < rawChapters.length; i++) {
    const current = rawChapters[i];
    const next = rawChapters[i + 1];
    const end = next ? next.start : (totalDuration > current.start ? totalDuration : current.start + 600);

    if (end > current.start) {
      chapters.push({
        title: current.title,
        start: current.start,
        end: end,
      });
    }
  }

  return chapters;
}

export async function getVideoMetadata(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return {
      videoId: null,
      title: 'Interactive Course Track',
      description: '',
      durationSec: 3600,
      thumbnailUrl: null,
      chapters: [],
    };
  }

  let title = '';
  let description = '';
  let durationSec = 0;
  let thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  let chapters = [];

  // Strategy 1: YouTube Data API v3
  if (env.YOUTUBE_API_KEY) {
    try {
      const youtube = google.youtube({
        version: 'v3',
        auth: env.YOUTUBE_API_KEY,
      });

      const res = await youtube.videos.list({
        part: ['snippet', 'contentDetails'],
        id: [videoId],
      });

      const item = res.data.items?.[0];
      if (item) {
        title = item.snippet?.title || '';
        description = item.snippet?.description || '';
        if (item.contentDetails?.duration) {
          durationSec = parseIsoDuration(item.contentDetails.duration);
        }
        thumbnailUrl =
          item.snippet?.thumbnails?.maxres?.url ||
          item.snippet?.thumbnails?.high?.url ||
          thumbnailUrl;
      }
    } catch {
      // Fallback
    }
  }

  // Strategy 2: Innertube player endpoint
  if (!title || durationSec === 0) {
    try {
      const innertubeRes = await fetch(
        'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': BROWSER_USER_AGENT,
          },
          body: JSON.stringify({
            videoId,
            context: {
              client: {
                clientName: 'WEB',
                clientVersion: '2.20240410.01.00',
                hl: 'en',
                gl: 'US',
              },
            },
          }),
        }
      );

      if (innertubeRes.ok) {
        const data = await innertubeRes.json();
        const details = data.videoDetails;
        if (details) {
          if (!title) title = details.title || '';
          if (!description) description = details.shortDescription || '';
          if (details.lengthSeconds && durationSec === 0) {
            durationSec = parseInt(details.lengthSeconds, 10);
          }
        }
      }
    } catch {
      // Fallback
    }
  }

  if (description) {
    chapters = extractChaptersFromDescription(description, durationSec);
  }

  if (durationSec === 0) {
    durationSec = 3600; // Fallback default to 1 hour
  }

  return {
    videoId,
    title: title || 'Interactive Course Track',
    description: description || '',
    durationSec,
    thumbnailUrl,
    chapters,
  };
}

function normalizeSnippet(item) {
  const text = (item.text || '').trim();
  const start =
    parseFloat(item.offset ?? item.start ?? 0) /
    (item.offset !== undefined ? 1000 : 1);
  const duration =
    parseFloat(item.duration ?? 0) / (item.offset !== undefined ? 1000 : 1);

  return {
    text,
    start: Math.round(start * 100) / 100,
    end: Math.round((start + duration) * 100) / 100,
  };
}

export async function getTranscript(videoUrl) {
  const videoId = extractVideoId(videoUrl);
  if (!videoId) {
    return [];
  }

  // Strategy 1: Innertube Player API Caption Tracks
  try {
    const innertubeRes = await fetch(
      'https://www.youtube.com/youtubei/v1/player?prettyPrint=false',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': BROWSER_USER_AGENT,
        },
        body: JSON.stringify({
          videoId,
          context: {
            client: {
              clientName: 'WEB',
              clientVersion: '2.20240410.01.00',
              hl: 'en',
              gl: 'US',
            },
          },
        }),
      }
    );

    if (innertubeRes.ok) {
      const data = await innertubeRes.json();
      const tracks =
        data?.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];

      if (tracks.length > 0) {
        // Priority: English manual -> English auto -> Any track
        const selectedTrack =
          tracks.find((t) => t.languageCode === 'en' && !t.kind) ||
          tracks.find((t) => t.languageCode?.startsWith('en')) ||
          tracks.find((t) => t.kind === 'asr' && t.languageCode?.startsWith('en')) ||
          tracks[0];

        if (selectedTrack?.baseUrl) {
          const trackRes = await fetch(`${selectedTrack.baseUrl}&fmt=json3`, {
            headers: { 'User-Agent': BROWSER_USER_AGENT },
          });

          if (trackRes.ok) {
            const json = await trackRes.json();
            const events = json.events || [];
            const items = [];

            for (const ev of events) {
              if (ev.segs && ev.tStartMs !== undefined) {
                const text = ev.segs
                  .map((s) => s.utf8 || '')
                  .join('')
                  .replace(/\n/g, ' ')
                  .trim();
                const start = Math.round((ev.tStartMs / 1000) * 100) / 100;
                const dur = Math.round(((ev.dDurationMs || 0) / 1000) * 100) / 100;
                if (text && text.length > 0) {
                  items.push({
                    text,
                    start,
                    end: Math.round((start + dur) * 100) / 100,
                  });
                }
              }
            }

            if (items.length > 0) {
              return items;
            }
          }
        }
      }
    }
  } catch {
    // Strategy 1 failed, continue
  }

  // Strategy 2: YoutubeTranscript library with language fallbacks
  const languages = ['en', 'en-US', 'en-GB', 'a.en'];
  for (const lang of languages) {
    try {
      const rawItems = await YoutubeTranscript.fetchTranscript(videoId, {
        lang,
      });
      if (rawItems && rawItems.length > 0) {
        const items = rawItems
          .map(normalizeSnippet)
          .filter((item) => item.text.length > 0);
        if (items.length > 0) {
          return items;
        }
      }
    } catch {
      // try next language
    }
  }

  // Strategy 3: YoutubeTranscript default fetch (no language constraint)
  try {
    const rawItems = await YoutubeTranscript.fetchTranscript(videoId);
    if (rawItems && rawItems.length > 0) {
      const items = rawItems
        .map(normalizeSnippet)
        .filter((item) => item.text.length > 0);
      if (items.length > 0) {
        return items;
      }
    }
  } catch {
    // fallback
  }

  // Strategy 4: Direct timedtext fallback fetch from HTML
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`, {
      headers: {
        'User-Agent': BROWSER_USER_AGENT,
        'Accept-Language': 'en-US,en;q=0.9',
      },
    });
    const html = await response.text();

    const captionsMatch = html.match(/"captionTracks":\s*(\[[\s\S]*?\])/);
    if (captionsMatch) {
      const captionTracks = JSON.parse(captionsMatch[1]);
      if (captionTracks && captionTracks.length > 0) {
        const trackUrl = captionTracks[0].baseUrl;
        const trackRes = await fetch(trackUrl, {
          headers: { 'User-Agent': BROWSER_USER_AGENT },
        });
        const xml = await trackRes.text();

        const items = [];
        const regex = /<text start="([\d.]+)" dur="([\d.]+)"[^>]*>(.*?)<\/text>/g;
        let match;
        while ((match = regex.exec(xml)) !== null) {
          const start = parseFloat(match[1]);
          const duration = parseFloat(match[2]);
          const text = match[3]
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&#39;/g, "'")
            .replace(/&quot;/g, '"')
            .replace(/\n/g, ' ')
            .trim();

          if (text) {
            items.push({
              text,
              start: Math.round(start * 100) / 100,
              end: Math.round((start + duration) * 100) / 100,
            });
          }
        }
        if (items.length > 0) {
          return items;
        }
      }
    }
  } catch {
    // all strategies failed
  }

  return [];
}

export async function getPlaylistVideos(playlistUrl) {
  const playlistId = extractPlaylistId(playlistUrl);
  if (!playlistId || !env.YOUTUBE_API_KEY) {
    return [];
  }

  try {
    const youtube = google.youtube({
      version: 'v3',
      auth: env.YOUTUBE_API_KEY,
    });

    const videos = [];
    let nextPageToken = null;

    do {
      const res = await youtube.playlistItems.list({
        part: ['snippet'],
        playlistId,
        maxResults: 50,
        pageToken: nextPageToken || undefined,
      });

      const items = res.data.items || [];
      for (const item of items) {
        const videoId = item.snippet?.resourceId?.videoId;
        if (videoId) {
          videos.push({
            title: item.snippet?.title || 'Untitled Video',
            url: `https://www.youtube.com/watch?v=${videoId}`,
            videoId,
          });
        }
      }
      nextPageToken = res.data.nextPageToken;
    } while (nextPageToken);

    return videos;
  } catch {
    return [];
  }
}
