---
name: inbox-triage
description: Use when the user wants to read or respond to incoming social activity — DMs, comments on their posts, or reviews. Triggers on "reply to my DMs", "check my comments", "triage my inbox", "what's in my inbox", "answer my messages", "respond to comments".
---

# Inbox triage — DMs, comments, and reviews

Read incoming social activity across the user's connected accounts, draft replies in their voice, and send only after explicit confirmation.

> **STOS-only.** Inbox tools require a StorytellerOS-tier subscription. Non-STOS callers get a 403; in that case tell the user "This feature is on the StorytellerOS plan — upgrade at authorautomations.social/pricing to unlock the unified inbox."

## Three things to know about the inbox

1. **Never send without confirmation.** Every outbound reply (`aa_send_inbox_message`, `aa_reply_inbox_comment`, `aa_reply_inbox_review`) must be drafted, shown to the user, and explicitly approved before firing. Match the `social-post` pattern: "Here's the draft — want changes, or should I send it?"

2. **Read voice first.** Call `aa_get_guides` for the active pen name and use the `social_media_guide` to match tone. A cozy-mystery author replying to a creepy DM should sound different from a thriller author replying to the same DM.

3. **Pen-name scoping matters.** All inbox tools accept `profileId`. Without it, you only see the primary pen name's inbox. If the user said "check my Indie Author Magazine inbox," switch first via `pen-names`.

## Decision tree

| User says... | Tool |
|---|---|
| "What's in my inbox" / "Triage my inbox" | `aa_list_inbox_conversations` + `aa_list_inbox_comments` (parallel) |
| "Show me my DMs" / "Check my messages" | `aa_list_inbox_conversations` |
| "Open this conversation" / "Show the thread with @x" | `aa_get_inbox_thread` |
| "Reply to her" / "Send back: thanks!" | Draft → confirm → `aa_send_inbox_message` |
| "Check my comments" / "Reply to comments on the launch post" | `aa_list_inbox_comments` |
| "Reply to that comment" | Draft → confirm → `aa_reply_inbox_comment` |
| "Hide this spam comment" | Confirm → `aa_hide_comment` (explicit user OK only) |
| "Reply to my reviews" / "Respond to that 1-star" | `aa_list_inbox_reviews` → draft → confirm → `aa_reply_inbox_review` |

## Triage flow

### 1. Read voice

Call `aa_get_guides` (with `profileId` if non-primary). Skim the `social_media_guide` for tone, off-limits topics, and brand voice cues. Hold this in context for every draft.

### 2. Pull everything in parallel

Call `aa_list_inbox_conversations` and `aa_list_inbox_comments` together (and `aa_list_inbox_reviews` if the user has review-enabled accounts like Google Business). Summarize counts per platform:

```
Inbox snapshot (Indie Author Magazine):
- 4 DMs (3 unread): Instagram (2), TikTok (1), Threads (1)
- 7 comments (5 unanswered): on "Launch day for Curses and Currents" (4) and "Why I write cozy" (3)
- 1 new review: Google Business — 4 stars
```

### 3. Walk through one at a time

Don't batch-draft. For each thread:
1. Open it (`aa_get_inbox_thread` for DMs; comment context is usually inline)
2. Read the most recent inbound message
3. Suggest an action: **reply, skip, or hide** (comments only)
4. If reply: draft in voice, show, ask for changes or "send"
5. If skip: move on
6. If hide: confirm explicitly (spam policy below)

### 4. Send only after explicit approval

The confirmation gate is non-negotiable. Show the draft. Ask. Wait for the user to say "send" / "yes" / "looks good." Only then fire the send tool. If the user wants edits, redraft and re-confirm.

## Hiding spam comments

`aa_hide_comment` is destructive-adjacent — the comment vanishes from the post for other users (it's still visible to the commenter, which is the platform's standard "shadow hide" behavior).

**Never hide proactively.** Even if a comment is obvious spam, surface it: "This looks like spam ('Click here to win!') — want me to hide it?" Hide only after explicit user OK.

## Reply patterns by type

- **DM replies** — match the conversation's existing register. Long thoughtful DMs get long thoughtful replies; one-liners get one-liner replies. Don't over-respond to a "hi 👋" with a paragraph.
- **Comment replies** — short, warm, on-brand. Comments are public; treat them as caption-adjacent content. Don't ask for personal info in a public reply.
- **Review replies** — measured, professional, never defensive. Even a 1-star gets a "thank you for the feedback, we hear you, here's how we're addressing it." Show the draft and let the user sanity-check the tone before sending; review replies are permanent and indexed.

## Confirm before firing

- Before any `aa_send_inbox_message` / `aa_reply_inbox_comment` / `aa_reply_inbox_review`: show the full drafted text and the recipient/thread context. Wait for explicit approval.
- Before `aa_hide_comment`: show the comment text and the post it's on. Wait for explicit approval.

## Common pitfalls

- **Don't auto-mark as read.** Reading a thread with `aa_get_inbox_thread` may or may not mark it read on the platform — depends on the upstream API. Don't rely on it; don't tell the user "marked as read."
- **Don't draft replies in a generic ChatGPT voice.** Always read `aa_get_guides` first; the user picked these guides for a reason.
- **Don't reply to your own comments.** Some platforms surface the author's own comments in the inbox feed (e.g., a reply you left earlier). Skip those — engaging with your own thread isn't useful.
- **Don't forget `profileId` when triaging a non-primary pen name.** A user with multiple pen names will see the wrong inbox if you skip the scoping.
