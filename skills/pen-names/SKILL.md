---
name: pen-names
description: Use when the user mentions a specific pen name, has multiple pen names, or asks to switch between author identities. Triggers on phrases like "post under my [pen name]", "switch to [pen name]", "schedule for Indie Author Magazine", "my other pen name", "list my pen names".
---

# Switching Between Pen Names

## Why this matters

Authors who write under multiple pen names rely on the platform's pen-name separation: each pen name has its own connected social accounts, calendar, queue, books library, and brand voice guides. The web app has a top-right dropdown to switch between them.

In the plugin, every profile-scoped tool (`aa_list_accounts`, `aa_create_post`, `aa_list_posts`, `aa_list_campaigns`, `aa_create_campaign`, `aa_queue_preview`, `aa_get_guides`) accepts an optional `profileId` argument. **Without `profileId`, calls go to the user's primary pen name.** With `profileId`, calls scope to that specific pen name's data.

## When to use this skill

The user mentions a pen name by name, OR the user has multiple pen names, OR you suspect you're addressing the wrong identity (e.g., `aa_list_accounts` returns an empty list and the user said they have IG connected).

## Flow

### 1. Discover their pen names

Call `aa_list_profiles` once. It returns:

```json
{
  "profiles": [
    { "id": "abc123...", "name": "chelle", "isOwner": true },
    { "id": "def456...", "name": "Indie Author Magazine", "isOwner": false }
  ],
  "limit": 2
}
```

`isOwner: true` is the user's primary profile (the one used when no `profileId` is passed).

### 2. Match the user's intent to a profile

If the user said "post to Indie Author Magazine" and you see a profile named "Indie Author Magazine," that's the match. If the match is ambiguous (e.g., user said "my magazine account" and there's no profile with "magazine" in the name), ask the user to confirm: "I see two pen names — chelle and Indie Author Magazine. Which one should this post go under?"

### 3. Pass `profileId` on every subsequent profile-scoped call

```js
// Before pen-name switch
aa_list_accounts({ platform: "instagram" })  // → primary pen name's IG accounts

// After
aa_list_accounts({ profileId: "def456...", platform: "instagram" })  // → Indie Author Magazine's IG
aa_create_post({ profileId: "def456...", content: "...", accountIds: [...] })
aa_get_guides({ profileId: "def456..." })  // ← brand voice for THIS pen name, not the primary
```

The `profileId` doesn't carry across calls automatically. If the user is working in a single pen name for a multi-step flow (campaign creation, several posts in a row), include it on EVERY tool call in the sequence.

### 4. Brand voice changes per pen name

`aa_get_guides` returns a different document per profile. ALWAYS call it with the matching `profileId` before drafting captions — a cozy-mystery pen name's voice is different from a thriller pen name's.

## Common mistakes to avoid

- **Forgetting `profileId` mid-sequence.** If the user has been working under a non-primary pen name for the last several tool calls, keep using its `profileId`. Don't silently revert to primary.
- **Calling `aa_list_profiles` multiple times.** It's the same data each time — call it once at the start of the conversation when needed and remember the IDs.
- **Treating an empty `aa_list_accounts` as "user has nothing."** First check: did you pass the right `profileId`? The user's IG account might be connected to a different pen name.
- **Sharing posts across pen names.** When the user asks to "post the same thing to both pen names," that's TWO `aa_create_post` calls with different `profileId` values — not one call with both account IDs. Each pen name has separate platform connections.

## Sample exchange

**User:** "Schedule a post about my new mystery novel for my Indie Author Magazine pen name on Instagram and Threads tomorrow at 10am."

**You:**
1. Call `aa_list_profiles` — find "Indie Author Magazine" profile, get its ID
2. Call `aa_get_guides({ profileId: "..." })` — read the magazine's brand voice
3. Call `aa_list_accounts({ profileId: "...", platform: "instagram" })` — get IG account ID
4. Call `aa_list_accounts({ profileId: "...", platform: "threads" })` — get Threads account ID
5. Draft platform-specific captions matching the magazine's voice
6. Call `aa_create_post({ profileId: "...", content, accountIds: [ig, threads], scheduledAt: "..." })`

If `profileId` is omitted on any of those calls, it'd go to the user's primary pen name — wrong identity.
