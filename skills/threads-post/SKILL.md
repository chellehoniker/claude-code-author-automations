---
name: threads-post
description: Use when the user wants to post to Threads (Meta's text-first platform), set a Threads topic tag, or build a thread chain. Triggers on "threads", "topic tag", "post under [topic] on threads", "threads chain", "thread reply chain".
---

# Threads — Topic Tags and Thread Chains

## When to Use

- User wants to post to Threads (Meta's Twitter-alternative)
- User mentions a "topic tag" or "topic" for Threads
- User wants to build a multi-part thread (root post + replies)

This skill writes the right `threadsOptions` block. Hand the schedule/publish step back to `social-post`.

## Topic tags — the important bit

Threads has a feature called "topic tags" that file the post under a discoverable category (like "Book Threads," "Writing Community"). Tags increase reach to non-followers who follow the topic.

Rules from the API:

- `topicTag` is 1–50 characters
- **Cannot contain `.` or `&`** — the server will reject with a 422 if you try
- Setting `topicTag` overrides Threads' built-in hashtag auto-extraction

**When to leave it blank:** if the post's caption already has hashtags like `#BookThreads`, Threads will auto-extract one as the topic. Leaving `topicTag` empty is often correct — let auto-extract do the work.

**When to set it explicitly:** when the caption doesn't have a clean hashtag, or when you want the topic to differ from any hashtags in the caption (e.g., caption has `#fantasy` but you want the post filed under "Book Threads").

## Flow

### Step 1: Decide if you need a topic at all

Read the caption the user wrote (or the one you're drafting via `social-post`). If it has a hashtag like `#BookThreads`, you probably don't need to set `topicTag` — Threads auto-extracts.

If the caption is hashtag-light or you want a specific topic, ask the user (or pick from their brand guide via `aa_get_guides`).

### Step 2: Validate the tag locally

Before passing to `aa_create_post`, check:
- Length: 1–50 chars
- No `.` or `&`

If either fails, fix it (e.g., "B&N Authors" → "BN Authors") rather than letting the server 422 you.

### Step 3: Build the post

```js
aa_create_post({
  content: "<your caption>",
  accountIds: ["<threads-account-id>"],
  scheduledAt: "<ISO timestamp>",
  threadsOptions: {
    topicTag: "Book Threads"
  }
})
```

### Step 4: Hand off to social-post

The orchestrator handles scheduling.

## Thread chains (multi-part posts)

Threads supports posting a chain — first post is the root, subsequent items are replies. To use this, set `platformOptions.threads.threadItems` (this is the raw passthrough since chains aren't typed in `threadsOptions` yet):

```js
aa_create_post({
  content: "<root caption — also used for display/search>",
  accountIds: ["<threads-account-id>"],
  threadsOptions: { topicTag: "Writing Community" },
  platformOptions: {
    threads: {
      threadItems: [
        { content: "Part 1: the hook" },
        { content: "Part 2: the meat" },
        { content: "Part 3: the call to action" }
      ]
    }
  }
})
```

Important: when `threadItems` is provided, the top-level `content` is used for display/search ONLY — it is NOT published. The first thread item is what gets published as the root. Make sure the first item is your strongest hook.

## Common mistakes to avoid

- Don't put `&` or `.` in `topicTag` — the server rejects with a 422.
- Don't repeat the caption verbatim in both `content` and the first `threadItems` entry — when threadItems is set, top-level content is just metadata. Write a search-friendly summary at the top, then write the actual root post in `threadItems[0]`.
- Don't set `topicTag` longer than 50 chars (the API tops out there).
- Don't set `topicTag` on platforms other than Threads — `instagramOptions.topicTag` is meaningless and will be ignored.
