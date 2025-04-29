export const unixTimeStarmp = (date: Date) =>
  Math.floor(new Date(date).getTime() / 1000);
