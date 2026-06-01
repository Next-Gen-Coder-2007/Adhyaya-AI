import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import axios from 'axios';
import api from '../../api/axios';

const CreateCourseModal = ({ isOpen, onClose, fetchCourses }) => {
  const [ytLink, setYtLink] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!isOpen) {
      setYtLink('');
      setThumbnailUrl('');
      setTitle('');
      setDescription('');
    }
  }, [isOpen]);

  const extractThumbnailUrl = async (url) => {
    if (!url) return { thumbnailUrl: '', title: '', description: '' };

    const videoRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const videoMatch = url.match(videoRegex);

    if (videoMatch) {
      const videoId = videoMatch[1];
      const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${videoId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
        );
        const data = await response.data;
        const videoTitle = data.items?.[0]?.snippet?.title || 'Untitled Video';
        const videoDescription = data.items?.[0]?.snippet?.description || 'No description available';
        return { thumbnailUrl, title: videoTitle, description: videoDescription };
      } catch (err) {
        console.error(err);
        return { thumbnailUrl, title: 'Untitled Video', description: 'No description available' };
      }
    }

    const playlistRegex = /[?&]list=([^&]+)/;
    const playlistMatch = url.match(playlistRegex);

    if (playlistMatch) {
      const playlistId = playlistMatch[1];
      try {
        const response = await axios.get(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=1&playlistId=${playlistId}&key=${import.meta.env.VITE_YOUTUBE_API_KEY}`
        );
        const data = await response.data;
        const playlistTitle = data.items?.[0]?.snippet?.title || 'Untitled Playlist';
        const thumbnailUrl =
          data.items?.[0]?.snippet?.thumbnails?.maxres?.url ||
          data.items?.[0]?.snippet?.thumbnails?.high?.url ||
          '';
        const playlistDescription = data.items?.[0]?.snippet?.description || 'No description available';
        return { thumbnailUrl, title: playlistTitle, description: playlistDescription };
      } catch (err) {
        console.error(err);
        return { thumbnailUrl: '', title: 'Untitled Playlist', description: 'No description available' };
      }
    }

    return { thumbnailUrl: '', title: '', description: '' };
  };

  useEffect(() => {
    const loadThumbnailAndTitle = async () => {
      const { thumbnailUrl, title, description } = await extractThumbnailUrl(ytLink);
      setThumbnailUrl(thumbnailUrl);
      setTitle(title);
      setDescription(description);
    };

    if (ytLink) {
      loadThumbnailAndTitle();
    } else {
      setThumbnailUrl('');
      setTitle('');
      setDescription('');
    }
  }, [ytLink]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const courseData = {
        image_url: thumbnailUrl,
        title,
        description,
      };

      const response = await api.post('/courses', courseData);
      console.log('Course created:', response.data);
      await fetchCourses();
      setYtLink('');
      setThumbnailUrl('');
      setTitle('');
      setDescription('');
      onClose();
    } catch (error) {
      console.error('Error creating course:', error);
    }
};

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">Create Course</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5 text-zinc-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-400">YouTube Link</label>
            <input
              type="url"
              placeholder="Paste YouTube video or playlist link..."
              value={ytLink}
              onChange={(e) => setYtLink(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 focus:border-amber-500 focus:outline-none text-sm text-white transition-colors"
              required
            />
          </div>

          {thumbnailUrl && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-400">Preview</label>
              <div className="relative w-full overflow-hidden rounded-lg border border-zinc-800">
                <img
                  src={thumbnailUrl}
                  alt="YouTube Thumbnail"
                  className="w-full h-auto aspect-video object-cover"
                  onError={(e) => {
                    e.target.src = 'https://placehold.co/600x400?text=Thumbnail+Not+Available';
                  }}
                />
              </div>
              {title && (
                <p className="text-sm text-zinc-300 mt-2 line-clamp-2">{title}</p>
              )}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 text-zinc-950 font-medium hover:bg-amber-400 transition-colors"
          >
            Generate Course
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateCourseModal;