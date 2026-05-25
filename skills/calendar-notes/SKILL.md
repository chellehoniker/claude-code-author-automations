---
name: calendar-notes
description: Use when the user wants to add an annotation, reminder, or milestone marker to a date on their content calendar without scheduling an actual post. Triggers on "remind me on the calendar", "add a calendar note", "mark June 12 as Lisa's launch", "put a placeholder on next Friday", "track this date".
---

# Calendar notes — annotate a date without scheduling a post

A calendar note is a lightweight marker that shows up on the content calendar — a launch date, a deadline, a holiday, an "out of office" block — that does NOT publish anywhere. Posts are for content; notes are for context.

## Quick facts

- Notes are **pen-name-scoped** — every note tool implicitly takes `profileId`. If the user mentions a specific pen name, switch context first via `pen-names` and carry the resolved `profileId` through every call here.
- A note has: `date` (ISO `YYYY-MM-DD`), `title` (short label shown on the calendar), optional `body` (longer description shown on click), optional `color` (hex `#rrggbb`).
- Notes never publish, never count against rate limits, never touch a connected account. They're purely visual.
- Default color when the user gives no signal: neutral gray `#9ca3af`. Pick a meaningful color if the user assigns one ("red for deadlines", "green for launches").

## Decision tree

| User says... | Tool |
|---|---|
| "What notes do I have this month" / "Show me my calendar notes" | `aa_list_calendar_notes` |
| "Mark June 12 as Lisa's book launch" / "Add a note on Friday for the deadline" | `aa_create_calendar_note` |
| "Change the color of my June 12 note" / "Rename that note to..." | `aa_update_calendar_note` |
| "Delete the note on June 12" / "Remove that placeholder" | `aa_delete_calendar_note` |

## Flow for creating a note

### 1. Parse the date

The user almost always says a date in natural language ("next Friday", "June 12", "the launch date"). Convert to ISO `YYYY-MM-DD` in the user's timezone. If ambiguous ("Friday" — this week or next?), ask.

### 2. Capture the title

Short — what shows on the calendar cell. "Lisa launch", "Deadline: BookFunnel", "Out of office". Keep under ~40 chars so it doesn't truncate visually.

### 3. Optional body + color

- **Body** — only if the user volunteered more detail. Don't pad it with filler.
- **Color** — if the user assigned a meaning ("red for deadlines"), use a sensible hex (`#ef4444` red, `#22c55e` green, `#f59e0b` amber, `#3b82f6` blue, `#9ca3af` neutral gray). Otherwise default gray and don't ask.

### 4. Create

Call `aa_create_calendar_note` with `{ date, title, body?, color?, profileId? }`.

### 5. Confirm

Show the date + title back: "Added a note on June 12: 'Lisa launch'."

## Editing notes

`aa_update_calendar_note` accepts the note id plus any subset of `{ date, title, body, color }` — omitted fields stay as-is. If the user says "change the color to red," only send `{ noteId, color: "#ef4444" }`. Don't echo unchanged fields back.

## Deleting notes

`aa_delete_calendar_note` takes the note id. Confirm before firing if the title hints at something important ("Deadline: BookFunnel" — "Want me to remove the BookFunnel deadline note from June 12?"). For obvious junk ("test", "asdf"), just delete.

## Common pitfalls

- **Don't create a note when the user actually wants a scheduled post.** "Remind me to post on Friday" is ambiguous — a note is a visual marker, NOT a reminder that fires a notification. If the user wants something to actually publish, route to `social-post`.
- **Don't forget `profileId`.** A note created on the wrong pen name's calendar will be invisible from the pen name the user is actually working in. Always carry the resolved `profileId` from `pen-names`.
- **Don't list before creating unless the user asked.** Listing all notes is noisy and rarely useful before a single create. Just create.
