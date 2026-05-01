---
name: instagram-reels
description: Use when the user wants to post an Instagram Reel, Trial Reel, Story, or any 9:16 vertical content for Instagram. Triggers on phrases like "trial reel", "post a reel", "IG reel", "reel cover", "instagram story", "9:16 for instagram", "instagram with cover image", "reel to non-followers".
---

# Instagram Reels, Trial Reels, and Stories

## When to Use

- User says "trial reel," "schedule reels," "post a reel," "reel cover," "story for IG"
- User wants 9:16 vertical content on Instagram (not the 4:5 feed format)
- User specifically mentions Trial Reels (the Instagram feature that shows the reel to non-followers first)

This skill writes the right `instagramOptions` block and hands the actual scheduling back to `social-post` (the orchestrator). Don't duplicate the schedule/publish step here.

## What lives where (so Claude doesn't get confused)

| IG product | Aspect | Media | Set in `instagramOptions` |
|---|---|---|---|
| **Feed** (default) | 0.75:1 to 1.91:1 (use 1080×1080, 1080×1350, 1080×566) | Up to 10 same-type items | `contentType: undefined` |
| **Story** | 9:16 (1080×1920) | Single image OR single video | `contentType: 'story'` |
| **Reel** | 9:16 (1080×1920) | Single video only | `contentType: 'reel'` |
| **Trial Reel** | 9:16 (1080×1920) | Single video only | `contentType: 'reel'` + `trialParams` |

**Hard rule:** if the user has 4 vertical (9:16) images for IG, post 4 separate Stories — NOT one carousel. IG carousels require 0.75:1 to 1.91:1.

## Trial Reels — the important bit

Trial Reels show the reel to non-followers first. The author gets engagement signal from a cold audience before the reel is shown to their actual followers. This is hot in indie author marketing right now because it lets you test new content angles without burning your follower base.

`trialParams.graduationStrategy` determines how the reel "graduates" from trial to public:

- `'MANUAL'` — author decides in the IG app when to push it to followers based on metrics. Use when the author wants control.
- `'SS_PERFORMANCE'` — IG auto-graduates if non-follower engagement is good. Use when the author wants set-and-forget.

Default to `'SS_PERFORMANCE'` unless the user specifies. It's the lower-friction option for batch scheduling.

## Reel covers — three sources, in priority order

When the user asks for a reel cover image, you have three options:

1. **External image (best for branding):** generate or upload a 9:16 image, get the public URL, set `instagramOptions.coverImage = "https://..."`. This wins over everything else.
2. **Frame from the video:** set `instagramOptions.coverFromTimestamp = <ms into video>` (e.g. 2000 for 2 seconds in). Ignored when `coverImage` is set.
3. **No cover specified:** Instagram auto-picks the first frame.

If the user says "use a generated cover" or "match my brand," generate the image first via Freepik (the campaign skill's image-generation flow), get the public URL, then schedule with `coverImage`.

## Flow

### Step 1: Confirm what they want

Ask if it's not obvious from the prompt:
- Reel, Trial Reel, or Story?
- If Reel/Trial: do they have a video, or should we generate one via the campaign flow?
- Cover: auto-frame, specific timestamp, or generate/upload an image?

### Step 2: Read their guides

Call `aa_get_guides` to match their brand voice for the caption.

### Step 3: List their accounts

Call `aa_list_accounts` to get the IG account ID. If they have multiple IG accounts, ask which.

### Step 4: Build the post

For a **Trial Reel**:

```js
aa_create_post({
  content: "<caption matching their voice>",
  accountIds: ["<ig-account-id>"],
  scheduledAt: "<ISO timestamp>",
  timezone: "<their timezone>",
  mediaItems: [{ type: "video", url: "<video URL>", width: 1080, height: 1920 }],
  instagramOptions: {
    contentType: "reel",
    coverImage: "<optional cover URL>",
    trialParams: {
      graduationStrategy: "SS_PERFORMANCE"
    }
  }
})
```

For a **Story**:

```js
aa_create_post({
  content: "<caption — Stories show a brief overlay>",
  accountIds: ["<ig-account-id>"],
  mediaItems: [{ type: "image", url: "<9:16 URL>", width: 1080, height: 1920 }],
  instagramOptions: { contentType: "story" }
})
```

### Step 5: Hand off to social-post for scheduling

The social-post skill handles "publish now vs schedule vs queue" — don't reimplement that here.

### Step 6: Confirm

Tell the user what was scheduled, including: Trial Reel? yes/no with graduation strategy, cover source, scheduled time.

## Common mistakes to avoid

- Don't put a 1080×1920 image in `mediaItems` and call it a Feed post — IG rejects it as too tall (aspect 0.56:1 outside 0.75:1–1.91:1). The server pre-flight will catch this with a 422 + suggestion to switch to Story.
- Don't try to post 4 vertical images as a carousel to "Stories" — Stories are single-media. Loop through 4 separate `aa_create_post` calls instead.
- Don't set `trialParams` on a Story or Feed post — Trial Reels only apply to `contentType: 'reel'`.
- Don't forget to ask the user about the cover. The default (auto-frame) is often blurry mid-action. A generated or selected cover is almost always better.

## Batch flow: "8 trial reels"

When the user asks for multiple trial reels (common for promo periods), don't write them one at a time. Plan all 8 first — themes, hooks, video prompts, cover prompts — show the plan for review, then loop over `aa_create_post` calls when approved. Use the social-campaign skill if it's a sustained content arc; use this skill if it's just a batch of standalone reels.
