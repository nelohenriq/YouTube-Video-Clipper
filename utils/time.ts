export const formatTime = (timeInSeconds: number | null): string => {
  if (timeInSeconds === null || isNaN(timeInSeconds)) {
    return '--:--';
  }
  const totalSeconds = Math.floor(timeInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

/**
 * Formats time in seconds to HH:MM:SS for command-line tools.
 * @param {number | null} timeInSeconds - The time in seconds.
 * @returns {string} The formatted time string.
 */
export const formatTimeForCli = (timeInSeconds: number | null): string => {
  if (timeInSeconds === null || isNaN(timeInSeconds)) {
    return '00:00:00';
  }
  const totalSeconds = Math.floor(timeInSeconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map(val => String(val).padStart(2, '0'))
    .join(':');
};

/**
 * Parses a time string (MM:SS) into seconds.
 * @param {string} timeString - The time string to parse.
 * @returns {number | null} The total seconds or null if format is invalid.
 */
export const parseTime = (timeString: string): number | null => {
  if (!timeString || typeof timeString !== 'string') return null;

  const match = timeString.match(/^(\d+):(\d{1,2})$/);
  if (!match) return null;

  const minutes = parseInt(match[1], 10);
  const seconds = parseInt(match[2], 10);

  if (isNaN(minutes) || isNaN(seconds) || minutes < 0 || seconds < 0 || seconds > 59) {
    return null;
  }

  return minutes * 60 + seconds;
};