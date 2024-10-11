export const SECOND = 1000;
export const MINUTE = 60 * SECOND;
export const HOUR = 60 * MINUTE;
export const DAY = 24 * HOUR;
export const WEEK = 7 * DAY;
export const MONTH = 29.53 * DAY;
export const YEAR = 365.2425 * DAY;

export const MAX_DATE = new Date(8.64e15);
export const EPOC = new Date(0);

export function midnight(date: Date = new Date()): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function roundToMinute(date: Date): Date {
  return new Date(Math.round(date.getTime() / MINUTE) * MINUTE);
}

export function today(): Date {
  return midnight(new Date());
}

export function nextWeek(): Date {
  return new Date(midnight(new Date(Date.now() + WEEK)).getTime() - MINUTE);
}

type FormatDurationParts = {
  unit: Intl.RelativeTimeFormatUnit;
  multiplier: number;
  value: number;
};

export function formatDurationParts(ms: number): FormatDurationParts {
  const absMs = Math.abs(ms);

  if (absMs < 1.5 * MINUTE) {
    return {
      unit: "second",
      multiplier: SECOND,
      value: ms / SECOND,
    };
  }

  if (absMs < 1.5 * HOUR) {
    return {
      unit: "minute",
      multiplier: MINUTE,
      value: ms / MINUTE,
    };
  }

  if (absMs < 1.5 * DAY) {
    return {
      unit: "hour",
      multiplier: HOUR,
      value: ms / HOUR,
    };
  }

  if (absMs < WEEK) {
    return {
      unit: "day",
      multiplier: DAY,
      value: ms / DAY,
    };
  }

  if (absMs < MONTH) {
    return {
      unit: "week",
      multiplier: WEEK,
      value: ms / WEEK,
    };
  }

  if (absMs < YEAR) {
    return {
      unit: "month",
      multiplier: MONTH,
      value: ms / MONTH,
    };
  }

  return {
    unit: "year",
    multiplier: YEAR,
    value: ms / YEAR,
  };
}

const relativeTimeFormat = new Intl.RelativeTimeFormat("default", {
  numeric: "always",
  style: "short",
});

export function formatRelativeTime(ms: number): string {
  const { unit, value } = formatDurationParts(ms);

  return relativeTimeFormat.format(Math.round(value), unit);
}
