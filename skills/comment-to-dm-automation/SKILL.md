---
name: comment-to-dm-automation
description: Use when the user wants Facebook or Instagram to automatically DM people who comment specific keywords on their posts — typically to deliver a link, freebie, or follow-up after a launch comment. Triggers on "auto-DM commenters", "DM people who comment LINK", "comment to DM", "if someone comments X send them Y", "launch giveaway automation".
---

# Comment-to-DM automations — auto-message people who comment a keyword

A comment-to-DM automation watches a Facebook page or Instagram account (optionally narrowed to one post) for comments matching trigger keywords, then auto-sends a DM to the commenter. Standard playbook: "comment LINK to get the freebie" → automation DMs the link.

## Quick facts

- **On every plan.** No upgrade needed.
- **Pen-name-scoped.** Every automation tool takes `profileId`. Switch context via `pen-names` first if the user mentioned a specific pen name and carry the resolved `profileId` through every call.
- **Defaults to PAUSED on create.** Don't auto-enable. The user explicitly flips it on after reviewing.
- Supported platforms: **Facebook pages** and **Instagram business/creator accounts** only. Reddit/TikTok/LinkedIn/Threads/X don't support this API. (Inbox **flows** can also start from a comment keyword; there, X is DM-only: X comments no longer arrive, so a comment-keyword flow on X would never fire.)

## Message length limits

The DM body has two distinct caps depending on whether buttons are attached:

- **≤ 640 characters** when one or more buttons are attached
- **≤ 1000 characters** when no buttons (text-only DM)

Validate locally before calling `aa_create_comment_automation` — the server will 422 but a local check saves the round trip.

## Button rules

Optional. Max **3 buttons** per automation. Each button:

- `type`: `"url"` | `"postback"` | `"phone"`
- `title`: ≤ **20 chars** (this is the visible label — keep it tight)
- payload depends on type: `url` needs a URL, `postback` needs a payload string, `phone` needs a phone number (E.164)

## Decision tree

| User says... | Tool |
|---|---|
| "What auto-DM rules do I have running" | `aa_list_comment_automations` |
| "Set up auto-DM for my book launch post" / "If someone comments LINK send them my Linktree" | `aa_create_comment_automation` |
| "Change the keywords on that automation" / "Update the DM message" / "Pause my Launch automation" | `aa_update_comment_automation` |
| "Delete the freebie automation" | `aa_delete_comment_automation` |

## Flow for creating an automation

### 1. Scope — whole account or one post?

Ask: "Should this watch every post on the account, or just one specific post?" Most launch-style automations are scoped to a single post (avoids accidentally DMing people who comment on unrelated content months later).

- **Whole account** — leave `postId` unset.
- **Single post** — call `aa_list_posts({ profileId? })` to surface candidates, get the user to pick, capture `postId`.

### 2. Confirm the account

Call `aa_list_accounts({ profileId?, platform: "facebook" })` or `platform: "instagram"`. Confirm which connected account this targets. Capture `accountId`.

### 3. Trigger keywords

Ask: "What words should trigger the DM?" Capture as a comma-separated list (`"LINK", "FREEBIE", "yes"`). Keep keywords short and easy to type — case-insensitive matching is standard but mention that emoji/punctuation matters.

### 4. Compose the DM message

Help the user write the DM body. Validate against the length cap (640 with buttons, 1000 without). Common patterns:

- "Thanks for commenting! Here's the link you asked for: [URL]"
- "So glad you want the freebie — grab it here: [URL]. Let me know what you think!"

If the user wants the link as a tappable button instead of inline text, plan a button (next step).

### 5. Optional buttons

Ask if they want buttons. Max 3, each title ≤ 20 chars. Typical setup: one URL button labeled "Get the freebie" or "Buy now."

### 6. Optional public reply

Ask: "Should the automation ALSO post a public reply to the comment thread?" If yes, get the exact text (e.g., "Sent! Check your DMs.") and pass it as `commentReply`. Leave `commentReply` out when there should be no public reply. Usually worth it for launches (it lifts engagement); skip it for low-key freebies.

### 7. Show + create — PAUSED

Recap the full automation (scope, account, keywords, DM body, buttons, public reply). Confirm before firing. Call `aa_create_comment_automation` with `isActive: false` so it's left paused until the user explicitly enables it. Check `isActive` in the response. If it came back `true`, pause it straight away with `aa_update_comment_automation({ isActive: false })`, tell the user, and confirm it's paused before moving on.

Tell the user: "Created and paused. Flip it on from the dashboard (or ask me to enable it) once you're ready."

## Editing automations

`aa_update_comment_automation` takes the automation id plus any subset of fields. Omitted fields stay as-is. Set `isActive: true` / `false` to enable or disable without rebuilding.

## Confirm before firing — destructive + reach actions

- **Enabling** an automation that DMs strangers is a reach action — confirm: "Activating this will start auto-DMing everyone who comments 'LINK' on this post. Proceed?"
- **Deleting** an active automation: confirm with the keyword list so the user knows what they're killing.

## Common pitfalls

- **Auto-enabling on create.** Always default to paused. Users want to review the DM body live before strangers receive it.
- **Skipping the post scope question.** A whole-account automation triggered by "yes" will fire on every casual comment for months — almost never what the user wanted.
- **Overflowing the message length.** 640 with buttons, 1000 without. Validate before the API call.
- **Wrong `profileId`.** A page belonging to one pen name can't be referenced from another pen name's automation namespace.
