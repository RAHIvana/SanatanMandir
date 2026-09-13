// Eleventy configuration for the Shri Sanatan Mandir website.
// Source lives in src/, the finished site is written to _site/.
import path from "node:path";
import { TZ, zoned, fmtDay, fmtMonthShort, fmtMonthYear, fmtWeekday, fmtWeekdayShort, fmtLong, fmtTime, sameDay, icsStamp, icsDate } from "./src/_lib/dates.js";

export default function (eleventyConfig) {
  // Static files copied as-is.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/.nojekyll": ".nojekyll" });

  // Rebuild when these change during `npm run dev`.
  eleventyConfig.addWatchTarget("src/assets/");
  eleventyConfig.addWatchTarget("photos/");

  // The moment the site was built — used to split events into upcoming and past.
  const buildTime = new Date();
  eleventyConfig.addGlobalData("buildTime", buildTime);

  // ---------- Events ----------
  // Every file in src/events/ is one event (see src/events/events.11tydata.js).
  eleventyConfig.addCollection("upcomingEvents", (api) =>
    api
      .getFilteredByTag("event")
      .filter((e) => e.data.endDate && e.data.endDate.getTime() >= buildTime.getTime())
      .sort((a, b) => a.data.startDate - b.data.startDate)
  );
  eleventyConfig.addCollection("pastEvents", (api) =>
    api
      .getFilteredByTag("event")
      .filter((e) => e.data.endDate && e.data.endDate.getTime() < buildTime.getTime())
      .sort((a, b) => b.data.startDate - a.data.startDate)
  );

  // ---------- Links ----------
  // `rel` turns a site-root path ("about.html", "assets/img/logo.png") into a link that is
  // relative to the current page. Relative links let the same build work at
  // https://shrisanatanmandir.org/ AND at https://rahivana.github.io/SanatanMandir/.
  eleventyConfig.addFilter("rel", function (target) {
    const pageUrl = (this.page && this.page.url) || "/";
    const fromDir = path.posix.dirname(pageUrl.endsWith("/") ? pageUrl + "index.html" : pageUrl);
    const clean = String(target || "index.html").replace(/^\/+/, "") || "index.html";
    const [file, hash] = clean.split("#");
    let out = path.posix.relative(fromDir, "/" + file);
    if (!out) out = "./";
    return hash ? `${out}#${hash}` : out;
  });

  // ---------- Dates ----------
  eleventyConfig.addFilter("year", (value) => new Date(value).getFullYear());
  eleventyConfig.addFilter("longDate", (value) => {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
  });
  eleventyConfig.addFilter("evDay", (d) => fmtDay(d));
  eleventyConfig.addFilter("evMonth", (d) => fmtMonthShort(d));
  eleventyConfig.addFilter("evMonthYear", (d) => fmtMonthYear(d));
  eleventyConfig.addFilter("evWeekday", (d) => fmtWeekday(d));
  eleventyConfig.addFilter("evWeekdayShort", (d) => fmtWeekdayShort(d));
  eleventyConfig.addFilter("evLong", (d) => fmtLong(d));
  eleventyConfig.addFilter("evTime", (d) => fmtTime(d));
  eleventyConfig.addFilter("evIso", (d) => (d ? d.toISOString() : ""));
  // "Mon · 6 – 8 pm", "Sun, Oct 11 – Mon, Oct 19", "All day"
  eleventyConfig.addFilter("evWhen", (ev) => {
    const { startDate: s, endDate: e, allDay } = ev.data;
    if (!s) return "";
    if (allDay) return sameDay(s, e) ? `${fmtWeekday(s)} · All day` : `${fmtWeekdayShort(s)}, ${fmtMonthShort(s)} ${fmtDay(s)} – ${fmtWeekdayShort(e)}, ${fmtMonthShort(e)} ${fmtDay(e)}`;
    if (sameDay(s, e)) return `${fmtWeekdayShort(s)} · ${fmtTime(s)} – ${fmtTime(e)}`;
    return `${fmtWeekdayShort(s)}, ${fmtMonthShort(s)} ${fmtDay(s)} ${fmtTime(s)} – ${fmtWeekdayShort(e)}, ${fmtMonthShort(e)} ${fmtDay(e)} ${fmtTime(e)}`;
  });
  eleventyConfig.addFilter("icsStamp", (d) => icsStamp(d));
  eleventyConfig.addFilter("icsDate", (d) => icsDate(d));
  eleventyConfig.addFilter("icsText", (s) =>
    String(s || "")
      .replace(/\\/g, "\\\\")
      .replace(/\r?\n/g, "\\n")
      .replace(/,/g, "\\,")
      .replace(/;/g, "\\;")
  );
  eleventyConfig.addFilter("plainText", (html) =>
    String(html || "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
  eleventyConfig.addFilter("gcalLink", (ev) => {
    const { startDate: s, endDate: e, allDay, title, location } = ev.data;
    const dates = allDay ? `${icsDate(s)}/${icsDate(e)}` : `${icsStamp(s)}/${icsStamp(e)}`;
    const p = new URLSearchParams({ action: "TEMPLATE", text: title, dates, location: location || "", details: ev.data.summary || "" });
    return "https://calendar.google.com/calendar/render?" + p.toString();
  });
  eleventyConfig.addFilter("mapsLink", (place) => "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(place || ""));
  eleventyConfig.addFilter("waShare", (text) => "https://wa.me/?text=" + encodeURIComponent(text || ""));
  // Groups events by month for the Events page.
  eleventyConfig.addFilter("byMonth", (events) => {
    const groups = [];
    for (const ev of events || []) {
      const key = fmtMonthYear(ev.data.startDate);
      let g = groups.find((x) => x.label === key);
      if (!g) groups.push((g = { label: key, items: [] }));
      g.items.push(ev);
    }
    return groups;
  });

  // ---------- Misc ----------
  eleventyConfig.addFilter("telHref", (value) => "tel:" + String(value).replace(/[^\d+]/g, ""));
  eleventyConfig.addFilter("jsonify", (value) => JSON.stringify(value));
  eleventyConfig.addFilter("head", (array, n) => (Array.isArray(array) ? array.slice(0, n) : []));
  eleventyConfig.addFilter("without", (array, url) => (Array.isArray(array) ? array.filter((x) => x.url !== url) : []));
  // Merges repo albums and external (photographer) albums, newest first, grouped by year for the Gallery page.
  eleventyConfig.addFilter("galleryYears", (albums, externals) => {
    const entries = [
      ...(albums || []).map((a) => ({ kind: "album", date: String(a.date), item: a })),
      ...(externals || []).map((e) => ({ kind: "external", date: String(e.date), item: e })),
    ].sort((a, b) => (a.date < b.date ? 1 : -1));
    const map = new Map();
    for (const en of entries) {
      const y = en.date.slice(0, 4);
      if (!map.has(y)) map.set(y, []);
      map.get(y).push(en);
    }
    return [...map.entries()].map(([year, items]) => ({ year, items }));
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
