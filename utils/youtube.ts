
/**
 * Extracts the YouTube video ID from a given URL.
 * Supports various YouTube URL formats.
 * @param {string} url - The YouTube URL.
 * @returns {string | null} The video ID or null if not found.
 */
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!url) {
    return null;
  }
  
  // This regex covers:
  // - youtube.com/watch?v=...
  // - youtu.be/...
  // - youtube.com/embed/...
  // - youtube.com/v/...
  // - youtube.com/shorts/...
  // It captures the 11-character video ID.
  const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  
  const match = url.match(regex);
  
  return match ? match[1] : null;
};
