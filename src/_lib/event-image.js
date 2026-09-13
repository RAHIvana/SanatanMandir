// Picks a picture for an event that has no `image:` of its own, from keywords in its title.
// First matching rule wins. Paths are relative to the site root. Add rules freely.
export const IMAGE_RULES = [
  { match: /ganesh|ganpati|vinayak|chaturthi|visarjan/i, image: "assets/img/deity-siddhivinayak.png", fit: "contain" },
  { match: /hanuman|bajrang|chalisa/i, image: "assets/img/deity-hanuman.png", fit: "contain" },
  { match: /navratri|navaratri|durga|garba|dandiya|chandi|dashami|dussehra|vijaya/i, image: "assets/img/deity-durga.png", fit: "contain" },
  { match: /ambe|amba|mata ki chowki|jagran/i, image: "assets/img/deity-ambe-maa.png", fit: "contain" },
  { match: /\bram\b|rama\b|ram navami|diwali|deepavali|pran pratishtha|sita|dussehra/i, image: "assets/img/deity-ram-parivar.png", fit: "contain" },
  { match: /lakshmi|laxmi|annakut|govardhan|sharad|purnima|satyanarayan|katha/i, image: "assets/img/hero-2.jpg", fit: "cover" },
  { match: /krishna|janmashtami|holi|radha|bhajan|kirtan/i, image: "assets/img/hero-4.jpg", fit: "cover" },
  { match: /shiv|mahashivratri|rudra|abhishek/i, image: "assets/img/hero-3.jpg", fit: "cover" },
];
const DEFAULTS = ["assets/img/hero-1.jpg", "assets/img/hero-5.jpg", "assets/img/hero-3.jpg", "assets/img/hero-4.jpg"];

export function eventImage(title = "", index = 0) {
  for (const rule of IMAGE_RULES) if (rule.match.test(title)) return { src: rule.image, fit: rule.fit };
  return { src: DEFAULTS[index % DEFAULTS.length], fit: "cover" };
}
