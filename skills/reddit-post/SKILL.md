---
name: reddit-post
description: Use when the user wants to post to Reddit, share to a subreddit, or set a Reddit flair. Triggers on "reddit", "r/<subreddit>", "post to subreddit", "reddit flair", "self post on reddit".
---

# Reddit — Required Subreddit, Title, and Flair Conventions

## When to Use

- User wants to schedule a post to Reddit
- User mentions a subreddit name (with or without the `r/` prefix)
- User mentions a flair

This skill writes the right `redditOptions` block. Hand scheduling back to `social-post`.

## The hard requirements: subreddit + title

**Reddit REQUIRES both a subreddit AND a title.** The server enforces both with 422s if missing. These are separate from the caption (which becomes the body / self-text).

- `subreddit` — without the `r/` prefix. e.g., `"Fantasy"`, `"BookRecommendations"`. Don't include the slash or the `r/`.
- `title` — 1–300 chars, the post headline visible in feeds
- caption (top-level `content`) — the body text for self posts; ignored if `forceSelf: false` and `url` is set

If the user gives you only a caption, ask: "Which subreddit should this go to, and what's the post title? (Reddit titles are separate from the body — they're what shows up in someone's feed.)"

## Self post vs link post

Reddit has two post types:
- **Self post** (text): body is from `content`, no external link. Set `forceSelf: true` (or omit — Reddit defaults to self when no URL is given).
- **Link post**: shares an external URL. Set `url` to the link, `forceSelf: false`. The caption becomes the link description, not body text.

For book-promo posts where the author is sharing their thoughts and hoping for engagement, **self post is almost always the right choice.** Link posts get fewer comments and feel like marketing.

## Flair — the subreddit-specific quirk

Most large subreddits require a flair (e.g., r/Fantasy requires "Recommendation," "Discussion," "Self-Promotion" etc). Without the right flair, the post gets auto-removed by AutoModerator.

Flair IDs are **per-subreddit and unique** — you can't know them ahead of time. Two ways to handle:

1. **Ask the user** for the flair name they want to use, and tell them you'll need the flair ID. They can grab it from the subreddit's wiki or by attempting a manual post first.
2. **Skip flair on first attempt** and tell the user the post may be held by AutoMod. They can flair it manually after publishing.

If the user doesn't know the flair ID and you don't have a way to look it up, default to (2) — schedule without flair, warn them about AutoMod, and tell them they can fix it post-publish.

## Flow

### Step 1: Confirm subreddit + post type

Ask if not stated:
- Which subreddit? (just the name, no `r/`)
- Self post or link post?
- If link: what URL?

### Step 2: Get the title

Reddit titles drive everything. They show in feeds, in search, in r/all. Help the user write a good one — book-promo titles like "I just published my novel, please support" perform terribly. Better: hooks like "After 3 years of writing, I finally finished my fantasy novel — what should I do next?"

### Step 3: Handle the flair conversation

Most subreddits have flairs. Ask. If they don't know: schedule without and warn them.

### Step 4: Build the post

Self post:

```js
aa_create_post({
  content: "<body text — your story, hook, or discussion starter>",
  accountIds: ["<reddit-account-id>"],
  scheduledAt: "<ISO timestamp>",
  redditOptions: {
    subreddit: "Fantasy",
    title: "After 3 years of writing, I finally finished my fantasy novel — what should I do next?",
    forceSelf: true,
    flairId: "<optional, per-subreddit>"
  }
})
```

Link post:

```js
aa_create_post({
  content: "<short description of the link>",
  accountIds: ["<reddit-account-id>"],
  redditOptions: {
    subreddit: "writing",
    title: "<headline>",
    url: "https://...",
    forceSelf: false,
    flairId: "<optional>"
  }
})
```

### Step 5: Hand off to social-post for scheduling

## Common mistakes to avoid

- Including `r/` in `subreddit`. The API wants just the name. `redditOptions.subreddit = "Fantasy"`, not `"r/Fantasy"`.
- Putting the title in `content`. They're separate. Title = headline visible in feeds; content = body.
- Defaulting to link posts when the user is doing book promo. Self posts perform much better.
- Skipping the flair conversation entirely. AutoMod removal is the #1 cause of "my reddit post never showed up" support tickets.
- Picking a subreddit where self-promo is banned (e.g., r/books). Most large book subs have strict rules. Ask the user to confirm they've read the subreddit's rules before scheduling.
