# Adding, editing and removing events

Every event is one small text file in `src/events/`. The file's top section holds the facts (title, date, time); everything below it is the event's own page, written in Markdown (plain text with a few symbols for headings and lists). Save the file, push, and within two minutes the event appears on the home page (next three), the Events page, and gets its own page plus an "Add to calendar" file.

## The quickest way: copy an existing event

1. In `src/events/`, open any file, e.g. `2026-11-08-diwali-lakshmi-puja.md`.
2. Copy it to a new file named `YYYY-MM-DD-short-name.md` (date first so files sort by date), e.g. `2026-12-25-christmas-day-darshan.md`.
3. Edit the top section and the text. Save, commit, push.

You can do this directly on github.com from a phone or laptop: open the `src/events` folder → **Add file → Create new file** → type the name → paste the template below → **Commit changes**.

## Template

```markdown
---
title: Makar Sankranti Puja
start: 2027-01-14 17:30
end: 2027-01-14 19:30
summary: Til-gud prasad, Surya Puja and Aarti to mark Uttarayan.
---
Join us to celebrate **Makar Sankranti** with Surya Puja and Aarti.

## Schedule

- **5:30 pm** — Surya Puja
- **6:30 pm** — Aarti
- **6:45 pm** — Til-gud prasad

Families wishing to sponsor the prasad may contact the mandir.
```

### The top section (between the `---` lines)

| Field | Required | Notes |
| --- | --- | --- |
| `title` | yes | Shown on tiles and as the page heading. Keep it short. |
| `start` | yes | `YYYY-MM-DD HH:MM` in 24-hour Central time (17:30 = 5:30 pm). For an all-day event write just the date: `2026-10-11`. |
| `end` | yes | Same format. For multi-day festivals use the last day/time. |
| `summary` | recommended | One sentence for the tiles and calendar entry. |
| `location` | no | Defaults to the mandir address. Use for events held elsewhere. |
| `image` | no | A flyer or photo for this event, e.g. `assets/img/events/diwali-2026.jpg` (put the file in `src/assets/img/events/`). Shown as a poster beside the details. Without it, a deity picture is chosen from the title (Ganesh → Siddhivinayak, Navratri/Durga → Maa Durga, Hanuman → Hanuman, Ram/Diwali → Ram Parivar, otherwise a mandir photo). |
| `hero: banner` | no | With `image`, stretches the picture across the top of the page instead of the poster layout. |
| `buttons: false` | no | Hides the Add to calendar / Directions / Share buttons. |
| `sample: true` | no | Marks the event with a "Sample" badge — remove this line from real events. |

### The page below the top section

Anything goes: paragraphs, `## Headings`, `- bullet lists`, **bold**, links, tables, more photos (`![caption](../assets/img/events/photo.jpg)`), even a YouTube embed as HTML. Each event page can look different; the template only adds the header, buttons and the "At a glance" box.

Markdown cheat-sheet: `## Heading`, `**bold**`, `*italic*`, `- list item`, `[link text](https://…)`, `![alt](image-path)`.

## Editing or cancelling

- Change the file and push — the page, tiles and calendar file update.
- Delete the file to remove the event entirely. To mark it cancelled instead, change the title to `Cancelled — …` and explain in the text.

## Past events

When an event's end time passes, the site rebuilds itself every morning (4:15 am Central) and the event moves to the collapsed **Past events** list on the Events page. Visitors also never see an expired event as "upcoming" in between, because the page hides it as soon as its end time has passed. Old event files can stay forever as an archive, or be deleted after a year.

## Flyers and photos

- Save flyers as JPG or PNG, no wider than about 1600px (a phone screenshot of a flyer is fine).
- Put them in `src/assets/img/events/` and reference them as `assets/img/events/<name>.jpg` in the `image:` field.
- Photos taken *at* the event belong in the Gallery afterwards — see `ADDING-PHOTOS.md`.

## Recurring programs

There is no automatic repeat. For a weekly program (Hanuman Chalisa every Saturday) the simplest approach is one event file for the program with the next date, updated occasionally, or listing it under **Regular Schedule** on the Events page (`src/events.njk`) rather than as dated events.
