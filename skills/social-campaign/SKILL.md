---
name: social-campaign
description: Use when the user wants to create a multi-day social media campaign, content plan, posting schedule, book launch promotion, or any sustained content strategy. Triggers on "campaign", "content plan", "30 days of posts", "book launch social", "schedule a week of content".
---

# Creating AI-Powered Social Media Campaigns

## When to Use
- User wants a multi-day content plan (1-30 days)
- User mentions a book launch, product launch, or promotional campaign
- User wants to batch-create and schedule social media content

## The Hybrid Model
YOU write the captions — not a server-side AI. This is better because you have the full conversation context: what book they're writing, their audience, their goals, their voice. The server handles media generation (images, videos, music) and scheduling.

## Campaign Flow

### Step 1: Understand the Objective
Ask:
- What are they promoting? (book, product, service, brand)
- How many days? (1, 3, 7, 14, or 30)
- Which platforms? (call `aa_list_accounts` to see what's connected)
- What type of content? (images only, full mix with carousels/videos, videos only)

### Step 2: Read Their Guides
Call `aa_get_guides` to get their brand voice, writing style, and social strategy. Read all guides carefully before writing any captions.

### Step 3: Create the Campaign Record
Call `aa_create_campaign` with:
```json
{
  "name": "Campaign name",
  "objective": "What they told you",
  "duration_days": 7,
  "platforms": ["instagram", "tiktok", "facebook"],
  "content_mix": "mixed"
}
```

### Step 4: Write the Content Plan
Create the full plan yourself. For each day, write:
- **theme**: Brief description of the day's content angle
- **captions**: A UNIQUE caption for EACH platform (see platform rules below)
- **imagePrompt**: Detailed description for AI image generation
- For carousels: **imagePrompts** array (3-5 slide descriptions telling a visual story)
- For videos: **videoPrompt** (camera motion) + **musicPrompt** (audio mood)
- **contentType**: "image", "carousel", or "video"

Build narrative momentum across the days. Don't repeat themes. Each day should feel fresh but connected to the campaign arc.

### Step 5: Present for Review
Show the user the plan day by day. For each day show:
- The theme
- Each platform's caption
- The image prompt
- Content type

Ask: "How does this look? Want me to adjust any day's content?"

### Step 6: Save the Plan
Once approved, call `aa_save_campaign_plan` with the campaignId and plan array.

### Step 7: Generate Media
Call `aa_generate_media` with the campaignId.
Poll `aa_check_media_status` every 30 seconds until complete.
Report progress: "4 of 7 images generated..."

For video posts, the server automatically:
1. Generates a still image from the imagePrompt
2. Generates video from the still using Kling AI (image-to-video)
3. Generates AI music from the musicPrompt
4. **Composites the video and music together** using FFmpeg into a single MP4 file
5. Uploads the final composite to media storage

The user will see the complete video with music in the finalize/review step. Videos take 2-3 minutes each due to the multi-step pipeline.

### Step 8: Schedule
Ask when they want the campaign to start and how to schedule:
- **Spread**: One post per day at a set time
- **Queue**: Fill their existing queue slots
- **Custom**: Multiple times per day

Call `aa_schedule_campaign` with:
```json
{
  "campaignId": "...",
  "startDate": "2026-03-25",
  "timezone": "America/Chicago",
  "scheduleMode": "spread",
  "accountMap": { "instagram": "acc_id", "tiktok": "acc_id" },
  "postTimes": ["10:00", "14:00"]
}
```

### Step 9: Confirm
Tell them how many posts were scheduled and when the first one goes out.

## Platform Caption Rules
- **Instagram**: Storytelling hook, 5-10 hashtags, CTA. Up to 2,200 chars.
- **TikTok**: Punchy hook, trending language, under 150 chars.
- **Facebook**: Conversational, ask questions, personal tone.
- **LinkedIn**: Professional, thought leadership, value-driven.
- **Twitter/X**: Under 280 chars, punchy, 1-2 hashtags.
- **Pinterest**: Keyword-rich for search discovery.
- **Threads**: Casual, community-focused, under 500 chars.

## Platform options per day (read these specialist skills if a day's plan needs them)

A campaign can mix Reels, Stories, and feed posts across days. When a day's plan triggers a richer set of options, delegate to the right specialist skill rather than embedding the rules here:

- **Instagram Reels / Trial Reels / Stories** → `instagram-reels` skill. Trial Reels (`trialParams.graduationStrategy: 'SS_PERFORMANCE'` for set-and-forget, `'MANUAL'` for author-controlled) are particularly effective for indie author promo right now. Use them on launch-tease days where you want non-follower reach first.
- **Threads topics** → `threads-post` skill. If the campaign has a hashtag like `#BookThreads` running through it, set `threadsOptions.topicTag` to match so each day's Threads post files under the same topic.
- **YouTube videos / Shorts** → `youtube-video` skill. Title is required per video (1–100 chars, separate from caption). For AI-generated video days, set `containsSyntheticMedia: true`.
- **Reddit cross-posts** → `reddit-post` skill. Each subreddit has its own flair conventions; Reddit days in a campaign typically post once per subreddit, not as a mass blast.

For a Reel day specifically: when planning the imagePrompt for a Reel, also plan the **cover image** prompt — the cover is what shows in the user's feed before the video plays, so it needs to stop the scroll. Generate the cover via Freepik and pass the public URL as `instagramOptions.coverImage` when scheduling.

## Campaign Arc Strategies
For a book launch:
1. **Tease** (days 1-3): Behind-the-scenes, mood boards, character hints
2. **Build** (days 4-7): Cover reveal, excerpt, author's note
3. **Launch** (days 8-10): Release announcement, links, reviews
4. **Sustain** (days 11+): Reader reactions, bonus content, next steps

For ongoing branding:
- Mix value posts (tips, insights) with personality posts (behind-the-scenes)
- Every 3rd-4th post should have a call to action
- Use carousels for educational content, videos for personality content

## Important
- NEVER reuse the same caption across platforms
- Respect the user's guides — match their voice exactly
- Write image prompts that are specific and detailed
- For video days, describe the motion (zoom, pan, cinematic) and the music mood
