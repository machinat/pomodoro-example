const formatTime = (time: number): string => {
  const timeInMins = time / 60000;
  const mins = Math.trunc(timeInMins);
  const secs = Math.trunc((timeInMins - mins) * 60);
  return `${mins ? `${mins}m` : ''}${secs}s`;
};

export default formatTime;
