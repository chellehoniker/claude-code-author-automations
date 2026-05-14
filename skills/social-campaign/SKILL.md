---
name: social-campaign
description: Use when the user wants to create a multi-post social media campaign, content plan, posting schedule, book launch promotion, or any sustained content strategy. Triggers on "campaign", "content plan", "a batch of posts", "book launch social", "schedule a week of content".
---

# Creating AI-Powered Social Media Campaigns

## The model — campaigns are POSTS, not days

A campaign produces a fixed **number of independent posts** — 1, 3, 7, or 14. It does NOT have a calendar, a duration, or a "day 1 / day 2" structure. Each post is a standalone item with a theme, per-platform captions, and one media item (image / video / carousel).

**Timing is the queue's job, not the campaign's.** The user configures a posting queue **per platform** — Facebook might run Mon/Wed/Fri at 8am and 2pm; Instagram might run daily at 11am, 4pm, and 7pm. Entirely the user's choice, and it varies per platform. When you schedule a campaign, each post drops into the next open slot in that platform's queue. The same N posts can drain at different rates on different platforms — that's correct; that's what queues are for. There is no "spread across days" mode and no campaign-level start date.

So: you write N posts, the user reviews them, scheduling drops them into the per-platform queues, and the queues decide when each one publishes.

## When to Use
- User wants a batch of social content (1–14 posts)
- User mentions a book launch, product launch, or promotional campaign
- User wants to batch-create and schedule social media content

## The Hybrid Model
YOU write the captions — not a server-side AI. This is better because you have the full conversation context: what book they're writing, their audience, their goals, their voice. The server handles media generation (images, videos, music) and queue-based scheduling.

## Campaign Flow

### Step 1: Understand the Objective
Ask:
- What are they promoting? (book, product, service, brand)
- How many posts? (1, 3, 7, or 14)
- Which platforms? (call `aa_list_accounts` to see what's connected)
- What type of content? (images only, full mix with carousels/videos, videos only)

Don't suggest a post count — let the user pick from 1 / 3 / 7 / 14. (They can run a 14-carousel campaign, then a separate 3-video campaign, then a 7-image one — that's the intended pattern, not one giant mixed batch.)

### Step 2: Pick the right persona

A pen name can carry MANY personas — distinct brand voices the AI can write in. Each persona has its own prose, brand, copywriting, and social-media guides. Authors who write under one pen name across multiple identities (fiction vs nonfiction, cozy mystery vs thriller, sweet vs spicy romance, mindset vs productivity coaching) keep them as separate personas.

Persona names are user-defined. The user's "default" persona — the fallback when no specific persona is named — may be called anything: `primary` is a common starter name but the user may have renamed it to `Author Brand`, `Cozy Mystery`, etc.

If the user mentions a specific voice, series, or sub-brand (*"use my Cozy Mystery voice"*, *"for my spicy romance series"*, *"write in my mindset coaching tone"*):

1. Call `aa_list_guide_sets` first to see which personas exist for the active pen name. The response includes `is_default` so you can identify the fallback.
2. Match the user's intent to a persona name (case-insensitive substring match is fine — "cozy mystery" likely matches a persona named "Cozy Mystery Series").
3. Call `aa_get_guides({ tag: "<persona-name>" })` to read that specific persona's guides.
4. Pass `guideTag: "<persona-name>"` when creating the campaign in Step 3.

If the user doesn't mention a specific voice or series, you can skip the list step and call `aa_get_guides` with no tag — it defaults to the user's default persona. For pen names with only one persona, that's the only option anyway.

If `aa_list_guide_sets` shows multiple personas and the user gave no signal, ASK: *"You have personas for [list names]. Which voice should I use for this campaign?"* — don't guess.

### Step 3: Create the Campaign Record
Call `aa_create_campaign` with:
```json
{
  "name": "Campaign name",
  "objective": "What they told you",
  "post_count": 7,
  "platforms": ["instagram", "tiktok", "facebook"],
  "content_mix": "mixed",
  "guideTag": "Cozy Mystery Series"
}
```

`post_count` is how many posts the campaign generates (1, 3, 7, or 14). `guideTag` is optional — omit it (or pass null) to use the user's default persona. When set, the server-side AI campaign-builder reads that persona's guides for every generation in this campaign and stores the choice on the campaign row so regenerations stay on the same voice.

### Step 4: Write the Content Plan
Create the full plan yourself. For each post, write:
- **theme**: Brief description of the post's content angle
- **captions**: A UNIQUE caption for EACH platform (see platform rules below)
- **imagePrompt**: Detailed description for AI image generation
- For carousels: **slideConfigs** (preferred) — array of `{ prompt, overlay? }` per slide. Each slide can carry its own short text overlay (`overlay.text`, `overlay.position` = `top|center|bottom`, `overlay.style` for an FFmpeg drawtext preset). Plan 3–10 slides telling a visual story; the dashboard's slide-count picker drives `scene_count` on the campaign.
  - Back-compat: `imagePrompts` (string array) still works — the server pads/trims to the requested slide count, but you lose per-slide overlays. Prefer `slideConfigs`.
  - Carousel strategy: by default each carousel post gets the full slide stack. For `single_repeated` carousels (one base image with the text overlays carrying the content), set `carouselImageStrategy: "single_repeated"` on the campaign and provide a single `imagePrompt` plus a `slideTexts` array — don't fake it with a one-slide carousel.
- For videos: **videoPrompt** (camera motion) + **musicPrompt** (audio mood) + **videoDuration** (5/10/20/30/60 s; >10s chains multiple FFmpeg-concat'd clips). Music caps at 30s per clip and FFmpeg loops it under longer videos automatically.
- **contentType**: "image", "carousel", or "video"
- **providerOverrides** (optional): per-post generator override shaped `{ image?: { provider, model }, video?: {...}, music?: {...} }`. Wins over the campaign-level + pen-name defaults. Use when one or two posts deserve a different model — e.g., default to fal.ai/SDXL for cost but use Gemini's `gemini-3-pro-image-preview` for the cover-reveal post.

If the user has their own image/video for a particular post, skip the AI prompts for that post and have them upload via `aa_upload_media`; pass the resulting `publicUrl` into the post's plan. The review screen has an "Upload my own" affordance for this.

Vary tone, hook technique, and intensity across the posts — they should not all read in the same register, and any one of them could be the first one a reader sees. Don't repeat themes. Each post should feel fresh but connected to the campaign's objective.

### Step 5: Present for Review
Show the user the plan post by post. For each post show:
- The theme
- Each platform's caption
- The image prompt
- Content type

Ask: "How does this look? Want me to adjust any post?"

### Step 6: Save the Plan
Once approved, call `aa_save_campaign_plan` with the campaignId and plan array.

### Step 7: Generate Media
Call `aa_generate_media` with the campaignId.
Poll `aa_check_media_status` every 30 seconds until complete.
Report progress: "4 of 7 images generated..."

**Multi-provider routing.** The server resolves which provider to use per task type at job start, in this priority order:
1. The post's `providerOverrides` (set in Step 4) wins for that post.
2. The campaign's `image_provider` / `video_provider` / `music_provider` columns win next.
3. The pen name's defaults from Settings → AI win last.

Available providers: **Magnific** (default), **fal.ai** (image/video/music — broad model catalog including SDXL, Flux, Kling, Seedance, DiffRhythm), **Google Gemini** (image only — Nano Banana, gemini-3-pro-image-preview).

For video posts, the server automatically:
1. Generates a still image from the imagePrompt via the resolved image provider
2. Generates video from the still via the resolved video provider (image-to-video)
3. Generates AI music from the musicPrompt via the resolved music provider
4. **Composites the video and music together** using FFmpeg into a single MP4 file
5. Uploads the final composite to media storage

The user will see the complete video with music in the finalize/review step. Videos take 2-3 minutes each due to the multi-step pipeline.

**Per-post failure handling.** If a post's media gen fails (rate limit, model 4xx, expired key), the per-post `last_error` field captures the specific reason and the dashboard's post card surfaces it (e.g., "Image 1080x1350: fal.ai API error 401: Invalid API key"). The user can then either:
- Skip that post (the dashboard's skip affordance — sets `contentType: "skipped"`),
- Re-run with a different provider (via the per-post "Regenerate with…" picker on the post card, which writes `provider_overrides` for just that post), OR
- Upload their own media for that post.

When polling and reporting progress, surface the `last_error` for any failed post so the user knows which posts need attention rather than waiting for the whole batch to drag on retries.

### Step 8: Schedule
There is only one scheduling mode: the posts drop into the user's **per-platform queues**, and each queue decides when its posts publish. There is no campaign start date and no per-post times — if the user asks for those, explain that timing lives in their queue settings (`aa_list_queues` / `aa_update_queue`, or the dashboard's Queue page).

If the user has no queue configured, tell them to set one up first (`aa_create_queue` or the dashboard's Queue page) — otherwise the posts wait until slots exist.

Call `aa_schedule_campaign` with:
```json
{
  "campaignId": "...",
  "timezone": "America/Chicago",
  "accountMap": { "instagram": "acc_id", "tiktok": "acc_id" }
}
```

### Step 9: Confirm
Tell them how many posts were dropped into their queues. The queues decide when each one publishes — point them at the dashboard's Queue page (or `aa_list_queues`) to see or adjust the cadence per platform.

## Platform Caption Rules
- **Instagram**: Storytelling hook, 5-10 hashtags, CTA. Up to 2,200 chars.
- **TikTok**: Punchy hook, trending language, under 150 chars.
- **Facebook**: Conversational, ask questions, personal tone.
- **LinkedIn**: Professional, thought leadership, value-driven.
- **Twitter/X**: Under 280 chars, punchy, 1-2 hashtags.
- **Pinterest**: Keyword-rich for search discovery.
- **Threads**: Casual, community-focused, under 500 chars.

## Platform options per post (read these specialist skills if a post's plan needs them)

A campaign can mix Reels, Stories, and feed posts across its posts. When a post's plan triggers a richer set of options, delegate to the right specialist skill rather than embedding the rules here:

- **Instagram Reels / Trial Reels / Stories** → `instagram-reels` skill. Trial Reels (`trialParams.graduationStrategy: 'SS_PERFORMANCE'` for set-and-forget, `'MANUAL'` for author-controlled) are particularly effective for indie author promo right now. Use them on launch-tease posts where you want non-follower reach first.
- **Threads topics** → `threads-post` skill. If the campaign has a hashtag like `#BookThreads` running through it, set `threadsOptions.topicTag` to match so each Threads post files under the same topic.
- **YouTube videos / Shorts** → `youtube-video` skill. Title is required per video (1–100 chars, separate from caption). For AI-generated video posts, set `containsSyntheticMedia: true`.
- **Reddit cross-posts** → `reddit-post` skill. Each subreddit has its own flair conventions; Reddit posts in a campaign typically go once per subreddit, not as a mass blast.
- **TikTok with drafts, brand partnerships, or AI-generated video** → `tiktok-post` skill. If the campaign uses AI-generated video for any TikTok post, set `videoMadeWithAi: true`. If the user is promoting their own book/brand, set `commercialContentType: "brand_organic"` + `isBrandOrganicPost: true` — the pair is required.
- **LinkedIn with external URLs or PDF posts** → `linkedin-post` skill. The 40–50% reach penalty on caption-URLs applies per post, not per campaign — every LinkedIn post in a campaign with a link should put the URL in `firstComment`. Set this once at the campaign level via `platform_options.linkedin.firstComment` and it applies to every post.

For campaign-level platform options (apply identically to every post in the campaign), the Campaigns UI also exposes:
- TikTok: `draft`, `commercialContentType` + paired flag, `description` (long-form for photo carousels)
- Facebook: `draft`, `firstComment`, Reel `title`
- Instagram: `firstComment`
- LinkedIn: `firstComment`
- YouTube: `firstComment`
- Twitter: `longVideo` (X Premium amplify_video)
- Pinterest: `link` (destination URL on every pin)

Set them on the campaign once instead of repeating per-post.

For a Reel post specifically: when planning the imagePrompt for a Reel, also plan the **cover image** prompt — the cover is what shows in the user's feed before the video plays, so it needs to stop the scroll. Generate the cover via the resolved image provider (Magnific / fal.ai / Gemini per the user's settings; you can force a specific provider for that post's cover with `providerOverrides.image`) and pass the public URL as `instagramOptions.coverImage` when scheduling.

## Campaign Arc Strategies
The posts publish in the order the queue drains them, so think of the plan as a sequence even though there's no calendar. For a book launch with, say, 14 posts:
1. **Tease** (first ~quarter): Behind-the-scenes, mood boards, character hints
2. **Build** (next ~quarter): Cover reveal, excerpt, author's note
3. **Launch** (middle): Release announcement, links, reviews
4. **Sustain** (final third): Reader reactions, bonus content, next steps

Scale the proportions to whatever post count the user picked — a 3-post campaign is one tease, one launch, one follow-up.

For ongoing branding:
- Mix value posts (tips, insights) with personality posts (behind-the-scenes)
- Every 3rd–4th post should have a call to action
- Use carousels for educational content, videos for personality content

## Important
- NEVER reuse the same caption across platforms
- Respect the user's guides — match their voice exactly
- Write image prompts that are specific and detailed
- For video posts, describe the motion (zoom, pan, cinematic) and the music mood
- Never talk about campaign "days" or "duration" — campaigns generate N posts; the queue handles timing
