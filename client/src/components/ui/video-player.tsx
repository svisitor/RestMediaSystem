import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Loader2, Play, Pause, Download, Volume2, VolumeX, Maximize, Minimize,
  SkipForward, SkipBack, FastForward, Clock 
} from 'lucide-react';
import i18n from '@/lib/i18n';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  onDownload?: () => void;
  skipSeconds?: number; // Seconds to skip on double tap (default: 10)
  introEndTime?: number; // End time of intro/opening song in seconds
}

export function VideoPlayer({ 
  src, 
  title, 
  poster, 
  onDownload, 
  skipSeconds = 10, 
  introEndTime 
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [lastTapTime, setLastTapTime] = useState<number>(0);
  const [controlsVisible, setControlsVisible] = useState(true);
  const controlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Function to handle skip forward/backward
  const skipTime = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newTime = Math.max(0, Math.min(video.duration, video.currentTime + seconds));
    video.currentTime = newTime;
    setCurrentTime(newTime);
    
    // Show the controls when skipping
    showControls();
  }, []);
  
  // Skip intro/opening song
  const skipIntro = useCallback(() => {
    const video = videoRef.current;
    if (!video || !introEndTime) return;
    
    if (video.currentTime < introEndTime) {
      video.currentTime = introEndTime;
      setCurrentTime(introEndTime);
      
      // Show a toast or indicator that intro was skipped
      // You could add a toast notification here if desired
    }
  }, [introEndTime]);
  
  // Set up or update the playbackRate when long-pressed
  const changePlaybackRate = useCallback((rate: number) => {
    const video = videoRef.current;
    if (!video) return;
    
    video.playbackRate = rate;
    setPlaybackRate(rate);
    
    // Show the controls when changing speed
    showControls();
  }, []);
  
  // Handle double tap for skipping forward/backward
  const handleTap = useCallback((direction: 'left' | 'right') => {
    const now = Date.now();
    const DOUBLE_TAP_THRESHOLD = 300; // ms
    
    if (now - lastTapTime < DOUBLE_TAP_THRESHOLD) {
      // This is a double tap
      if (direction === 'left') {
        skipTime(-skipSeconds);
      } else {
        skipTime(skipSeconds);
      }
    }
    
    setLastTapTime(now);
  }, [lastTapTime, skipSeconds, skipTime]);
  
  // Show controls for a few seconds, then hide them
  const showControls = useCallback(() => {
    setControlsVisible(true);
    
    // Clear existing timer
    if (controlsTimerRef.current) {
      clearTimeout(controlsTimerRef.current);
    }
    
    // Set a new timer to hide controls after 3 seconds
    controlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false);
    }, 3000);
  }, []);
  
  // Clear the controls timer when component unmounts
  useEffect(() => {
    return () => {
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, []);
  
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onLoadedMetadata = () => {
      setDuration(video.duration);
      setIsLoading(false);
    };

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setProgress((video.currentTime / video.duration) * 100);
    };

    const onEnded = () => {
      setIsPlaying(false);
    };

    const onVolumeChange = () => {
      setVolume(video.volume);
      setIsMuted(video.muted);
    };
    
    const onRateChange = () => {
      setPlaybackRate(video.playbackRate);
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('ended', onEnded);
    video.addEventListener('volumechange', onVolumeChange);
    video.addEventListener('ratechange', onRateChange);

    // Show controls when mouse moves
    const handleMouseMove = () => {
      showControls();
    };
    
    const container = containerRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('ended', onEnded);
      video.removeEventListener('volumechange', onVolumeChange);
      video.removeEventListener('ratechange', onRateChange);
      
      if (container) {
        container.removeEventListener('mousemove', handleMouseMove);
      }
      
      if (controlsTimerRef.current) {
        clearTimeout(controlsTimerRef.current);
      }
    };
  }, [showControls]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!isMuted);
  };

  const changeVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = parseFloat(e.target.value);
    video.volume = newVolume;
    setVolume(newVolume);
    if (newVolume === 0) {
      video.muted = true;
      setIsMuted(true);
    } else if (video.muted) {
      video.muted = false;
      setIsMuted(false);
    }
  };

  const seekTo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (parseFloat(e.target.value) / 100) * video.duration;
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable full-screen mode: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full bg-black overflow-hidden rounded-lg"
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-60 z-10">
          <Loader2 className="w-12 h-12 text-secondary animate-spin" />
        </div>
      )}
      
      {/* Left side double-tap area */}
      <div 
        className="absolute top-0 left-0 bottom-0 w-1/3 z-10 opacity-0"
        onClick={(e) => {
          e.stopPropagation();
          handleTap('left');
        }}
      />
      
      {/* Right side double-tap area */}
      <div 
        className="absolute top-0 right-0 bottom-0 w-1/3 z-10 opacity-0"
        onClick={(e) => {
          e.stopPropagation();
          handleTap('right');
        }}
      />
      
      {/* Center play/pause area */}
      <div 
        className="absolute top-0 left-1/3 right-1/3 bottom-0 z-10 opacity-0"
        onClick={togglePlay}
      />
      
      {/* Skip intro button */}
      {introEndTime && currentTime < introEndTime && (
        <TooltipProvider delayDuration={300}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={skipIntro}
                variant="secondary"
                className="absolute top-4 right-4 z-20"
              >
                <SkipForward className="mr-2 h-4 w-4" />
                {i18n.t('Skip Intro')}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{i18n.t('Skip opening song/intro')}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      {/* Long press area for speed control */}
      <div 
        className="absolute top-1/4 left-1/4 right-1/4 bottom-1/4 z-10 opacity-0"
        onContextMenu={(e) => e.preventDefault()}
        onTouchStart={(e) => {
          e.preventDefault();
          const longPressTimer = setTimeout(() => {
            changePlaybackRate(2.0); // Double speed on long press
          }, 500);
          
          // Clean up on touch end
          const handleTouchEnd = () => {
            clearTimeout(longPressTimer);
            changePlaybackRate(1.0); // Reset to normal speed
            window.removeEventListener('touchend', handleTouchEnd);
          };
          
          window.addEventListener('touchend', handleTouchEnd);
        }}
      />
      
      {/* Playback speed indicator */}
      {playbackRate !== 1 && (
        <div className="absolute top-4 left-4 z-20 bg-secondary text-white px-3 py-1 rounded-full flex items-center">
          <FastForward className="mr-2 h-4 w-4" />
          {playbackRate.toFixed(1)}x
        </div>
      )}
      
      {/* Double-tap indicators */}
      <div className="absolute top-1/2 left-16 transform -translate-y-1/2 z-20 opacity-0 transition-opacity duration-300" 
           style={{ opacity: lastTapTime && Date.now() - lastTapTime < 500 ? 0.8 : 0 }}>
        <div className="bg-secondary/80 text-white rounded-full p-6">
          <SkipBack size={32} />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg">
            {skipSeconds}
          </span>
        </div>
      </div>
      
      <div className="absolute top-1/2 right-16 transform -translate-y-1/2 z-20 opacity-0 transition-opacity duration-300"
           style={{ opacity: lastTapTime && Date.now() - lastTapTime < 500 ? 0.8 : 0 }}>
        <div className="bg-secondary/80 text-white rounded-full p-6">
          <SkipForward size={32} />
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 font-bold text-lg">
            {skipSeconds}
          </span>
        </div>
      </div>
      
      <video
        ref={videoRef}
        className="w-full h-auto"
        src={src}
        poster={poster}
        preload="metadata"
      />
      
      <div 
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 transition-opacity duration-300 ${controlsVisible ? 'opacity-100' : 'opacity-0'}`}>
        {title && (
          <div className="mb-4 text-white text-lg font-medium">{title}</div>
        )}
        
        <div className="flex flex-col space-y-2">
          <input
            type="range"
            value={progress}
            onChange={seekTo}
            className="w-full h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-secondary"
          />
          
          <div className="flex items-center justify-between text-white text-sm">
            <div className="flex items-center space-x-4 space-x-reverse">
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white" 
                onClick={togglePlay}
              >
                {isPlaying ? <Pause size={20} /> : <Play size={20} />}
              </Button>
              
              <div className="flex items-center">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white" 
                  onClick={toggleMute}
                >
                  {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                </Button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.01"
                  value={isMuted ? 0 : volume}
                  onChange={changeVolume}
                  className="w-16 h-1 bg-gray-600 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2 [&::-webkit-slider-thumb]:h-2 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
              
              <span>{formatTime(currentTime)} / {formatTime(duration)}</span>
            </div>
            
            <div className="flex items-center space-x-2 space-x-reverse">
              {/* Skip backward button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={() => skipTime(-skipSeconds)}
              >
                <SkipBack size={18} />
              </Button>
              
              {/* Skip forward button */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={() => skipTime(skipSeconds)}
              >
                <SkipForward size={18} />
              </Button>
              
              {/* Playback speed control */}
              <TooltipProvider delayDuration={300}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-white"
                      onClick={() => {
                        // Cycle through common playback speeds: 1.0 -> 1.5 -> 2.0 -> 0.5 -> 1.0
                        const speeds = [1.0, 1.5, 2.0, 0.5];
                        const currentIndex = speeds.indexOf(playbackRate);
                        const nextIndex = (currentIndex + 1) % speeds.length;
                        changePlaybackRate(speeds[nextIndex]);
                      }}
                    >
                      <Clock size={18} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{i18n.t('Change playback speed')}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              
              {/* Skip intro button if not shown at the top */}
              {introEndTime && currentTime < introEndTime && (
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-white"
                        onClick={skipIntro}
                      >
                        <FastForward size={18} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{i18n.t('Skip intro')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              
              {onDownload && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-white"
                  onClick={onDownload}
                >
                  <Download size={18} />
                </Button>
              )}
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-white"
                onClick={toggleFullscreen}
              >
                {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
