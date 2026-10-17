---
name: boost-post
description: Use when the user wants to promote (boost) an already-published post with paid spend. Triggers on "boost this", "boost my best post", "promote this post", "put money behind", "run an ad on the launch post".
---

# Boost a published post — paid promotion

Take an already-published organic post and put paid spend behind it as an ad. **This is a real-money skill** (as is `create-meta-ad`). Treat every step as if the user's wallet were open on the desk.

> **Requires the ads upgrade.** Ads tools are a paid add-on — **$20/month**, purchasable from the dashboard — and **included in every STOS plan**. Callers without it get a 403; in that case tell the user "Boosting requires the ads upgrade — $20/month at authorautomations.social/pricing (already included if you're on a StorytellerOS plan)."

## Supported networks

Boost works on **Meta (Facebook/Instagram), TikTok, LinkedIn, Google, and Pinterest** ad accounts. Goals vary per network; budget minimums: **TikTok $20/day, Pinterest $5**. The `adAccountId` comes from `aa_list_ad_accounts` — Google/LinkedIn/Pinterest connections may return no ad accounts, in which case boosting isn't possible for that account.

**ChatGPT and Amazon can't be boosted**, because neither has an organic post to put money behind. They are still fully advertisable: both are destinations in the dashboard's one **Create ad** wizard at `/dashboard/ads/create` (goal first, then destinations, progress saved so a half-built ad resumes), and Amazon also has a dedicated chat path in the `create-meta-ad` skill (`aa_create_amazon_campaign`, then `aa_amazon_ads_campaign_state` to start it). Whichever route the author takes, campaigns are created **paused** and started **in-app**, either with that tool or the wizard's **Start these ads** button. Never point an author at a network's own ad console to switch something on.

## Three things to know about boosting

1. **Real money. Confirm explicitly.** Every boost has a compute-then-show step: `total = daily × duration_days`. Show the arithmetic. Use the verbatim confirmation gate (below) — typed "go" only, not "yes" or "ok."

2. **Default to paused state when the user is uncertain.** `aa_boost_post` creates the boost paused when you pass `status: "PAUSED"`. Only the campaign is paused; its ad set and ad are created switched on, so starting the campaign is all it takes to deliver. Start it in-app with `aa_update_ad_campaign_status` (or the dashboard's ads screen), never in Meta Ads Manager. Use paused whenever the user hasn't given firm targeting, hesitates on budget, or asks "wait, how does this work?"

3. **Pick the post BEFORE configuring spend.** If the user says "boost my best post," pull analytics first (`aa_get_analytics`), surface the top performer, and confirm the pick. Don't configure budget and targeting against the wrong post.

## Decision tree

| User says... | First step |
|---|---|
| "Boost post ID xyz" / "Promote this post [specific URL]" | `aa_list_posts` (filter to the post) → confirm pick |
| "Boost my best post from last week" | `aa_get_analytics` last 7 days → pick top by engagement → confirm pick |
| "Promote the launch post" | `aa_list_posts` filtered by recency or caption keyword → confirm pick |
| "Run an ad on Curses and Currents" | This isn't a boost — that's a fresh ad. Use `create-meta-ad` (or the dashboard's **Create ad** wizard). |
| "Boost to people interested in cozy mystery" | After post pick: `aa_search_ad_interests` for targeting |
| "Is the boost working?" / "How is the whole launch doing?" | `aa_ads_groups_rollup` for the cross-network verdict (put the boost in a group first with `aa_ads_groups_create` + `aa_ads_groups_assign`); see `create-meta-ad` for the group tools |

## Flow

### 1. Identify the post

If user gave a specific post: call `aa_list_posts` and confirm the match (caption snippet, platform, publish date).

If user said "best": call `aa_get_analytics` for the window (default last 7 days). Pick top by engagement (likes + comments + shares + saves). Show:

```
Top performer last 7 days:
  "Curses and Currents launches today! [snippet]"
  Instagram, published 2026-05-20
  Engagement: 1,247 (likes 980, comments 142, shares 87, saves 38)
```

Ask: "Is this the post you want to boost?" Wait for confirmation. Do NOT proceed to budget without an explicit pick.

### 2. Pick the ad account

Call `aa_list_ad_accounts` to show connected Meta ad accounts. If only one, use it. If multiple, ask which one — boosts hit a specific ad account's budget.

### 3. Configure audience

Ask the user:
- **Interests** — call `aa_search_ad_interests` against the user's keywords ("cozy mystery", "book lovers"). Show the top matches with audience size. User picks 1-3.
- **Age range** — default 18-65 if not stated. Ask if there's a specific range.
- **Geo** — countries or cities. Default "United States" if author is US-based and didn't say. Ask if they want international. For city/region/zip-level geo ids beyond plain country codes, `aa_search_ad_targeting` searches the platform's full targeting catalog (geo and other entity types — `aa_search_ad_interests` covers interests only).

Don't go deeper than these three on a boost — boosts aren't full campaigns. If the user wants demographic + behavioral + lookalike targeting, route them to `create-meta-ad` or the dashboard's **Create ad** wizard.

**Each network refuses some targeting.** Since October 2026 a network rejects targeting it can't use instead of ignoring it, so the server leaves those fields out for you: age and gender on Google, LinkedIn and X; languages anywhere but Meta and Google; interests on Google. If the author asked for one of those on such a network, tell them it doesn't apply there rather than implying it was used.

**Two ways to pass targeting — never both.** The `targeting` object is structured (geoLocations, interests, places, neighborhoods, `excludedLocations: { geo: [...], zips: [...] }`, ageMin/ageMax, genders). Alternatively, `rawTargeting` takes raw Meta targeting JSON pasted verbatim. They are **mutually exclusive — the server 422s if you pass both.** Use `targeting` unless the user hands you a ready-made Meta targeting spec.

### 4. Configure budget + duration

Ask separately:
- **Daily or lifetime budget?** Daily is simpler; lifetime caps total spend regardless of pacing.
- **Amount?** USD. Show minimums if the user proposes something below Meta's floor ($1/day for most ad types).
- **Duration?** Number of days the boost runs.

### 5. Compute total spend and SHOW IT

Before any confirmation, compute:

```
Daily budget × duration = total max spend
$10 × 7 days = $70 maximum
```

Surface this prominently — bold, separate line, dollar amount visible. If lifetime budget, just show the lifetime number. Don't bury it.

### 6. Confirm before firing — verbatim gate

Show the full plan in one block:

```
BOOST PLAN
  Post: "Curses and Currents launches today!" (Instagram, May 20)
  Ad account: AA Personal Ads (act_1234567890)
  Audience: Interests in "cozy mystery" + "book lovers", ages 25-55, US
  Budget: $10/day for 7 days
  TOTAL MAX SPEND: $70 over 7 days
  Initial status: ACTIVE
```

Then the AlertDialog-style gate, verbatim:

> **This will spend up to $70 over 7 days on Instagram. Type 'go' to confirm.**

If the user types anything other than "go" — including "yes", "ok", "sure", "do it" — do not fire. Ask again with the same gate. The unusual word is the safety mechanism; it forces a deliberate keystroke.

If the user hesitates, asks a question, or seems uncertain at this gate: SWITCH to paused state. Tell them "I'll create it paused so nothing spends; when you're ready, tell me to start it or press Start on the ads screen" and re-issue the gate with `status: PAUSED` in the plan.

### 7. Fire

Only after explicit "go": call `aa_boost_post` with the resolved postId, adAccountId, audience, budget, duration, and status.

### 8. Confirm + next steps

Show what was created:
- Boost ID
- Meta Ads Manager link (if the response surfaces one)
- Status (ACTIVE or PAUSED)
- "You can pause or start it from here or the ads screen. The boost runs for [duration] unless you stop it."
- A brand-new boost can take a while (often 15 minutes or more) to appear in `aa_list_ads`, `aa_get_ad` and the ad tree, so look-ups and deletes through the ads tools may say "not found" right after creating it. Wait for the next sync rather than creating it again.

## Confirm before firing

Two non-negotiable gates on every boost:
1. **Post pick** — explicit user confirmation that this is the right post.
2. **Spend** — verbatim "type 'go' to confirm" gate after computed total is shown.

Skip either gate = budget over-spend risk. Don't do it.

## Common pitfalls

- **Don't compute daily spend without showing the duration math.** "$10/day" means nothing without "$10 × 7 = $70." Always multiply for the user.
- **Don't default to ACTIVE when the user is fuzzy on details.** PAUSED is the safe default for "I think I want to boost something" energy. Active is for "I've thought about this, here's the budget."
- **Don't boost posts older than ~6 months.** Meta deprioritizes old-content boosts and the user is usually better off scheduling a fresh post via `social-post`. Warn if the post is >6 months old.
- **Don't add interest targeting blindly.** `aa_search_ad_interests` returns audience sizes — interests with <100k audience size will spend the budget fast on a narrow group; >50M will be too broad. Aim for 1-10M per interest as a starting point and tell the user the audience size.
- **Don't try to boost a draft or scheduled post.** Boost only works on already-published posts. If `aa_list_posts` shows the post as scheduled, tell the user "this hasn't published yet — boost after it goes live."
- **Don't send a button without a link.** A call-to-action needs `linkUrl`; a button on its own is dropped.
- **Don't forget `profileId`.** Posts are scoped per pen name; boosting a post from the wrong pen name's analytics gets a 404 (see `pen-names`).
