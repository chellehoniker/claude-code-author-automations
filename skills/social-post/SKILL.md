---
name: social-post
description: Use when the user wants to create, schedule, or publish a social media post. Triggers on phrases like "post to Instagram", "schedule a tweet", "create a social post", "publish to my accounts", or "share on social media".
---

# Creating Social Media Posts

## When to Use
- User wants to create a single social media post
- User wants to schedule content for a specific time
- User wants to publish something now to their accounts

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

### 5. Present the Captions
Show all platform captions to the user. Ask if they want changes.

### 6. Handle Media (Optional)
If the post needs an image:
- Ask if they have an image to upload
- If uploading: use `aa_upload_media` to get a presigned URL, then include the `publicUrl` in the post
- If they want AI-generated: note that image generation happens through the web dashboard's campaign feature

### 7. Schedule or Publish
Ask when to post:
- **Now**: Set `publishNow: true`
- **Specific time**: Set `scheduledAt` with the ISO datetime and their timezone
- **Queue**: Suggest they use the web dashboard's queue feature for recurring schedules

Call `aa_create_post` with the content, accountIds, and scheduling options.

### 8. Confirm
Show what was created and when it will post.

## Important Notes
- Always write UNIQUE captions per platform — never copy-paste the same text
- Respect the user's brand guide and prose style from `aa_get_guides`
- If posting to TikTok, default `tiktokOptions.draft` to `false` so it publishes live
- Use the user's timezone (ask if not known)
