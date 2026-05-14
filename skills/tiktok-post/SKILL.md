---
name: tiktok-post
description: Use when the user wants to post to TikTok, save a TikTok post as draft, disclose commercial content or AI-generated video, or set TikTok's interaction toggles (duets, stitches, comments, trending music). Triggers on "tiktok", "tt post", "tiktok draft", "tiktok inbox", "duet", "stitch", "brand partnership", "paid partnership", "ai generated video", "ai disclosure tiktok".
---

# TikTok — Drafts, Commercial Disclosure, AI Attestation

## When to Use

- User wants to post to TikTok
- User wants to save the post to TikTok's Creator Inbox to review before publishing (`draft`)
- The video is an AI-generated or AI-edited promo (`videoMadeWithAi`)
- The post promotes a brand, paid partnership, or the author's own brand (`commercialContentType`)
- User mentions duets, stitches, comments, or "trending music" on TikTok

This skill writes the right `tiktokOptions` block. Hand scheduling back to `social-post`.

## The non-obvious rules

TikTok has the most surface area of any platform we support, plus several rules where forgetting one field rejects the whole post.

### 1. Commercial content is paired

When the user says "this is a paid partnership" or "I'm promoting my own brand," set `commercialContentType` AND the matching flag — TikTok rejects the post otherwise:

| `commercialContentType` | Paired flag (must be true) | Use when |
|---|---|---|
| `"brand_organic"` | `isBrandOrganicPost: true` | Promoting the user's own brand or book |
| `"brand_content"` | `brandPartnerPromote: true` | Paid partnership with another brand |
| `"none"` (or omit) | (neither) | Standard post |

Don't set the flag without the type. Don't set the type without the flag. The pair is the only correct shape.

### 2. AI-generated video disclosure is REQUIRED if the video is AI

TikTok's policy (2024+) requires creators flag videos generated or significantly edited by AI. If the video came from any AI source (book trailers from `aa_generate_media`, AI image-to-video, voice cloning, etc.), set `videoMadeWithAi: true`. The platform won't reject for omitting it, but it can demonetize or take the post down later. Always disclose.

ASK THE USER if it's not obvious: *"This TikTok video — is it AI-generated or significantly AI-edited? TikTok requires that disclosure."*

### 3. Draft mode sends to the TikTok Inbox

Set `draft: true` when the user says they want to review before publishing. The post goes to the creator's TikTok app inbox; they finish posting from there. Useful when:
- The user wants to add music in the TikTok app (we can't pre-attach platform music)
- The user wants final visual review before going live
- The post needs final manual edits

Default to `draft: false` (direct publish). Only set true on explicit user request.

### 4. Duets and stitches default ON for video posts

`allowDuet` and `allowStitch` default to `true` server-side. Only flip them off when the user explicitly says they don't want their video remixed.

### 5. Comments default ON

`allowComment` defaults to `true`. Unless the user says "no comments," leave it alone.

### 6. Auto-add trending music is photo-carousel-only

`autoAddMusic: true` only applies to photo posts (TikTok adds a recommended track). On video posts it's ignored. Don't bother setting it for videos.

### 7. Long description is photo-carousel-only

`description` (up to 4000 chars) only renders on photo carousels. For videos the caption is the only text surface. If the user has a long story to attach to a photo set, put it in `description`; the caption stays short.

## Privacy level

`privacyLevel` controls who sees the post:

- `"PUBLIC_TO_EVERYONE"` — default, what most authors want
- `"MUTUAL_FOLLOW_FRIENDS"` — only people the user follows who follow back
- `"FOLLOWER_OF_CREATOR"` — followers only
- `"SELF_ONLY"` — visible only to the user (useful for previewing)

If the user mentions "friends only," "private," or "draft for myself," ask which they mean — privacy and draft mode are different things.

## Policy attestations (default on)

`contentPreviewConfirmed` and `expressConsentGiven` are TikTok-required attestations:
- `contentPreviewConfirmed` — the user reviewed the content
- `expressConsentGiven` — the user authorized this publish

Default both to `true` for non-draft publishes. The user agreed by submitting the post through the tool.

## Flow

### Step 1: Verify the user has a TikTok account connected

Call `aa_list_accounts`. If no TikTok account, tell the user they need to connect one at the AA Social dashboard. TikTok requires a Business or Creator account for analytics — Personal accounts can post but get zero analytics back from TikTok's API.

### Step 2: Gather options

Required by you (the agent):
- Is the video/post AI-generated? → `videoMadeWithAi`
- Is this a brand partnership or own-brand promo? → `commercialContentType` + paired flag
- Save to inbox before publishing? → `draft`

Default to the user's stated intent — if they're unsure, default to direct publish (`draft: false`), no commercial flag, no AI flag.

### Step 3: Build the post

```js
aa_create_post({
  content: "<your caption — short, punchy, hook-first>",
  accountIds: ["<tiktok-account-id>"],
  scheduledAt: "<ISO timestamp>",
  mediaItems: [{ type: "video", url: "<video URL>" }],
  tiktokOptions: {
    // Defaults — surface only when changing from the default
    privacyLevel: "PUBLIC_TO_EVERYONE",
    allowComment: true,
    allowDuet: true,
    allowStitch: true,
    // Disclosures — set when applicable
    videoMadeWithAi: true,        // AI-generated/edited video
    commercialContentType: "brand_organic",
    isBrandOrganicPost: true,     // paired with brand_organic
    // Attestations — default true for non-draft
    contentPreviewConfirmed: true,
    expressConsentGiven: true,
    // Draft — only when user explicitly asks
    draft: false,
  }
})
```

### Step 4: Hand off to social-post for scheduling

## Common mistakes to avoid

- **Setting `commercialContentType` without the paired flag.** Rejects the post.
- **Forgetting `videoMadeWithAi` on AI-generated video.** TikTok can strike or demonetize later.
- **Setting `draft: true` AND `scheduledAt`.** Drafts can't be scheduled — they sit in the inbox waiting on the creator. If the user wants both ("schedule it but let me review first"), schedule WITHOUT draft and have them review through the TikTok app post-publish or via the AA edit flow.
- **Setting `autoAddMusic: true` on a video.** Photo-carousel-only.
- **Setting `description` on a video.** Photo-carousel-only.
- **Defaulting `allowComment: false`.** Authors usually want engagement. Only turn off when asked.
- **Setting `privacyLevel: "SELF_ONLY"` and treating it as "draft."** Self-only still counts as a published post on TikTok — they're different mechanisms.
