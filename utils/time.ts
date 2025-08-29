export const formatTime = (timeInSeconds: number | null): string => {
  if (timeInSeconds === null || isNaN(timeInSeconds)) {
    return '--:--';
  }
  const totalSeconds = Math.floor(timeInSeconds);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};
