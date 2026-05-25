---
name: rss-publishing
description: Use when the user wants their blog, newsletter, or RSS feed to automatically become social posts. Triggers on "auto-post my blog", "subscribe to this feed", "watch this RSS", "smart publishing", "every time I publish a new post, share it on social".
---

# RSS smart publishing

Subscribe an external feed (blog, newsletter, podcast RSS) so new items become social posts on the user's connected accounts — either auto-published or surfaced as drafts for review.

## Three things to know about RSS feeds

1. **Auto-post defaults to OFF.** New items land as drafts so the user reviews them before anything goes live. Flip auto-post ON only when the user explicitly says "publish automatically" or has been running the feed for a while and trusts the template.

2. **A feed lives per pen name.** Pass `profileId` on every RSS tool call when the user is working under a non-primary pen name (see `pen-names`). Without it, the feed gets created on the primary pen name — wrong identity.

3. **The post template uses `{{title}}`, `{{link}}`, `{{summary}}` placeholders.** Anything outside those mustache tags is literal. A reasonable default: `"New on the blog: {{title}} — {{link}}"`. If the user doesn't supply a template, suggest one and ask.

## Decision tree — when to use each tool

| User says... | Tool |
|---|---|
| "What feeds am I subscribed to" / "Show my RSS feeds" | `aa_list_rss_feeds` |
| "Watch my blog at example.com/feed" / "Add this RSS" | `aa_create_rss_feed` |
| "Change the template" / "Turn on auto-post" / "Add Threads to this feed" | `aa_update_rss_feed` |
| "Unsubscribe from that feed" / "Stop watching the podcast feed" | `aa_delete_rss_feed` |
| "Check the feed now" / "Did my latest post come through" | `aa_poll_rss_feed` |
| "Show me items from this feed" / "What's in the queue from my blog" | `aa_list_rss_feed_items` |

## Flow for creating a feed

### 1. Collect the basics

Ask in plain language:
- **Feed URL** — the RSS/Atom URL. If the user pastes their blog home page, ask for the feed URL (usually `/feed`, `/rss`, or `/feed.xml`).
- **Title** (optional) — defaults to the feed's own title. Override if the user wants a custom label ("Curses and Currents launch posts").

### 2. Pick the destination accounts

Call `aa_list_accounts` (with `profileId` if needed) to show what's connected. Ask: "Which accounts should new items post to?" Capture the `accountIds`. A single feed can fan out to multiple accounts.

### 3. Build the template

Default: `"New on the blog: {{title}} — {{link}}"`

If the user wants something richer, show them the placeholders:
- `{{title}}` — the item's title
- `{{link}}` — the canonical URL
- `{{summary}}` — the description / excerpt (may be empty on minimal feeds)

Show the user the rendered template against a fake item before saving.

### 4. Auto-post decision

Ask: "Should new items publish automatically, or land as drafts for you to review first?" Default to drafts. Only flip auto-post ON when the user explicitly opts in.

### 5. Create + immediate poll

Call `aa_create_rss_feed` with the URL, title, account IDs, template, autoPost flag, and `profileId`. Then immediately call `aa_poll_rss_feed` on the new feed ID to surface the most recent items so the user sees it's working.

### 6. Confirm + offer next steps

Tell the user:
- Feed is watching, polling every ~15 minutes
- N items already showed up (from the poll) — they can review them via `aa_list_rss_feed_items`
- They can pick any historical item and turn it into a one-off post manually via `social-post`

## Flow for editing a feed

### 1. List + identify

`aa_list_rss_feeds` and match by name or URL. If the user said "edit my blog feed" and there's only one, that's the match. If multiple, ask.

### 2. Apply the change

`aa_update_rss_feed` accepts partial updates — only send the fields that changed. Common edits:
- Toggle `autoPost`
- Replace `accountIds` (full replace, not append)
- Edit `template`
- Rename via `title`

Show a diff-style summary before applying.

## Common pitfalls

- **Don't enable auto-post on the first creation without asking.** The user may not know the template renders the way they expect — drafts let them sanity-check item 1, then flip auto-post on once they're confident.
- **Don't forget to surface historical items.** `aa_poll_rss_feed` returns up to ~20 recent items on first poll; users sometimes assume only new items going forward will be published. Call out that they can grab any historical item via `aa_list_rss_feed_items`.
- **Don't omit `profileId` mid-flow.** If the user is working under a non-primary pen name (per `pen-names`), every RSS tool call needs the matching `profileId` — feeds are scoped per pen name.
- **Don't accidentally clear `accountIds` on update.** `aa_update_rss_feed` does a full replace of the array, not an append. To add an account, fetch the current set first.

## Confirm before firing

Before `aa_delete_rss_feed`: tell the user "This stops watching the feed and removes any unpublished drafts that haven't gone live yet — already-published posts stay." Get explicit confirmation.
