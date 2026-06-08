import React, { useState, useEffect, useRef } from 'react';
import YouTube from 'react-youtube';
import {
  PlayCircle,
  PauseCircle,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  Maximize,
  Minimize,
} from 'lucide-react';
const CustomYouTubePlayer = ({
  videoId,
  startTime = 0,
  endTime = null,
  onReady,
  onError,
}) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const opts = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      controls: 0,
      disablekb: 1,
      fs: 0,
      iv_load_policy: 3,
      modestbranding: 1,
      rel: 0,
      showinfo: 0,
      start: startTime,
      enablejsapi: 1,
      origin: window.location.origin,
      widget_referrer: window.location.href,
    },
  };
  const onPlayerReady = (event) => {
    setPlayer(event.target);
    setDuration(event.target.getDuration());
    event.target.setVolume(volume);
    if (isMuted) event.target.mute();
    if (onReady) onReady(event.target);
  };
  const onPlayerStateChange = (event) => {
    if (event.data === 1) setIsPlaying(true);
    else if (event.data === 2 || event.data === 0) setIsPlaying(false);
  };
  const onPlayerError = (event) => {
    setPlayerError('Failed to load video. Please try again later.');
    if (onError) onError('Failed to load video. Please try again later.');
  };
  const updateTime = () => {
    if (player) {
      const newTime = player.getCurrentTime();
      setCurrentTime(newTime);
      if (endTime && newTime >= endTime) {
        player.pauseVideo();
        player.seekTo(startTime);
      }
    }
  };
  useEffect(() => {
    if (player) intervalRef.current = setInterval(updateTime, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [player]);
  useEffect(() => {
    return () => {
      if (player) {
        try { player.destroy(); } catch (e) { console.warn('Player cleanup failed:', e); }
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
  const togglePlayPause = () => {
    if (player) {
      if (isPlaying) player.pauseVideo();
      else player.playVideo();
      setIsPlaying(!isPlaying);
    }
  };
  const seekTo = (time) => {
    if (player) {
      player.seekTo(time, true);
      setCurrentTime(time);
    }
  };
  const skip = (seconds) => {
    if (player) {
      const newTime = currentTime + seconds;
      if (newTime >= startTime && (endTime ? newTime <= endTime : true)) {
        seekTo(newTime);
      }
    }
  };
  const toggleMute = () => {
    if (player) {
      if (isMuted) player.unMute();
      else player.mute();
      setIsMuted(!isMuted);
    }
  };
  const handleVolumeChange = (e) => {
    const newVolume = parseInt(e.target.value);
    setVolume(newVolume);
    if (player) {
      player.setVolume(newVolume);
      if (newVolume === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  };
  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === undefined) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };
  const progressPercent = endTime
    ? ((currentTime - startTime) / (endTime - startTime)) * 100
    : (currentTime / duration) * 100;
  const handleProgressClick = (e) => {
    if (!player) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percent = (clickPosition / rect.width) * 100;
    const newTime = endTime
      ? startTime + (percent / 100) * (endTime - startTime)
      : (percent / 100) * duration;
    seekTo(newTime);
  };
  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!isFullscreen) {
      if (container.requestFullscreen) container.requestFullscreen();
      else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
      else if (container.msRequestFullscreen) container.msRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
      else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);
  const styles = {
    bg: 'bg-zinc-900',
    progress: 'bg-zinc-700',
    progressFilled: 'bg-amber-500',
    button: 'text-zinc-300 hover:text-white',
    buttonActive: 'text-amber-500',
    slider: 'bg-zinc-700',
    sliderThumb: 'bg-amber-500',
  };
  if (playerError) {
    return (
      <div className={`rounded-xl ${styles.bg} p-4 text-center w-full`}>
        <p className="text-red-500 text-sm">{playerError}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 px-4 py-2 bg-zinc-800 text-white text-xs rounded-lg hover:bg-zinc-700"
        >
          Retry
        </button>
      </div>
    );
  }
  return (
    <div
      ref={containerRef}
      className={`rounded-xl ${styles.bg} w-full overflow-visible relative`}
    >
      {}
      <div className="aspect-video w-full bg-black relative">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onError={onPlayerError}
          className="w-full h-full absolute top-0 left-0"
        />
        {}
        <style>{`
          .youtube-iframe iframe {
            pointer-events: none !important;
          }
        `}</style>
      </div>
      {}
      <div className="p-4 space-y-3 w-full">
        {}
        <div
          className={`h-1 rounded-full cursor-pointer ${styles.progress}`}
          onClick={handleProgressClick}
        >
          <div
            className={`h-full rounded-full ${styles.progressFilled}`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        {}
        <div className="flex items-center justify-between text-xs text-zinc-400">
          <span>{formatTime(currentTime)}</span>
          <span>{endTime ? formatTime(endTime) : formatTime(duration)}</span>
        </div>
        {}
        <div className="flex items-center justify-between">
          {}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className={styles.button} disabled={!player}>
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={100}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className={`w-20 h-1 rounded-full appearance-none cursor-pointer ${styles.slider}`}
              disabled={!player}
            />
          </div>
          {}
          <div className="flex items-center gap-4">
            <button
              onClick={() => skip(-5)}
              className={`transition-colors ${styles.button}`}
              disabled={!player}
            >
              <SkipBack className="w-5 h-5" />
            </button>
            <button
              onClick={togglePlayPause}
              className={`transition-colors ${isPlaying ? styles.buttonActive : styles.button}`}
              disabled={!player}
            >
              {isPlaying ? <PauseCircle className="w-6 h-6" /> : <PlayCircle className="w-6 h-6" />}
            </button>
            <button
              onClick={() => skip(5)}
              className={`transition-colors ${styles.button}`}
              disabled={!player}
            >
              <SkipForward className="w-5 h-5" />
            </button>
            {}
            <button
              onClick={toggleFullscreen}
              className={`transition-colors ${styles.button}`}
              disabled={!player}
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CustomYouTubePlayer;