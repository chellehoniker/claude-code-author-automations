---
name: social-analytics
description: Use when the user wants to know how their social posts are performing, when to post, or which platform is working best. Triggers on "how am I doing", "what's my best time to post", "show me my numbers", "review last week", "which platform is working", "why aren't reels working".
---

# Social analytics — performance review and best-time recommendations

Pull engagement and reach numbers across the user's connected accounts, identify top + bottom performers, and surface the data-driven best time to post.

> **STOS-only.** Analytics tools require a StorytellerOS-tier subscription. Non-STOS callers get a 403; in that case tell the user "This feature is on the StorytellerOS plan — upgrade at authorautomations.social/pricing to unlock analytics."

## Three things to know about analytics

1. **Default window is the last 7 days.** If the user says "last month" or "since launch," widen the range. Don't go bigger than 90 days without warning — the response gets large and Facebook insights specifically rate-limit hard on long windows.

2. **Pen-name scoping matters.** All analytics tools accept `profileId` — without it, you get the primary pen name's numbers. If the user is asking about a specific pen name's performance, switch first via `pen-names`.

3. **Best-time data is per-platform AND per-pen-name.** `aa_get_best_time` looks at the user's own historical engagement, not platform-wide averages. New accounts with <2 weeks of post history will get low-confidence recommendations — surface that to the user.

## Decision tree

| User says... | Tool |
|---|---|
| "How am I doing" / "Show me my numbers" / "Review last week" | `aa_get_analytics` + `aa_get_daily_metrics` |
| "What's my best time to post" / "When should I post" | `aa_get_best_time` |
| "How's my Facebook page doing" / "FB page reach" | `aa_get_facebook_page_insights` |
| "Which platform is working best" | `aa_get_analytics` (group by platform) |
| "How did THIS post do day by day" | `aa_get_post_timeline` (per-post daily engagement across its platform legs) |
| "Am I gaining followers" / "follower growth" | `aa_get_follower_stats` |
| "How fast do my posts die off" / "should I recycle content" | `aa_get_content_decay` (engagement decay after publish — informs repost cadence) |
| "Am I posting enough" / "where are my gaps" | `aa_get_posting_frequency` (cadence per platform over time) |
| "Who follows me on Instagram" / "IG audience age/location" | `aa_get_instagram_demographics` (complements `aa_get_instagram_account_insights`, which covers reach/engagement) |
| "How's LinkedIn doing" / "stats on that LinkedIn post" | `aa_get_linkedin_analytics` (aggregate by default; pass a post `urn` for single-post) |
| "YouTube views per day" | `aa_get_youtube_daily_views` (if the response includes `scopeStatus.reauthorizeUrl`, the channel needs reconnecting via that URL — relay it) |
| "How are my ADS doing" | `aa_list_all_ads` / `aa_get_ads_timeline` — every connected ad network (Meta, Google, TikTok, LinkedIn, Pinterest, X, ChatGPT, Amazon) normalized in one call. Requires the ads upgrade ($20/mo, included in STOS plans). |
| "Boost my best post" | This skill picks the winner → hand off to `boost-post` |

## Flow for a performance review

### 1. Scope the window

Ask if not stated. Default to last 7 days. If the user says:
- "Last month" → 30 days
- "This quarter" → 90 days (warn about response size)
- "Since launch" → ask for a launch date

Confirm: "Looking at the last 7 days across all your accounts. Want a different window?"

### 2. Pull analytics + daily metrics together

Call `aa_get_analytics` and `aa_get_daily_metrics` for the same window — they answer different questions:
- `aa_get_analytics` — aggregate per-post engagement (impressions, likes, comments, shares, saves)
- `aa_get_daily_metrics` — day-by-day rollup so you can see momentum and weekday patterns

Pass `profileId` when scoped to a non-primary pen name.

### 3. Summarize for the user

Lead with the headline number (total impressions, total engagement). Then call out:
- **Top post by engagement** — title/caption snippet, platform, engagement count, link or post ID
- **Lowest performer** — what flopped and on which platform
- **Per-platform breakdown** — engagement rate per platform; flag if one platform is dramatically outperforming the others
- **Daily pattern** — is engagement front-loaded, building, or flat?

Keep the summary terse — 4-6 lines. Offer to dig deeper on any specific post or platform.

### 4. Best-time recommendation (optional)

If the user is reviewing performance, they're probably about to schedule something. Proactively call `aa_get_best_time` and surface the top 3 slots per platform. Frame as a recommendation, not a rule: "Your IG audience engages most on Tue/Thu 8-9pm CT — schedule the next post there if you can."

### 5. Hand off if action follows

- "Boost the winner" → `boost-post` (with the top post's ID already identified)
- "Schedule another post like that one" → `social-post` (carry the voice + format that worked)
- "Why did the bottom post flop" → just discuss — no tool, talk through caption / timing / platform-fit

## Common pitfalls

- **Don't claim trends from <2 weeks of data.** "Your Reels are underperforming" needs at least 4-5 Reels to be a real signal — otherwise it's noise. Say "early signal" or "limited data."
- **Don't compare engagement counts across platforms as if they were equivalent.** A Reel's 1000 views and a Tweet's 1000 impressions are different beasts. Compare engagement RATE (engagement ÷ impressions) when going cross-platform.
- **Don't run `aa_get_facebook_page_insights` for every analytics question.** It's a separate, slower call — only use it when the user specifically asks about Facebook Page metrics (Page reach, Page followers, Page-level video views) vs per-post FB analytics, which `aa_get_analytics` already covers.
- **Don't over-recommend best-time changes.** If the user already has a queue that's working, "post at a different time" is more disruptive than helpful. Surface the data; let them decide.
