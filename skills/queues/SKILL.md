---
name: queues
description: Use when the user wants to view, create, edit, or delete a posting queue — recurring slot times for "add to queue" scheduling. Triggers on phrases like "create a queue", "add a queue", "edit my queue", "delete this queue", "set up a posting schedule for my Cozy Mystery persona", "I want a separate queue for TikTok", "show me my queues".
---

# Posting queues

A queue is a recurring set of slot times that drives the "add to queue" scheduling mode. Posts added to a queue land in the next free slot.

## Three things to know about queues

1. **A queue lives per pen name.** Switch the active pen name (via `pen-names`) before creating or editing — every queue tool implicitly scopes to the current `profileId`.

2. **A queue can be scoped per platform** (the `platforms[]` field). If a queue serves only `["instagram", "tiktok"]`, "add to queue" for an IG+TikTok+FB post fills the IG and TikTok slots from THIS queue but falls back to a different queue (or the user's default) for FB. Empty `platforms[]` = "this queue serves any platform" — the legacy behavior, still the right default for general-purpose queues.

3. **A queue can be scoped per persona** (the `tag` field). One pen name often carries multiple personas (Cozy Mystery vs. Spicy Romance, fiction vs. nonfiction coaching) — each persona may want its own posting cadence. Resolution at "add to queue" time: a queue with `tag` matching the post's persona wins over a shared (`tag` = null) queue. Use `aa_list_guide_sets` to see the user's persona names before suggesting a tag.

## Decision tree — when to use each tool

| User says... | Tool |
|---|---|
| "Show me my queues" / "What queues do I have" | `aa_list_queues` |
| "When does my next slot fire" / "Preview the next 5 slots" | `aa_queue_preview` (NOT this skill — different intent) |
| "Create a queue called X for the Cozy Mystery persona, posting Mon/Wed/Fri at 9am CT" | `aa_create_queue` |
| "Add Tuesday at 2pm to my Cozy queue" / "Make my queue post-only-on-Saturdays" | `aa_update_queue` |
| "Make this queue serve only Instagram" / "Move this queue to my Spicy Romance persona" | `aa_update_queue` |
| "Delete my Old Stuff queue" | `aa_delete_queue` |

## Flow for creating a queue

### 1. Confirm the basics

Ask in plain language:
- **What's the queue called?** (free text — "Cozy Mystery Daily", "Weekend Promo", etc.)
- **Which timezone?** (IANA — `America/Chicago`, `Europe/London`. If the user gives a city/zone name, convert it.)
- **What days and times?** (a list of `{ dayOfWeek, time }` — `dayOfWeek` is 0=Sunday … 6=Saturday)

### 2. Decide platform scope

If the user mentioned specific platforms ("a queue for TikTok and Reels"), capture those as `platforms` (lowercase platform slugs — `instagram`, `tiktok`, `facebook`, etc.). Otherwise leave `platforms` empty so the queue serves any platform.

### 3. Decide persona scope

If the user mentioned a specific persona ("for my Cozy Mystery posts only"):
1. Call `aa_list_guide_sets` to get the user's persona list.
2. Match the user's intent to a persona tag (case-insensitive substring match is fine).
3. Pass that tag as `tag` on `aa_create_queue`.

If the user gave no persona signal, omit `tag` (or pass `null`) — the queue is shared across all personas under this pen name. For pen names with only one persona, that's the only option anyway.

### 4. Show + create

Show the user the proposed queue (name, timezone, slot list, platforms, persona scope) and ask "Look right?" Once confirmed, call `aa_create_queue`.

### 5. Confirm

Tell them what got created and how the slots interact with their existing queues if they had any.

## Flow for editing a queue

### 1. List + identify

If the user named the queue ("edit my Cozy Mystery queue"), call `aa_list_queues` and match by name. If multiple match, ask. If none match, surface that and offer to create one.

### 2. Tristate semantics on update — don't accidentally clear

`aa_update_queue` has tristate behavior on the locally-owned fields:
- **`platforms`**: omit to leave existing platforms untouched. Pass `[]` to clear (= "serves any platform"). Pass an array to replace.
- **`tag`**: omit to leave persona scope untouched. Pass `null` to move to shared (= no persona). Pass a tag string to set/change scope.

This matters because a name-only edit shouldn't accidentally flip a persona-scoped queue back to shared, or vice versa. If the user says "rename my Mon/Wed/Fri queue to Weekday Posts," only send `{queueId, name: "Weekday Posts"}` — don't include platforms or tag at all.

### 3. Show + apply

Show what's changing (diff-style), confirm, then call `aa_update_queue`.

## Deleting a queue

`aa_delete_queue` requires only the queueId. The server enforces that the queueId belongs to the resolved pen name — cross-tenant attempts return 403 (good — defense in depth, but you shouldn't be able to construct that input anyway).

After delete: any future "add to queue" call that would have resolved to this queue falls through to the next-best match (another platform/persona-scoped queue, or the pen name's default).

## Common mistakes to avoid

- **Don't suggest creating a queue without checking what's already there.** Many users have a default queue that already covers their needs — call `aa_list_queues` first when the user says "I want to schedule posts to a queue" rather than racing to `aa_create_queue`.
- **Don't omit `tag` and assume "all personas means the user's default persona"** — they're different. `tag = null` = serves all personas; `tag = "Cozy Mystery"` = only the Cozy Mystery persona's posts. The default persona is just one of the personas; queues don't have a "default persona" concept of their own.
- **Don't create a queue per platform if a multi-platform queue would do.** A single queue with `platforms = ["instagram", "tiktok"]` works the same as two separate queues for a multi-platform post — and is easier to maintain. Suggest the multi-platform shape first.
- **Don't pass `time` AND `hour`/`minute` on the same slot.** The schema accepts both shapes but they conflict. Use `time: "09:00"` OR `{ hour: 9, minute: 0 }` — pick one and stick with it across the queue.
