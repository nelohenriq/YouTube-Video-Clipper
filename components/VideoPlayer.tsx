import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import type { YouTubePlayer } from 'react-youtube';
import type { PlayerControls } from '../types';

interface VideoPlayerProps {
  videoId: string;
  start?: number;
  end?: number;
  theme: 'light' | 'dark';
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady: () => void;
    YT: any;
  }
}

let apiLoaded = false;
const waitingCbs: (() => void)[] = [];

const loadYouTubeAPI = (cb: () => void) => {
  if (apiLoaded) {
    cb();
    return;
  }
  waitingCbs.push(cb);
  if (waitingCbs.length === 1) { // only load once
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    const firstScriptTag = document.getElementsByTagName('script')[0];
    if (firstScriptTag && firstScriptTag.parentNode) {
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      document.head.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {
      apiLoaded = true;
      waitingCbs.forEach(waitingCb => waitingCb());
    };
  }
};

export const VideoPlayer = forwardRef<PlayerControls, VideoPlayerProps>(({ videoId, start, end, theme }, ref) => {
  const playerInstanceRef = useRef<YouTubePlayer | null>(null);
  const clipIntervalRef = useRef<number | null>(null);
  const playerId = `youtube-player-${videoId}-${Math.random()}`;

  useImperativeHandle(ref, () => ({
    getCurrentTime: async () => {
      return playerInstanceRef.current?.getCurrentTime();
    },
    pauseVideo: () => {
        playerInstanceRef.current?.pauseVideo();
    }
  }));

  useEffect(() => {
    const createPlayer = () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy();
      }
      playerInstanceRef.current = new window.YT.Player(playerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 1,
          controls: start !== undefined ? 0 : 1, // Hide controls for clips
          modestbranding: 1,
          rel: 0,
          start: Math.floor(start ?? 0),
          theme: theme,
        },
        events: {
          'onReady': (event: { target: YouTubePlayer }) => {
            // If it's a clip, start the looping logic
            if (start !== undefined && end !== undefined) {
              const player = event.target;
              player.seekTo(start, true);
              player.playVideo();

              if (clipIntervalRef.current) {
                clearInterval(clipIntervalRef.current);
              }

              clipIntervalRef.current = window.setInterval(async () => {
                const currentTime = await player.getCurrentTime();
                if (currentTime >= end) {
                  player.seekTo(start, true); // Loop
                }
              }, 250);
            }
          }
        }
      });
    };
    
    loadYouTubeAPI(() => {
      if (document.getElementById(playerId)) {
        createPlayer();
      }
    });

    return () => {
      if (clipIntervalRef.current) {
        clearInterval(clipIntervalRef.current);
      }
      if (playerInstanceRef.current) {
        if (document.getElementById(playerId)) {
          playerInstanceRef.current.destroy();
        }
        playerInstanceRef.current = null;
      }
    };
  }, [videoId, playerId, start, end, theme]);

  return (
    <div className="aspect-video w-full">
      <div id={playerId} className="w-full h-full"></div>
    </div>
  );
});