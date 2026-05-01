---
name: social-post
description: Use when the user wants to create, schedule, or publish a social media post. Triggers on "post to instagram", "schedule a tweet", "create a social post", "publish to my accounts", "share on social media", "post on tiktok", "schedule content".
---

# Creating Social Media Posts

## When to Use
- User wants to create a single social media post
- User wants to schedule content for a specific time
- User wants to publish something now to their accounts

This is the **orchestrator**. It handles the universal flow: read guides, list accounts, write captions, schedule. When the user wants platform-specific richness (Trial Reels, Threads topics, YouTube titles, etc.), delegate the relevant `*Options` block to a specialist skill, then come back here for scheduling.

## Platform routing — when to delegate

| User says... | Use this skill... |
|---|---|
| "Trial Reel," "post a Reel," "Story for IG," "Reel cover" | `instagram-reels` |
| "Threads topic," "thread chain on Threads" | `threads-post` |
| "YouTube video," "schedule a YT Short," "playlist" | `youtube-video` |
| "Reddit," "r/<subreddit>," "post to subreddit" | `reddit-post` |
| Generic "post to <platform>" with no special features | Stay here |

The specialist skills write the `*Options` block. This skill takes that block, adds scheduling, and calls `aa_create_post`.

## Flow

### 1. Understand What to Post
Ask what they want to post about. If they're working on a project (book, article, product), use that context.

### 2. Read Their Guides
Call `aa_get_guides` to get their brand voice, prose style, and social media strategy. Use these to match their tone.

### 3. Get Their Accounts
Call `aa_list_accounts` to see which platforms they have connected.

### 4. Write Platform-Specific Captions
Write a DIFFERENT caption for each platform. Follow these rules:
- **Instagram**: Engaging hook, storytelling, 5-10 relevant hashtags, call to action. Up to 2,200 chars.
- **TikTok**: Short punchy hook, trending language, under 150 chars. Direct and energetic.
- **Facebook**: Conversational, ask a question to drive engagement. Personal tone.
- **LinkedIn**: Professional thought leadership angle. Value-driven. No hashtag spam.
- **Twitter/X**: Under 280 chars. Punchy, with 1-2 hashtags max.
- **Pinterest**: Keyword-rich description optimized for search.
- **Threads**: Casual, community-focused. Under 500 chars.
- **Bluesky**: Conversational, authentic. Under 300 chars.
- **YouTube**: This becomes the description. Title is separate (use `youtube-video` skill).
- **Reddit**: This becomes the body. Title is separate (use `reddit-post` skill).

### 5. Delegate platform-specific options if needed

If any selected account is Instagram and the user mentioned Reels/Stories/Trial Reels/cover — defer to `instagram-reels`.
If any selected account is Threads and the user mentioned topic tags or thread chains — defer to `threads-post`.
If any selected account is YouTube — defer to `youtube-video` (title is required).
If any selected account is Reddit — defer to `reddit-post` (subreddit + title are required).

The specialist skill writes the right `*Options` block; you carry it through into the `aa_create_post` call.

### 6. Present the Captions
Show all platform captions to the user. Ask if they want changes.

### 7. Handle Media (Optional)
If the post needs an image:
- Ask if they have an image to upload
- If uploading: use `aa_upload_media` to get a presigned URL, then PUT the file bytes to `uploadUrl` and use the `publicUrl` in the post
- If they want AI-generated: route them through the campaign-style image flow (Freepik via `aa_generate_media` on a one-day campaign), then use the resulting `publicUrl` here
- Pass `width` and `height` on each `mediaItem` when known — the server uses this to pre-flight Instagram aspect ratios without an extra fetch

### 8. Upload egress troubleshooting

The `aa_upload_media` step PUTs file bytes directly to the storage CDN (`*.r2.cloudflarestorage.com`). If the user's sandbox blocks that host (common in Claude Cowork's default network egress settings), the PUT silently fails.

If the user reports the upload "hangs" or "doesn't work," tell them:
> "The upload step needs network egress to the storage CDN. In Claude Cowork: **Settings → Capabilities → Allow Network Egress** should be ON, set to 'All Domains' (R2 uses subdomains, so a single-domain allowlist won't catch it)."

### 9. Schedule or Publish

Ask when to post:
- **Now**: Set `publishNow: true`
- **Specific time**: Set `scheduledAt` with the ISO datetime and their timezone
- **Queue**: Suggest the web dashboard's queue feature for recurring schedules

Call `aa_create_post` with the content, accountIds, scheduling options, and any platform `*Options` blocks the specialist skills wrote.

### 10. Confirm
Show what was created and when it will post.

## Important Notes
- Always write UNIQUE captions per platform — never copy-paste the same text
- Respect the user's brand guide and prose style from `aa_get_guides`
- If posting to TikTok, default `tiktokOptions.draft` to `false` so it publishes live (the server already handles this)
- Use the user's timezone (ask if not known)
- For platforms with rich options (IG/Threads/YT/Reddit), let the specialist skills do their job — they catch validation issues locally and avoid round-trips to the upstream API
