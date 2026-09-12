---
name: inbox-triage
description: Use when the user wants to read or respond to incoming social activity — DMs, comments on their posts, or reviews. Triggers on "reply to my DMs", "check my comments", "triage my inbox", "what's in my inbox", "answer my messages", "respond to comments", "pin that comment", "pin a comment on TikTok", "hide this comment", "reply to my reviews".
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
| "Like that comment" / "Heart her comment" | `aa_like_inbox_comment` (FB, X, Bluesky, Reddit — where it upvotes; `unlike: true` to undo) |
| "DM whoever commented that" / "Send her the link privately" | Draft → confirm → `aa_private_reply_inbox_comment` (public comment → private DM) |
| "Archive this conversation" / "Clear it from my inbox" | `aa_archive_conversation` (status `archived`; `active` brings it back) |
| "Fix the typo in the message I sent" | `aa_edit_inbox_message` (TELEGRAM ONLY — other platforms don't allow edits) |
| "Delete that message I sent" | Confirm → `aa_delete_inbox_message` (Telegram, X, Bluesky, Reddit) |
| "React with a heart" | `aa_react_inbox_message` (Telegram + WhatsApp; `remove: true` to clear) |
| "Pin that comment to the top" | `aa_pin_inbox_comment` (TikTok only; top-level comments; `unpin: true` to remove the pin) |

**Private replies (comment → DM)** are the classic "comment X and I'll DM you" move, Facebook/Instagram only. Platform rules: ONE private reply per comment, within 7 days of the comment, text message required. Draft-and-confirm like any other send. **TikTok has no private reply at all**; it is a Meta mechanism. On TikTok, reply publicly or pin the comment instead.

**Pinning a comment** (`aa_pin_inbox_comment`) is TikTok-only today, and only top-level comments can be pinned. It is the TikTok answer to "I want everyone to see this one": pin the reader question the author just answered well, or the review they want at the top of the thread. Pass `unpin: true` to take it back down. Pinning is public and reversible, so it needs a light confirm rather than the full spend-style gate, but still say which comment you're about to pin.

**Bluesky like quirk:** pass the comment's `cid` when liking; pass the `likeUri` (returned by the like) when unliking.

## TikTok inbox rules

TikTok's inbox works, but it is the most constrained platform in here, and the constraints are the platform's, not ours. The account has to be connected through **TikTok for Business** for comments and DMs to appear at all.

**Comments:** reply, like, hide/unhide, delete your own, and pin/unpin a top-level comment. No private reply.

**DMs:** reply-only. A business can never open a TikTok conversation, so there is no "DM this reader out of the blue" on TikTok. After the reader's last message, TikTok accepts up to **10 messages within 48 hours**. One message is **either** text (up to **6,000 characters**) **or** one JPG/PNG image (up to **3 MB**), never both. Meta rich-reply fields (buttons, quick replies, templates, message tags) are dropped on TikTok, so don't build a reply around them.

Practically: if a TikTok thread has gone quiet for more than two days, the window is shut and the author cannot reopen it. Tell them that plainly instead of drafting a reply that will fail.

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

## Automating the inbox — flows

For recurring patterns ("whenever someone comments 'GUIDE', reply and DM them the link"), suggest an **inbox automation flow** instead of manual triage: `aa_list_flows` / `aa_create_flow` / `aa_update_flow` / `aa_activate_flow` / `aa_get_flow_runs`. Flows are trigger → condition → action graphs that auto-respond to comments and DMs, and they're **free on every plan**. Create as a draft, show the user the trigger + graph, and activate only on explicit OK (`aa_activate_flow` — activation validates the graph). `settings.reentry` defaults to `once` (at most one run per conversation/commenter); `always` re-triggers on every match. Debug "why didn't it fire?" with `aa_get_flow_runs` — the step-by-step walk log includes steps skipped for missing addon coverage. For the simpler Meta-only keyword→DM rules, the `comment-to-dm-automation` skill still applies.

## Reply patterns by type

- **DM replies** — match the conversation's existing register. Long thoughtful DMs get long thoughtful replies; one-liners get one-liner replies. Don't over-respond to a "hi 👋" with a paragraph.
- **Comment replies** — short, warm, on-brand. Comments are public; treat them as caption-adjacent content. Don't ask for personal info in a public reply.
- **Review replies** — measured, professional, never defensive. Even a 1-star gets a "thank you for the feedback, we hear you, here's how we're addressing it." Show the draft and let the user sanity-check the tone before sending; review replies are permanent and indexed.

## Confirm before firing

- Before any `aa_send_inbox_message` / `aa_reply_inbox_comment` / `aa_reply_inbox_review` / `aa_private_reply_inbox_comment`: show the full drafted text and the recipient/thread context. Wait for explicit approval.
- Before `aa_hide_comment`: show the comment text and the post it's on. Wait for explicit approval.
- Before `aa_delete_inbox_message`: show the message being deleted. Wait for explicit approval.
- Before `aa_activate_flow`: show the trigger + graph the flow will run. Wait for explicit approval.

## Common pitfalls

- **Don't auto-mark as read.** Reading a thread with `aa_get_inbox_thread` may or may not mark it read on the platform — depends on the upstream API. Don't rely on it; don't tell the user "marked as read."
- **Don't draft replies in a generic ChatGPT voice.** Always read `aa_get_guides` first; the user picked these guides for a reason.
- **Don't reply to your own comments.** Some platforms surface the author's own comments in the inbox feed (e.g., a reply you left earlier). Skip those — engaging with your own thread isn't useful.
- **Don't forget `profileId` when triaging a non-primary pen name.** A user with multiple pen names will see the wrong inbox if you skip the scoping.
