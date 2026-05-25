---
name: find-something-to-post
description: Use when the user wants ideas for content to post about — from their books, blog, or recent news in their niche. Triggers on "what should I post about", "find me content", "ideas for tomorrow", "give me something to post", "I need a post idea".
---

# Finding something to post

Surface ready-to-go content ideas from the user's books library and their subscribed RSS feeds, then hand the chosen idea to `social-post` for drafting and scheduling.

## How it works

1. **`aa_find_content` does the search** — it pulls candidates from the user's books (titles, blurbs, cover images) and recent items from any RSS feeds they're subscribed to (see `rss-publishing`). Default to both sources unless the user narrows.
2. **The skill is a picker, not a drafter.** Surface 5 candidates with a one-line summary and source, let the user choose, then read voice (`aa_get_guides`) and hand off.
3. **Pen-name scoping matters.** `aa_find_content` returns books and feeds for the active `profileId` — switch first via `pen-names` if the user mentioned a specific identity.

## Decision tree

| User says... | Action |
|---|---|
| "What should I post about" / "Give me a post idea" | `aa_find_content` with both sources |
| "Something from my books" / "Post about Curses and Currents" | `aa_find_content` filtered to books |
| "Anything new from my blog" / "Latest RSS items" | `aa_find_content` filtered to feeds (or `aa_list_rss_feed_items` for a specific feed) |
| "Post the third one" / "Use that one" | Hand off to `social-post` with the chosen item as context |

## Flow

### 1. Ask the source (if not stated)

Default both. If the user says "from my books" or "from my blog," scope accordingly. Mention the alternative so they know it's available.

### 2. Pull candidates

Call `aa_find_content` (pass `profileId` if the user is working under a non-primary pen name). It returns up to ~5 items per source with title, source label (book name or feed name), one-line summary, and image URL when available.

### 3. Present the menu

Show the user a numbered list:

```
1. [Book] Curses and Currents — "A cozy mystery about a witch baker who solves crimes with sourdough."
2. [Blog] Why I write cozy — published 2 days ago on chellehoniker.com
3. ...
```

Include image URLs when present so the user knows there's a cover or hero asset they can reuse.

### 4. User picks → read voice

Once the user picks ("the second one" / "the book"), call `aa_get_guides` (with the right `profileId`) to load brand voice and prose style for the active pen name.

### 5. Draft + hand off

Write a draft caption in the user's voice that references the chosen content (book blurb, blog excerpt). Then hand off to `social-post` (or the `/aa-post` slash command) for platform selection, platform-specific captions, media, and scheduling.

Carry the chosen item's image URL into `social-post` as a starting media asset — don't force the user to re-upload a cover they already have on file.

## Common pitfalls

- **Don't draft 5 captions for 5 candidates.** Wasteful — most users pick one. Surface summaries first, then draft after they pick.
- **Don't skip `aa_get_guides`.** A book candidate's blurb is marketing copy in a publisher's voice; the user wants the caption in their own voice. Always read guides before drafting.
- **Don't ignore the `profileId`.** A user with two pen names will see candidates from the wrong identity's library if you don't scope correctly (see `pen-names`).
