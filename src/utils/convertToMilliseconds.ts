export const convertToMilliseconds = (
  delay: number,
  unit: 'days' | 'hours' | 'minutes' | 'seconds',
): number => {
  switch (unit) {
    case 'days':
      return delay * 24 * 60 * 60 * 1000;
    case 'hours':
      return delay * 60 * 60 * 1000;
    case 'minutes':
      return delay * 60 * 1000;
    case 'seconds':
      return delay * 1000;
    default:
      return delay;
  }
};
