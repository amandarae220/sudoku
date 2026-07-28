// Format a duration in seconds as m:ss.
export const formatTime = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
};

// Best-time display: a duration, or an em-dash placeholder when there isn't one yet.
export const formatBest = (seconds: number | null): string =>
  seconds === null ? "--" : formatTime(seconds);
