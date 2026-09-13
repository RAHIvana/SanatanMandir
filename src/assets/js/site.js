/* Shared behaviour: mobile menu, dropdowns, hero carousel, photo lightbox, footer year. */
(function () {
  "use strict";

  /* ---------- Mobile menu ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");
  if (toggle && nav) {
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
      toggle.classList.toggle("is-open", open);
      document.body.classList.toggle("nav-open", open);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && nav.classList.contains("is-open")) toggle.click();
    });
  }

  /* ---------- Dropdown (Seva) ---------- */
  document.querySelectorAll(".has-children > button").forEach((btn) => {
    const li = btn.parentElement;
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
  });
  document.addEventListener("click", () => {
    document.querySelectorAll(".has-children.is-open").forEach((li) => {
      li.classList.remove("is-open");
      li.querySelector("button").setAttribute("aria-expanded", "false");
    });
  });

  /* ---------- Hero carousel ---------- */
  document.querySelectorAll("[data-carousel]").forEach((root) => {
    const slides = Array.from(root.querySelectorAll(".slide"));
    if (slides.length < 2) return;
    const dots = root.querySelector(".carousel-dots");
    let i = 0;
    let timer;
    const go = (n) => {
      slides[i].classList.remove("is-active");
      dots && dots.children[i].classList.remove("is-active");
      i = (n + slides.length) % slides.length;
      slides[i].classList.add("is-active");
      dots && dots.children[i].classList.add("is-active");
    };
    const play = () => {
      stop();
      timer = setInterval(() => go(i + 1), 6000);
    };
    const stop = () => timer && clearInterval(timer);
    if (dots) {
      slides.forEach((_, n) => {
        const b = document.createElement("button");
        b.type = "button";
        b.setAttribute("aria-label", "Show photo " + (n + 1));
        b.addEventListener("click", () => {
          go(n);
          play();
        });
        dots.append(b);
      });
      dots.children[0].classList.add("is-active");
    }
    root.querySelector(".carousel-prev")?.addEventListener("click", () => {
      go(i - 1);
      play();
    });
    root.querySelector(".carousel-next")?.addEventListener("click", () => {
      go(i + 1);
      play();
    });
    let x0 = null;
    root.addEventListener("touchstart", (e) => (x0 = e.touches[0].clientX), { passive: true });
    root.addEventListener("touchend", (e) => {
      if (x0 === null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 40) {
        go(dx < 0 ? i + 1 : i - 1);
        play();
      }
      x0 = null;
    });
    root.addEventListener("mouseenter", stop);
    root.addEventListener("mouseleave", play);
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) play();
  });

  /* ---------- Lightbox for gallery albums ---------- */
  const links = Array.from(document.querySelectorAll("[data-lightbox]"));
  if (links.length) {
    const box = document.createElement("div");
    box.className = "lightbox";
    box.setAttribute("role", "dialog");
    box.setAttribute("aria-modal", "true");
    box.setAttribute("aria-label", "Photo viewer");
    box.innerHTML =
      '<button class="lightbox__close" type="button" aria-label="Close">&times;</button>' +
      '<button class="lightbox__prev" type="button" aria-label="Previous photo">&#10094;</button>' +
      '<figure class="lightbox__figure"><img alt=""><figcaption></figcaption></figure>' +
      '<button class="lightbox__next" type="button" aria-label="Next photo">&#10095;</button>';
    document.body.append(box);
    const img = box.querySelector("img");
    const cap = box.querySelector("figcaption");
    let cur = 0;
    const show = (n) => {
      cur = (n + links.length) % links.length;
      const a = links[cur];
      img.src = a.getAttribute("href");
      img.alt = a.dataset.caption || "";
      cap.textContent = (a.dataset.caption || "") + (links.length > 1 ? `  ·  ${cur + 1} / ${links.length}` : "");
      // preload neighbours
      [cur + 1, cur - 1].forEach((k) => {
        const pre = new Image();
        pre.src = links[(k + links.length) % links.length].getAttribute("href");
      });
    };
    const open = (n) => {
      show(n);
      box.classList.add("is-open");
      document.body.classList.add("lightbox-open");
      box.querySelector(".lightbox__close").focus();
    };
    const close = () => {
      box.classList.remove("is-open");
      document.body.classList.remove("lightbox-open");
      img.removeAttribute("src");
    };
    links.forEach((a, n) =>
      a.addEventListener("click", (e) => {
        e.preventDefault();
        open(n);
      })
    );
    box.querySelector(".lightbox__close").addEventListener("click", close);
    box.querySelector(".lightbox__prev").addEventListener("click", () => show(cur - 1));
    box.querySelector(".lightbox__next").addEventListener("click", () => show(cur + 1));
    box.addEventListener("click", (e) => {
      if (e.target === box) close();
    });
    document.addEventListener("keydown", (e) => {
      if (!box.classList.contains("is-open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") show(cur + 1);
      if (e.key === "ArrowLeft") show(cur - 1);
    });
    let sx = null;
    box.addEventListener("touchstart", (e) => (sx = e.touches[0].clientX), { passive: true });
    box.addEventListener("touchend", (e) => {
      if (sx === null) return;
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(dx < 0 ? cur + 1 : cur - 1);
      sx = null;
    });
  }


  /* ---------- Events: hide anything that ended since the last build ---------- */
  (function () {
    const now = Date.now();
    document.querySelectorAll("[data-end]").forEach((el) => {
      const end = Date.parse(el.getAttribute("data-end"));
      if (!Number.isNaN(end) && end < now) el.classList.add("is-past");
    });
    document.querySelectorAll(".events-grid").forEach((grid) => {
      const visible = Array.from(grid.querySelectorAll(".event-tile")).filter((t) => !t.classList.contains("is-past"));
      const note = grid.parentElement && grid.parentElement.querySelector("[data-events-none]");
      if (visible.length === 0 && note && !grid.closest("details")) note.hidden = false;
    });
    const nextEv = document.querySelector(".next-event.is-past");
    if (nextEv) nextEv.closest("section").hidden = true;
  })();

  /* ---------- "Open now" badge on the timings tile ---------- */
  (function () {
    const tile = document.querySelector("[data-hours]");
    const badge = document.querySelector("[data-open-badge]");
    if (!tile || !badge) return;
    let hours;
    try {
      hours = JSON.parse(tile.getAttribute("data-hours"));
    } catch (e) {
      return;
    }
    // Current time in the mandir's time zone.
    const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Chicago", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23" }).formatToParts(new Date());
    const get = (t) => (parts.find((p) => p.type === t) || {}).value;
    const day = get("weekday");
    const mins = Number(get("hour")) * 60 + Number(get("minute"));
    const weekend = day === "Sat" || day === "Sun";
    // Parse ranges like "5:30 – 7:30 pm" and "9:00 am – 12:00 pm  ·  5:30 – 7:30 pm".
    const toMins = (str, fallbackMeridian) => {
      const m = str.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
      if (!m) return null;
      let h = Number(m[1]);
      const mm = Number(m[2] || 0);
      const mer = (m[3] || fallbackMeridian || "").toLowerCase();
      if (mer === "pm" && h < 12) h += 12;
      if (mer === "am" && h === 12) h = 0;
      return h * 60 + mm;
    };
    const ranges = [];
    hours.forEach((h) => {
      const isWeekendRow = /sat|sun/i.test(h.days);
      if (isWeekendRow !== weekend) return;
      h.times.split(/·|,|\band\b/i).forEach((seg) => {
        const bits = seg.split(/–|-/).map((x) => x.trim()).filter(Boolean);
        if (bits.length < 2) return;
        const endMer = (bits[1].match(/am|pm/i) || [""])[0];
        const start = toMins(bits[0], endMer);
        const end = toMins(bits[1]);
        if (start !== null && end !== null) ranges.push([start, end]);
      });
    });
    if (!ranges.length) return;
    ranges.sort((a, b) => a[0] - b[0]);
    const open = ranges.find((r) => mins >= r[0] && mins < r[1]);
    const fmt = (m) => {
      const h = Math.floor(m / 60);
      const mm = m % 60;
      const h12 = ((h + 11) % 12) + 1;
      return `${h12}${mm ? ":" + String(mm).padStart(2, "0") : ""} ${h >= 12 ? "pm" : "am"}`;
    };
    if (open) {
      badge.textContent = "Open now · until " + fmt(open[1]);
      badge.classList.remove("is-closed");
    } else {
      const next = ranges.find((r) => r[0] > mins);
      badge.textContent = next ? "Closed · opens " + fmt(next[0]) : "Closed for today";
      badge.classList.add("is-closed");
    }
    badge.hidden = false;
  })();

  /* ---------- Footer year ---------- */
  document.querySelectorAll("[data-year]").forEach((n) => (n.textContent = new Date().getFullYear()));

  /* ---------- Mark current nav item ---------- */
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".site-nav a[href]").forEach((a) => {
    const target = a.getAttribute("href").split("/").pop();
    if (target === here) {
      a.setAttribute("aria-current", "page");
      a.closest(".has-children")?.classList.add("is-current");
    }
  });
})();
