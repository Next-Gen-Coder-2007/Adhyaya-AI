import { useState, useEffect } from 'react';
import { X, Sparkles, Film, Play, Check, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../../api/axios';

const STARTER_PRESETS = [
  {
    label: 'React in 100s',
    title: 'React in 100 Seconds',
    url: 'https://www.youtube.com/watch?v=Tn6-PIqc4UM',
    description: 'Learn React fundamentals, JSX, components, and virtual DOM in record time.',
    thumbnail: 'https://img.youtube.com/vi/Tn6-PIqc4UM/hqdefault.jpg'
  },
  {
    label: 'Python Crash Course',
    title: 'Python in 100 Seconds',
    url: 'https://www.youtube.com/watch?v=x7X9w_GIm1s',
    description: 'A rapid overview of Python language syntax, features, and ecosystem.',
    thumbnail: 'https://img.youtube.com/vi/x7X9w_GIm1s/hqdefault.jpg'
  },
  {
    label: 'Neural Networks 101',
    title: 'Neural Networks in 100 Seconds',
    url: 'https://www.youtube.com/watch?v=aircAruvnKk',
    description: 'Understand deep learning nodes, weights, biases, and backpropagation.',
    thumbnail: 'https://img.youtube.com/vi/aircAruvnKk/hqdefault.jpg'
  },
  {
    label: 'Git & GitHub',
    title: 'Git in 100 Seconds',
    url: 'https://www.youtube.com/watch?v=hwP7mwU4ycQ',
    description: 'Master version control, branches, staging, commits, and pull requests.',
    thumbnail: 'https://img.youtube.com/vi/hwP7mwU4ycQ/hqdefault.jpg'
  },
];

const CreateCourseModal = ({ isOpen, onClose, fetchCourses }) => {
  const [ytLink, setYtLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      setYtLink('');
      setThumbnailUrl('');
      setTitle('');
      setDescription('');
      setIsPlaylist(false);
      setError(null);
      setSubmitting(false);
    }
  }, [isOpen]);

  const extractThumbnailUrl = async (url) => {
    if (!url) return { thumbnailUrl: '', title: '', description: '', isPlaylist: false };

    const videoRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([0-9A-Za-z_-]{11})/;
    const videoMatch = url.match(videoRegex);

    if (videoMatch) {
      const videoId = videoMatch[1];
      const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      const fallbackTitle = `Mastering Course: ${videoId}`;
      const fallbackDesc = 'AI-structured interactive course modules, quizzes, and tutor assistance.';

      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (apiKey) {
        try {
          const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${apiKey}`
          );
          const item = response.data.items?.[0];
          if (item) {
            return {
              thumbnailUrl: thumb,
              title: item.snippet?.title || fallbackTitle,
              description: item.snippet?.description || fallbackDesc,
              isPlaylist: false,
            };
          }
        } catch (e) {
          // fallback gracefully
        }
      }

      return { thumbnailUrl: thumb, title: fallbackTitle, description: fallbackDesc, isPlaylist: false };
    }

    const playlistRegex = /[?&]list=([a-zA-Z0-9_-]+)/;
    const playlistMatch = url.match(playlistRegex);

    if (playlistMatch) {
      const playlistId = playlistMatch[1];
      const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
      if (apiKey) {
        try {
          const response = await axios.get(
            `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${playlistId}&key=${apiKey}`
          );
          const item = response.data.items?.[0];
          const thumb = item?.snippet?.thumbnails?.high?.url || item?.snippet?.thumbnails?.default?.url || '';
          return {
            thumbnailUrl: thumb,
            title: item?.snippet?.title || 'YouTube Playlist Course',
            description: item?.snippet?.description || 'Curated series of lectures and modules.',
            isPlaylist: true,
          };
        } catch (e) {
          // fallback
        }
      }
      return {
        thumbnailUrl: '',
        title: 'Curated Playlist Course',
        description: 'Multi-video course track.',
        isPlaylist: true,
      };
    }

    return { thumbnailUrl: '', title: '', description: '', isPlaylist: false };
  };

  useEffect(() => {
    let active = true;
    const loadPreview = async () => {
      if (!ytLink) {
        setThumbnailUrl('');
        setTitle('');
        setDescription('');
        setIsPlaylist(false);
        return;
      }

      setLoadingPreview(true);
      setError(null);
      try {
        const data = await extractThumbnailUrl(ytLink);
        if (active) {
          setThumbnailUrl(data.thumbnailUrl);
          if (!title) setTitle(data.title);
          if (!description) setDescription(data.description);
          setIsPlaylist(data.isPlaylist);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (active) setLoadingPreview(false);
      }
    };

    const timer = setTimeout(loadPreview, 300);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [ytLink]);

  const handleSelectPreset = (preset) => {
    setYtLink(preset.url);
    setTitle(preset.title);
    setDescription(preset.description);
    setThumbnailUrl(preset.thumbnail);
    setIsPlaylist(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ytLink) return;

    setSubmitting(true);
    setError(null);

    try {
      const courseData = {
        title: title || 'New AI Course',
        description: description || 'Comprehensive AI-generated learning pathway.',
        image_url: thumbnailUrl || `https://img.youtube.com/vi/default/hqdefault.jpg`,
        youtube_url: ytLink,
        is_playlist: isPlaylist,
        status: 'generating',
      };

      await api.post('/courses', courseData);
      if (fetchCourses) await fetchCourses();
      onClose();
    } catch (err) {
      console.error('Error generating course:', err);
      setError(err.response?.data?.detail || 'Failed to initialize course generation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-xl p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Generate AI Course</h2>
              <p className="text-xs text-zinc-400">Transform any YouTube video or playlist into a full interactive course</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 1-Click Starter Presets */}
        <div className="space-y-2">
          <label className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
            ⚡ Quick Starters (One-Click Testing)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {STARTER_PRESETS.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectPreset(p)}
                className={`p-2.5 rounded-xl border text-xs text-left transition-all cursor-pointer ${
                  ytLink === p.url
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                    : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700'
                }`}
              >
                <span className="block font-semibold truncate">{p.label}</span>
                <span className="text-[9px] text-zinc-500 block truncate">1-Click Load</span>
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-800/60 text-xs text-red-400 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Course Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
              <span>YouTube Video or Playlist URL</span>
              {loadingPreview && <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />}
            </label>
            <div className="relative">
              <Film className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                required
                value={ytLink}
                onChange={(e) => setYtLink(e.target.value)}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          {thumbnailUrl && (
            <div className="p-3.5 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex gap-4 items-center">
              <div className="w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0 relative">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-white truncate">{title || 'Fetching details...'}</p>
                <p className="text-[10px] text-zinc-500 line-clamp-2">{description || 'Ready to structure into modules.'}</p>
                {isPlaylist && (
                  <span className="inline-block text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                    Playlist Track
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">Custom Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Web Development with React"
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:border-amber-500 text-xs text-white placeholder-zinc-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !ytLink}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-xl shadow-amber-500/15 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Launching AI Curriculum Agents...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Interactive Course</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;