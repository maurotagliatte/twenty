const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['year', 365 * 24 * 60 * 60],
  ['month', 30 * 24 * 60 * 60],
  ['week', 7 * 24 * 60 * 60],
  ['day', 24 * 60 * 60],
  ['hour', 60 * 60],
  ['minute', 60],
];

const RELATIVE_TIME_FORMAT = new Intl.RelativeTimeFormat('en', {
  numeric: 'auto',
});

export const formatRelativeDate = (isoDate: string, now = new Date()) => {
  const elapsedSeconds = (new Date(isoDate).getTime() - now.getTime()) / 1000;

  if (Number.isNaN(elapsedSeconds)) {
    return '';
  }

  for (const [unit, secondsPerUnit] of UNITS) {
    if (Math.abs(elapsedSeconds) >= secondsPerUnit) {
      return RELATIVE_TIME_FORMAT.format(
        Math.round(elapsedSeconds / secondsPerUnit),
        unit,
      );
    }
  }

  return RELATIVE_TIME_FORMAT.format(0, 'minute');
};
