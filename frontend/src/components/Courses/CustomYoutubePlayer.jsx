import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Gauge
} from 'lucide-react';

const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5, 2];

const CustomYouTubePlayer = React.memo(({
  videoId,
  startTime = 0,
  endTime = null,
  onReady,
  onError,
  onTimeUpdate
}) => {
  const [player, setPlayer] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(startTime);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [playerError, setPlayerError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const intervalRef = useRef(null);
  const containerRef = useRef(null);
  const playerRef = useRef(null);

  const opts = React.useMemo(() => ({
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
      start: Math.floor(startTime),
      enablejsapi: 1,
      origin: typeof window !== 'undefined' ? window.location.origin : '',
      widget_referrer: typeof window !== 'undefined' ? window.location.href : '',
    },
  }), [startTime]);

  const onPlayerReady = useCallback((event) => {
    const playerInstance = event.target;
    playerRef.current = playerInstance;
    setPlayer(playerInstance);
    setDuration(playerInstance.getDuration() || 0);
    playerInstance.setVolume(volume);
    if (isMuted) playerInstance.mute();
    if (onReady) onReady(playerInstance);

    if (startTime && startTime !== playerInstance.getCurrentTime()) {
      playerInstance.seekTo(startTime, true);
    }
  }, [volume, isMuted, startTime, onReady]);

  const onPlayerStateChange = useCallback((event) => {
    if (event.data === 1) setIsPlaying(true);
    else if (event.data === 2 || event.data === 0) setIsPlaying(false);
  }, []);

  const onPlayerError = useCallback((event) => {
    console.error("YouTube error event:", event);
    setPlayerError('Failed to load video player. Please check URL or connection.');
    if (onError) onError('Failed to load video. Please try again.');
  }, [onError]);

  const updateTime = useCallback(() => {
    if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
      try {
        const newTime = playerRef.current.getCurrentTime();
        setCurrentTime(newTime);
        if (onTimeUpdate) {
          onTimeUpdate(newTime);
        }
        if (endTime && newTime >= endTime) {
          playerRef.current.pauseVideo();
        }
      } catch (e) {
        // ignore iframe access errors during teardown
      }
    }
  }, [endTime, onTimeUpdate]);

  useEffect(() => {
    if (playerRef.current) {
      intervalRef.current = setInterval(updateTime, 500);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [updateTime]);

  useEffect(() => {
    return () => {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (playerRef.current && videoId && typeof playerRef.current.getVideoUrl === 'function') {
      try {
        const currentVideoId = playerRef.current.getVideoUrl()?.split('v=')[1]?.split('&')[0];
        if (currentVideoId !== videoId) {
          playerRef.current.loadVideoById(videoId, startTime);
        } else if (Math.abs(startTime - playerRef.current.getCurrentTime()) > 2) {
          playerRef.current.seekTo(startTime, true);
        }
      } catch (e) {
        // ignore
      }
    }
  }, [videoId, startTime]);

  const togglePlayPause = useCallback(() => {
    if (playerRef.current) {
      if (isPlaying) playerRef.current.pauseVideo();
      else playerRef.current.playVideo();
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const seekTo = useCallback((time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, true);
      setCurrentTime(time);
    }
  }, []);

  const skip = useCallback((seconds) => {
    if (playerRef.current) {
      const newTime = Math.max(0, currentTime + seconds);
      seekTo(newTime);
    }
  }, [currentTime, seekTo]);

  const toggleMute = useCallback(() => {
    if (playerRef.current) {
      if (isMuted) playerRef.current.unMute();
      else playerRef.current.mute();
      setIsMuted(!isMuted);
    }
  }, [isMuted]);

  const handleVolumeChange = useCallback((e) => {
    const newVolume = parseInt(e.target.value, 10);
    setVolume(newVolume);
    if (playerRef.current) {
      playerRef.current.setVolume(newVolume);
      if (newVolume === 0) setIsMuted(true);
      else setIsMuted(false);
    }
  }, []);

  const handleSpeedChange = (rate) => {
    setPlaybackRate(rate);
    setShowSpeedMenu(false);
    if (playerRef.current && typeof playerRef.current.setPlaybackRate === 'function') {
      playerRef.current.setPlaybackRate(rate);
    }
  };

  const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds === undefined || seconds === null) return '00:00';
    const totalSecs = Math.floor(seconds);
    const hours = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hours > 0) {
      return `${hours}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleProgressClick = useCallback((e) => {
    if (!playerRef.current || duration <= 0) return;
    const progressBar = e.currentTarget;
    const rect = progressBar.getBoundingClientRect();
    const clickPosition = e.clientX - rect.left;
    const percent = Math.max(0, Math.min(1, clickPosition / rect.width));
    const newTime = percent * duration;
    seekTo(newTime);
  }, [duration, seekTo]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    if (!isFullscreen) {
      if (container.requestFullscreen) container.requestFullscreen();
      else if (container.webkitRequestFullscreen) container.webkitRequestFullscreen();
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
      else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  }, [isFullscreen]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (playerError) {
    return (
      <div className="rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 p-8 text-center w-full shadow-sm">
        <p className="text-red-600 dark:text-red-400 text-sm font-medium">{playerError}</p>
        <button
          onClick={() => {
            setPlayerError(null);
          }}
          className="mt-3 px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-800 dark:text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-slate-200 dark:border-zinc-700"
        >
          Reload Player
        </button>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80 overflow-hidden shadow-xl transition-all duration-300 w-full"
    >
      <div className="aspect-video w-full bg-black relative overflow-hidden">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onPlayerReady}
          onStateChange={onPlayerStateChange}
          onError={onPlayerError}
          className="w-full h-full absolute top-0 left-0"
        />
      </div>

      <div className="p-4 space-y-3 bg-white dark:bg-zinc-950 border-t border-slate-200 dark:border-zinc-800/60">
        {/* Progress bar */}
        <div
          className="group relative h-2 bg-slate-200 dark:bg-zinc-800 rounded-full cursor-pointer overflow-hidden transition-all hover:h-2.5"
          onClick={handleProgressClick}
        >
          <div
            className="h-full rounded-full transition-all duration-150"
            style={{
              width: `${Math.min(100, Math.max(0, progressPercent))}%`,
              background: 'var(--color-accent, #f59e0b)',
            }}
          />
        </div>

        {/* Controls and Timestamps */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Play/Pause */}
            <button
              onClick={togglePlayPause}
              className="p-1.5 rounded-lg text-slate-700 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white transition-colors cursor-pointer"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <PauseCircle className="w-6 h-6 text-amber-500" style={{ color: 'var(--color-accent, #f59e0b)' }} />
              ) : (
                <PlayCircle className="w-6 h-6 hover:scale-105 transition-transform" />
              )}
            </button>

            {/* Skips */}
            <button
              onClick={() => skip(-10)}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Skip back 10s"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              onClick={() => skip(10)}
              className="p-1 text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              title="Skip forward 10s"
            >
              <SkipForward className="w-4 h-4" />
            </button>

            {/* Volume */}
            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={toggleMute}
                className="text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-16 sm:w-20 h-1 bg-slate-200 dark:bg-zinc-800 rounded-full appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Time display */}
            <div className="text-xs font-mono text-slate-500 dark:text-zinc-400 ml-2">
              <span className="text-slate-800 dark:text-zinc-200 font-semibold">{formatTime(currentTime)}</span>
              <span className="text-slate-400 dark:text-zinc-600 mx-1">/</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* Playback speed selector */}
            <div className="relative">
              <button
                onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-zinc-900 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 text-xs font-medium text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <Gauge className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
                <span>{playbackRate}x</span>
              </button>

              {showSpeedMenu && (
                <div className="absolute bottom-full right-0 mb-2 py-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl shadow-xl z-20 flex flex-col min-w-[80px]">
                  {SPEED_OPTIONS.map((rate) => (
                    <button
                      key={rate}
                      onClick={() => handleSpeedChange(rate)}
                      className={`px-3 py-1.5 text-xs text-left transition-colors hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer ${
                        playbackRate === rate ? 'text-amber-600 dark:text-amber-400 font-bold bg-amber-500/10' : 'text-slate-700 dark:text-zinc-400'
                      }`}
                    >
                      {rate}x
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
              title="Fullscreen"
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

export default CustomYouTubePlayer;