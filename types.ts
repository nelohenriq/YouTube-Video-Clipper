export interface ClipDetails {
  videoId: string;
  start: number;
  end: number;
}

export interface PlayerControls {
  getCurrentTime: () => Promise<number | undefined>;
  pauseVideo: () => void;
}