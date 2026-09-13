// Applies to every event file in src/events/. Front matter each event needs:
//   title, start ("YYYY-MM-DD HH:MM" or "YYYY-MM-DD" for all day), end (same form), location (optional),
//   summary (one line for tiles), image (optional path under assets/img/events/), sample (optional true)
import { zoned, isAllDay } from "../_lib/dates.js";
import { eventImage } from "../_lib/event-image.js";

export default {
  layout: "event.njk",
  tags: ["event"],
  permalink: (data) => `events/${data.page.fileSlug}.html`,
  eleventyComputed: {
    startDate: (data) => (data.start ? zoned(data.start) : null),
    endDate: (data) => zoned(data.end || data.start),
    allDay: (data) => isAllDay(data.start || ""),
    location: (data) => data.location || `${data.site.name}, ${data.site.address.oneLine}`,
    picture: (data) => {
      if (data.image) return { src: data.image, fit: data.imageFit || "cover" };
      return eventImage(data.title || "", 0);
    },
    description: (data) => data.summary || data.site.description,
  },
};
