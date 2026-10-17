---
name: create-meta-ad
description: Use when the user wants to build a fresh paid ad from scratch (Meta, Amazon Sponsored Products, TikTok, LinkedIn, Google, Pinterest, X or ChatGPT) rather than promoting an existing post, or wants to group ads together and see whether the spend is working. Triggers on "create an ad", "build a Meta ad from scratch", "I want to advertise X", "design an ad campaign", "create a Facebook ad", "advertise my book on Amazon", "Amazon ads", "Sponsored Products", "set up an ASIN ad", "negative keywords", "start these ads", "group my ads", "campaign group", "is my launch working across all the ads".
---

# Create a standalone Meta ad — Facebook + Instagram, real money

Build a Facebook or Instagram ad from scratch — campaign + ad set + creative in one flow. This spends real money against the user's connected Meta ad account.

If the user wants to **promote an existing post** (boost it), STOP and route to the `boost-post` skill instead — that flow is simpler and reuses the post's media + caption.

## Quick facts

- **Requires the ads upgrade** — a paid add-on at **$20/month**, included in every STOS plan. Callers without it get a 403; point them at authorautomations.social/pricing.
- **Pen-name-scoped.** Every tool here takes `profileId`. Switch via `pen-names` first if a specific pen name was mentioned and carry the resolved `profileId` through every call.
- **Defaults to PAUSED.** Always create with `extra: { status: "PAUSED" }` (uppercase, inside `extra`). The user explicitly launches afterward.
- Confirm before `aa_create_standalone_ad` with an AlertDialog-style prompt: "This will create a paused ad with up to $X potential spend. Type 'go'."
- **Not just Meta anymore.** `aa_create_standalone_ad` also creates on TikTok (all goals; min $20 budget; `imageUrl` may be a video URL), LinkedIn (all goals except app_promotion), Google (goals engagement/traffic/awareness/video_views; `campaignType` display|search, keywords, businessName, longHeadline; headline max 30 / body max 90 chars), and Pinterest (same 4 goals; optional boardId; headline max 100 / body max 500; $5 min). This skill's wizard is Meta-first, but the same gates (paused default, spend confirm) apply on every network.
- **Ads start IN-APP, never in a network's own console.** Nothing spends until it's switched on from inside Author Automations. Meta, TikTok, LinkedIn and Amazon ads are created paused; Google, Pinterest and ChatGPT have no paused state, so the wizard doesn't create them until Start. Either way it's started here: `aa_amazon_ads_campaign_state` for an Amazon campaign, the dashboard's **Start these ads** button for a wizard run. Never send the user to Meta Ads Manager, Amazon's campaign manager, or any other native console to turn an ad on.
- **One wizard, many destinations.** The dashboard has a single goal-first **Create ad** wizard at `/dashboard/ads/create`: pick the goal, pick the destinations, and each destination gets its own campaign and its own budget. Progress saves as the author advances, so a half-built ad is resumable from where they stopped. Point users there when they would rather click than describe. It creates ads on Meta, TikTok, LinkedIn, Amazon, Google, Pinterest and ChatGPT. **X is listed but can't be created from here yet**, so don't promise it. Meta, TikTok, LinkedIn and Amazon are created **paused** and switched on with **Start these ads**. Google, Pinterest and ChatGPT have no paused state, so nothing is created on those until **Start these ads** is pressed; the wizard says so on the budget step.

## Decision tree

| User says... | Tool / skill |
|---|---|
| "What ad accounts do I have" | `aa_list_ad_accounts` |
| "Find interests for 'cozy mystery readers'" | `aa_search_ad_interests` |
| "What's the engagement benchmark for romance ads" | `aa_get_analytics` |
| "Boost my last Instagram post" / "promote that reel" | **`boost-post` skill (NOT this one)** |
| "Build me an ad for my new book" / "Create a Facebook ad from scratch" | `aa_create_standalone_ad` (this skill) |
| "Advertise my book on Amazon" | `aa_amazon_ads_status` to find the advertiser profile, then `aa_create_amazon_campaign` (Amazon section below) |
| "Start the ads you just made" / "Turn it on" | `aa_amazon_ads_campaign_state` for Amazon, or the dashboard's **Start these ads** button. Never a native ad console. |
| "Group these ads together" / "How is the launch doing across everything" | `aa_ads_groups_create` + `aa_ads_groups_assign`, then `aa_ads_groups_rollup` (Campaign groups below) |

## Five-step flow — mirrors the dashboard wizard

### Step 1: Objective

Ask which objective. Options + when to pick each:

- **Engagement** — likes/comments/shares on the ad creative. Good for awareness on a single piece of content.
- **Traffic** — drive clicks to a URL (book sales page, landing page, newsletter signup). The most common objective for authors.
- **Awareness** — maximize reach (impressions). Cheapest CPM but lowest action rate. Pick when the user explicitly says "I just want eyeballs."
- **Video views** — optimize for ThruPlay / 15s view. Use only with video creative.
- **Lead gen** — Meta's in-platform lead form. Create the form first with `aa_create_lead_form` (or pick an existing one from `aa_list_lead_forms`), then pass `extra: { goal: "lead_generation", leadGenFormId: "<form id>" }`. Use `leadGenFormId` inside `extra`; the top-level `leadFormId` parameter isn't translated and the form would be missing.
- **Conversions** — optimize for a pixel event (purchase, signup). Requires Meta pixel installed on the destination site.

Capture as `objective`. If the user is vague ("I just want more book sales"), default to **Traffic** with their book sales URL.

### Step 2: Creative

**Draft with AI — the Creative Studio.** If the user doesn't have creative ready, the studio builds it (all pen-name-scoped, results land in a shared creative library):

- `aa_generate_ad_copy` — hooks + body copy for a book (bookId from their library OR an inline `book` object for titles outside it), style angle (`clean` / `promotional` / `hook` / `hook-high-stakes` / `mockup` / `reviews`), 1–6 variations. Two steering params are worth reaching for:
  - `directive` (up to 2,000 characters): the campaign objective in the author's own words. Every variation has to serve it, so "we are pushing the 99c sale through Sunday" belongs here, not in the style angle.
  - `hooks` (up to 6 headlines, each up to 160 characters): pre-approved headlines the copy must build on. You get **one variation per hook, in the order given**, which makes this the right tool when the author already has lines they like and wants body copy built around each one. Use `hooks` when the headlines are settled, `count` when you want the model to propose them.

  Runs on the user's own text-LLM key. `ai_settings_required` / `ai_key_missing` means point them at Settings → AI Providers.
- `aa_generate_ad_creative` — ad IMAGES: pick the style, 1–3 formats, 1–6 variations per format; feed in the copy pass's hook/adBody/scenePrompt. There are five formats: `ad_square` 1:1, `ad_portrait` 4:5, `ad_story` 9:16, **`ad_landscape` 1.91:1** (link cards, Google Display, Amazon custom images) and **`ad_pin` 2:3** (Pinterest's native shape). Match the format to where the ad will actually run; a 9:16 story crops badly in a feed and a square wastes half a Pinterest slot. **Images can run on the included tier, 12 generations/day, with no image-provider key on file.**
- `aa_generate_ad_video` — short ad VIDEO (9:16 or 16:9, optional verbatim-spoken voiceoverScript, opens on the book cover by default). **User-key-only** — video is priced per second, no included tier.
- `aa_list_ad_creatives` — browse the library (includes the included-tier allowance `{ used, limit }`); `aa_save_ad_carousel` assembles 2–10 square images into an ordered carousel for carousel placements.
- `aa_draft_ad_campaign` — drafts a FULL campaign (validated audiences with interests checked against the live catalog, hooks, conservative budget suggestion, objective) as a reviewable draft. **Never creates an ad, never spends** — show it to the user, then build for real with `aa_create_standalone_ad` once approved.

If the user brings their own creative, capture:

- `headline` — short text shown above the ad, ≤ 40 chars works best
- `primaryText` — main body copy, the "caption" of the ad
- `imageUrl` OR `videoUrl` — the visual. If the user has a file rather than a URL, route through the standard `aa_upload_media` flow first to get a `publicUrl`.
- `linkUrl` — the destination URL (where the click goes). Required for Traffic/Conversions; recommended for everything except Awareness.
- `cta` — the button label. Meta-defined enum: `LEARN_MORE`, `SHOP_NOW`, `SIGN_UP`, `DOWNLOAD`, `GET_OFFER`, `WATCH_MORE`, etc. Default `LEARN_MORE` if unsure.

### Step 3: Audience

Capture:

- `age` — `{ min, max }`. Default `18–65` if not specified.
- `gender` — `"all"` | `"male"` | `"female"`. Default `"all"`.
- `geo` — list of country codes (`["US", "CA", "GB"]`) or city-level targets. Ask if not stated.
- `interests` — use `aa_search_ad_interests({ accountId, q, profileId? })` to resolve user intent ("cozy mystery readers") into Meta interest IDs. Pick 3–8 relevant ones; too few = too narrow, too many = too diffuse.
- `advantageAudience: boolean` — Meta's auto-expansion. Default `true` for new accounts (Meta's targeting often outperforms manual constraints), `false` if the user has a strong opinion about hard constraints.

For geo/entity ids beyond plain interests (cities, regions, zips), `aa_search_ad_targeting` searches the platform's full targeting catalog. On the tool call itself: the structured `targeting` object (geoLocations, interests, places, neighborhoods, `excludedLocations: { geo, zips }`, ageMin/ageMax, genders) and `rawTargeting` (raw Meta targeting JSON) are **mutually exclusive — pass one or the other, never both (the server 422s).**

### Step 4: Budget

Capture:

- `budgetType` — `"daily"` or `"lifetime"`. Daily is safer for new ads (caps spend per day); lifetime is fine for time-boxed launches.
- `amount` — in dollars (or the ad account's currency). Server converts to cents.
- `duration` — number of days the ad runs. Required for lifetime, optional for daily (but ALWAYS ask — open-ended daily ads burn money unnoticed).
- `bidStrategy`:
  - `LOWEST_COST_WITHOUT_CAP` — **safe default.** Meta optimizes spend with no cap.
  - `COST_CAP` — caps cost per result. Requires `bidAmount` (max cost per result in dollars).
  - `LOWEST_COST_WITH_BID_CAP` — caps the bid in the auction. Requires `bidAmount`.
  - `LOWEST_COST_WITH_MIN_ROAS` — only valid for Conversions objective with purchase events. Requires `roasAverageFloor` (decimal, e.g. `2.5` = 2.5x return floor).

If the user picks a strategy that needs `bidAmount` or `roasAverageFloor` and didn't supply it, ASK before proceeding.

Compute **total potential spend** for the recap: `daily × duration` (or just `lifetime amount`). This is the number you echo in the confirmation.

### Step 5: Review + confirm + create

Recap the full ad in plain language:

> "Objective: Traffic. Creative: 'Bookstore witches solve cozy crimes' with image + Learn More button → yourbook.com. Audience: women 25–55, US/CA/UK, cozy-mystery interests (8 selected). Budget: $20/day for 7 days = **$140 potential spend**. Status: paused."

Then fire the AlertDialog-style confirmation:

> "This will create a paused ad with up to **$140** potential spend. Type 'go' to confirm."

Only if the user types "go" (or unambiguous affirmative — "yes", "confirm", "do it"), call `aa_create_standalone_ad` with:

```js
aa_create_standalone_ad({
  profileId: "...",       // from pen-names if non-primary
  accountId: "...",       // the connected social account, from aa_list_accounts
  adAccountId: "...",     // from aa_list_ad_accounts
  targeting: { ageMin, ageMax, gender, countries, interests },
  extra: {
    name: "...",
    goal: "traffic",
    status: "PAUSED",
    headline: "...", body: "...", imageUrl: "...", linkUrl: "...", callToAction: "LEARN_MORE",
    budgetAmount: 20, budgetType: "daily",   // lifetime budgets also need endDate
    startDate: "2026-11-01", endDate: "2026-11-07"
  }
})
```

Put the fields in this recipe inside `extra`, flat, exactly as named above: `extra` is forwarded as-is, and nothing translates nested `creative` or `budget` objects into these fields, so a nested shape can produce an ad without its copy, budget or paused status. (`rawTargeting` is still a supported alternative to `targeting`.) Check the returned status says paused before telling the author.

### After create

Tell the user:

> "Created paused. Total potential spend if launched: $140. Nothing is spending yet. Say the word and I'll start it, or hit **Start these ads** on the dashboard's ads screen."

Do NOT launch automatically. Launching is a separate explicit step the user takes, and it happens in the app: `aa_amazon_ads_campaign_state` for Amazon or the dashboard's Start button for everything else. Don't hand the author off to a native console.

## Amazon Sponsored Products

Amazon is no longer reporting-only. A full campaign can be built and started from here.

1. `aa_amazon_ads_status` lists the connected Amazon Ads account and its **advertiser profiles**. Each marketplace (US, UK, DE) is its own profile with its own currency, so the author has to pick one. Its id is `amazonProfileId` on every call below.
2. `aa_amazon_ads_brands({ amazonProfileId })` lists the registered brands the profile can advertise under, plus that brand's logo images when you pass `brandId`. An empty list simply means the profile is not in Amazon Brand Registry. Read-only, nothing is created and no money moves.
3. `aa_create_amazon_campaign` builds campaign, ad group, product ad, keywords and negative keywords in one chain:
   - `campaignType` is `sp` (Sponsored Products, the default) or `sb` (Sponsored Brands, the headline-and-logo ad; needs a registered brand from step 2). For Sponsored Brands with its full options use `aa_amazon_ads_create_sb`, and for Sponsored Display `aa_amazon_ads_create_sd`. Same rules for every type: created paused, started in-app.
   - `asin` is the 10-character ASIN of the book being advertised. Take it from the book's real listing. **Never guess an ASIN**: a wrong one advertises somebody else's book with the author's money.
   - `targetingType` is `auto` (Amazon finds readers from the listing) or `manual` (the author supplies `keywords`, up to 100, each with `matchType` exact / phrase / broad and an optional `bid`). Auto is the honest default for a first campaign.
   - `negativeKeywords` (up to 100, each `{ text, matchType }` with matchType `exact` or `phrase`) are the searches the ad must NOT show for. These work with auto AND manual targeting, and they are the cheapest waste-cutter on Amazon. Offer them every time: the author's own other-genre titles, "free", a competitor they don't want to pay to sit beside.
   - `dailyBudget` has a $1 minimum, in the advertiser profile's currency. `bid` sets the ad group's default cost per click.
   - The campaign is **always created PAUSED**, whatever the author says. It starts in-app, never in Amazon's console.
4. `aa_amazon_ads_campaign_state({ campaignId, amazonProfileId, state })` is the in-app Start / Pause. `ENABLED` begins spending the daily budget immediately, so confirm the dollar figure with the author first, exactly like a standalone ad.
5. Reporting: `aa_amazon_ads_campaigns` for per-campaign spend / sales / ACOS, `aa_amazon_ads_pnl` for ad-attributed profit and loss, `aa_amazon_ads_sync_now` to pull fresh reports. Amazon generates reports asynchronously, so numbers can take minutes to land.

## Campaign groups: one label across every network

An author who is launching a book usually runs Meta, Amazon and TikTok at once and wants one answer: is this launch working? Campaign groups give them that.

- `aa_ads_groups_create({ name, ... })` makes the label ("Curses launch Sep 26"). Set the author's own target with `targetMetric` (`roas` / `acos` / `cpc`) plus a positive `targetValue`; pass both or neither. `breakEvenRoas` is the fallback rule when there's no target ("I need 1.8x to break even"). `startedOn` (YYYY-MM-DD) overrides the seven-day "too early to judge" clock. Names are unique per pen name, case-insensitive, so a duplicate answers 409.
- `aa_ads_groups_list` shows the groups with their targets, break-even and member counts.
- `aa_ads_groups_assign({ id, assign, unassign })` moves campaigns in and out, up to 200 refs per call. A ref is `{ network, campaignId }` from `aa_list_all_ads`. **A campaign belongs to exactly one group at a time** so spend is never double-counted; assigning one that already sits in another group answers 409, and you unassign it there first.
- `aa_ads_groups_update` renames a group or changes its verdict rules. Pass `targetMetric` and `targetValue` both as null to clear the target.
- `aa_ads_groups_rollup({ window })` is the goal-to-result view: cross-network spend, reported revenue, ROAS, clicks, CPC, budget per day, per-platform chips, mapped books, member campaigns, and a **verdict** of `winning` / `watch` / `losing` / `too_early` / `no_data` with the reason. It also returns the Ungrouped bucket with name-match suggestions, and the same window's campaigns and accounts, so you rarely need a second fetch. `window` is `7d`, `30d` (default), `90d` or `lifetime` (capped at the 90 days the networks report).

Verdicts wait seven days before judging, measure against the author's target first and the group's break-even ROAS second, and say `no_data` honestly rather than inventing a conclusion. Repeat that honesty when you report: if the rollup says `too_early`, tell the author it's too early.

## Confirm before firing — spend actions

- **`aa_create_standalone_ad`** — always fire the AlertDialog confirm with the dollar amount.
- **Launching** a paused ad — separate confirm: "Launching this ad starts spending against your Meta ad account immediately, up to $X. Proceed?"
- **Raising budget** on a live ad — confirm with the delta: "Increasing daily budget from $20 to $50 = additional $210 over the remaining 7 days. Proceed?"
- **`aa_create_amazon_campaign`**: confirm the ASIN, the marketplace, and `dailyBudget x days` before firing, then say plainly that it lands paused.
- **`aa_amazon_ads_campaign_state` with `ENABLED`**: this is the moment money starts moving on Amazon. Confirm the daily budget out loud first.

## Common pitfalls

- **Routing a boost-post request here.** "Promote my last reel" = `boost-post` skill, NOT this one. Ask "is this a fresh ad or a boost of an existing post?" if it's ambiguous.
- **Skipping the duration on daily budgets.** A $20/day ad with no end date is open-ended spend. Always set a duration or surface that risk.
- **Forgetting `bidAmount` / `roasAverageFloor`.** The non-default bid strategies REQUIRE these. The API 422s without them.
- **Auto-launching.** Create paused wherever the network allows it, and never press Start (or create a no-paused-state destination) without the spend confirmation.
- **Wrong `profileId`.** Ad accounts are connected per pen name; using the wrong `profileId` either 404s the `adAccountId` or, worse, finds a matching account under the wrong identity.
- **Vague creative.** "Buy my book" headlines underperform. Help the user write a hook ("Cozy mystery readers — meet the witches of Hollow Creek") before firing.
- **Sending the author to a native console.** Ads are created here and started here. Saying "now go switch it on in Amazon" is wrong, and it is the single most common mistake in this skill.
- **Guessing an ASIN.** If the book's listing isn't to hand, ask for it. Never pattern-match a plausible `B0...` string.
- **Putting one campaign in two groups.** It answers 409 by design, because double-counted spend makes every verdict wrong. Unassign first.
