import { useState, useEffect } from 'react';
import { X, Sparkles, Film, AlertCircle, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';

const CreateCourseModal = ({ isOpen, onClose, fetchCourses }) => {
  const [ytLink, setYtLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPlaylist, setIsPlaylist] = useState(false);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const { toast } = useToast();

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
        } catch {
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
        } catch {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!ytLink) {
      toast.warning('Please enter a YouTube video or playlist URL.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const courseData = {
        title: title || 'New AI Course',
        description: description || 'Comprehensive AI-generated learning pathway.',
        image_url: thumbnailUrl || `https://img.youtube.com/vi/default/hqdefault.jpg`,
        video_url: ytLink,
        youtube_url: ytLink,
        is_playlist: isPlaylist,
        status: 'generating',
      };

      await api.post('/courses', courseData);
      toast.success('Course generation started! AI agents are building your curriculum.', 'Course Queued');
      if (fetchCourses) await fetchCourses();
      onClose();
    } catch (err) {
      console.error('Error generating course:', err);
      const msg = err.response?.data?.detail || 'Failed to initialize course generation. Please try again.';
      setError(msg);
      toast.error(msg, 'Generation Failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center modal-backdrop p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl bg-[var(--bg-secondary,#121215)] border border-[var(--border,rgba(255,255,255,0.08))] shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto scrollbar-thin">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[var(--border,rgba(255,255,255,0.08))] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary,#ffffff)]">Generate AI Course</h2>
              <p className="text-xs text-[var(--text-muted,#71717a)]">Transform any YouTube video or playlist into an interactive course</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted,#71717a)] hover:text-[var(--text-primary,#ffffff)] hover:bg-white/5 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
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
            <label className="text-xs font-medium text-[var(--text-secondary,#a1a1aa)] flex items-center justify-between">
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
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))] focus:border-amber-500 text-xs text-[var(--text-primary,#ffffff)] placeholder-zinc-500 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Live Preview Card */}
          {thumbnailUrl && (
            <div className="p-3.5 rounded-2xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))] flex gap-4 items-center">
              <div className="w-28 aspect-video rounded-xl overflow-hidden bg-black shrink-0 relative">
                <img src={thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-[var(--text-primary,#ffffff)] truncate">{title || 'Fetching details...'}</p>
                <p className="text-[10px] text-[var(--text-muted,#71717a)] line-clamp-2">{description || 'Ready to structure into modules.'}</p>
                {isPlaylist && (
                  <span className="inline-block text-[9px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold">
                    Playlist Track
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-[var(--text-secondary,#a1a1aa)]">Custom Title (Optional)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Modern Web Development with React"
              className="w-full px-4 py-2.5 rounded-xl bg-[var(--bg-tertiary,#1c1c21)] border border-[var(--border,rgba(255,255,255,0.08))] focus:border-amber-500 text-xs text-[var(--text-primary,#ffffff)] placeholder-zinc-500 outline-none transition-colors"
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