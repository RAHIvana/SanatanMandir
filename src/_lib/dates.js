// Small date helpers so event files can use plain local times ("2026-10-11 17:00")
// without worrying about time zones or daylight saving.
export const TZ = "America/Chicago";

// Offset (minutes) of `tz` from UTC at the given instant.
function tzOffsetMinutes(date, tz) {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const p = {};
  for (const part of dtf.formatToParts(date)) p[part.type] = part.value;
  const asUtc = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second);
  return (asUtc - date.getTime()) / 60000;
}

// "2026-10-11 17:00" or "2026-10-11T17:00" or "2026-10-11" (all-day) in `tz` → JS Date (UTC instant).
export function zoned(input, tz = TZ) {
  if (input instanceof Date) return input;
  const s = String(input).trim();
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{1,2}):(\d{2}))?/);
  if (!m) return new Date(s);
  const [, y, mo, d, h = "0", mi = "0"] = m;
  const guess = Date.UTC(+y, +mo - 1, +d, +h, +mi);
  // Two passes handle DST edges.
  let offset = tzOffsetMinutes(new Date(guess), tz);
  let utc = guess - offset * 60000;
  offset = tzOffsetMinutes(new Date(utc), tz);
  utc = guess - offset * 60000;
  return new Date(utc);
}

export function isAllDay(input) {
  return /^\d{4}-\d{2}-\d{2}$/.test(String(input).trim());
}

export function fmt(date, opts, tz = TZ) {
  return new Intl.DateTimeFormat("en-US", { timeZone: tz, ...opts }).format(date);
}

export const fmtDay = (d) => fmt(d, { day: "numeric" });
export const fmtMonthShort = (d) => fmt(d, { month: "short" });
export const fmtMonthYear = (d) => fmt(d, { month: "long", year: "numeric" });
export const fmtWeekday = (d) => fmt(d, { weekday: "long" });
export const fmtWeekdayShort = (d) => fmt(d, { weekday: "short" });
export const fmtLong = (d) => fmt(d, { weekday: "long", month: "long", day: "numeric", year: "numeric" });
export const fmtTime = (d) => fmt(d, { hour: "numeric", minute: "2-digit" }).replace(":00", "");
export const sameDay = (a, b) => fmt(a, { year: "numeric", month: "2-digit", day: "2-digit" }) === fmt(b, { year: "numeric", month: "2-digit", day: "2-digit" });

// iCalendar UTC stamp: 20261011T220000Z
export const icsStamp = (d) => d.toISOString().replace(/[-:]|\.\d{3}/g, "");
// iCalendar all-day date: 20261011
export const icsDate = (d, tz = TZ) => fmt(d, { year: "numeric", month: "2-digit", day: "2-digit" }).replace(/(\d+)\/(\d+)\/(\d+)/, "$3$1$2");
