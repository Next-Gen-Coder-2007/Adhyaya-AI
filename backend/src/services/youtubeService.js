import { YoutubeTranscript } from 'youtube-transcript';
import { google } from 'googleapis';
import { env } from '../config/env.js';

export function extractVideoId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/
  );
  return match ? match[1] : null;
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

function normalizeSnippet(item) {
  const text = (item.text || '').trim();
  const start = parseFloat(item.offset ?? item.start ?? 0) / (item.offset !== undefined ? 1000 : 1);
  const duration = parseFloat(item.duration ?? 0) / (item.offset !== undefined ? 1000 : 1);

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

  // Strategy 1: YoutubeTranscript.fetchTranscript
  try {
    const rawItems = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: 'en',
    });
    if (rawItems && rawItems.length > 0) {
      const items = rawItems
        .map(normalizeSnippet)
        .filter((item) => item.text.length > 0);
      return items;
    }
  } catch {
    // fallback
  }

  // Strategy 2: Default language fetch
  try {
    const rawItems = await YoutubeTranscript.fetchTranscript(videoId);
    if (rawItems && rawItems.length > 0) {
      const items = rawItems
        .map(normalizeSnippet)
        .filter((item) => item.text.length > 0);
      return items;
    }
  } catch {
    // fallback
  }

  // Strategy 3: Direct timedtext fallback fetch
  try {
    const response = await fetch(`https://www.youtube.com/watch?v=${videoId}`);
    const html = await response.text();

    const captionsMatch = html.match(/"captionTracks":\s*(\[.*?\])/);
    if (captionsMatch) {
      const captionTracks = JSON.parse(captionsMatch[1]);
      if (captionTracks && captionTracks.length > 0) {
        const trackUrl = captionTracks[0].baseUrl;
        const trackRes = await fetch(trackUrl);
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
    // all failed
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
