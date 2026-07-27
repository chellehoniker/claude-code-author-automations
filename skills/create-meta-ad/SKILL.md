---
name: create-meta-ad
description: Use when the user wants to build a fresh Facebook or Instagram ad from scratch — not promoting an existing post. Triggers on "create an ad", "build a Meta ad from scratch", "I want to advertise X", "design an ad campaign", "create a Facebook ad".
---

# Create a standalone Meta ad — Facebook + Instagram, real money

Build a Facebook or Instagram ad from scratch — campaign + ad set + creative in one flow. This spends real money against the user's connected Meta ad account.

If the user wants to **promote an existing post** (boost it), STOP and route to the `boost-post` skill instead — that flow is simpler and reuses the post's media + caption.

## Quick facts

- **Requires the ads upgrade** — a paid add-on at **$20/month**, included in every STOS plan. Callers without it get a 403; point them at authorautomations.social/pricing.
- **Pen-name-scoped.** Every tool here takes `profileId`. Switch via `pen-names` first if a specific pen name was mentioned and carry the resolved `profileId` through every call.
- **Defaults to PAUSED.** Always create with `status: "paused"`. The user explicitly launches afterward.
- Confirm before `aa_create_standalone_ad` with an AlertDialog-style prompt: "This will create a paused ad with up to $X potential spend. Type 'go'."
- **Not just Meta anymore.** `aa_create_standalone_ad` also creates on TikTok (all goals; min $20 budget; `imageUrl` may be a video URL), LinkedIn (all goals except app_promotion), Google (goals engagement/traffic/awareness/video_views; `campaignType` display|search, keywords, businessName, longHeadline; headline max 30 / body max 90 chars), and Pinterest (same 4 goals; optional boardId; headline max 100 / body max 500; $5 min). This skill's wizard is Meta-first, but the same gates (paused default, spend confirm) apply on every network. ChatGPT and Amazon social-ad accounts are reporting-only (for Amazon Sponsored Products there's a dedicated `aa_create_amazon_campaign` — always created paused, ASIN from the book's listing, never guessed).

## Decision tree

| User says... | Tool / skill |
|---|---|
| "What ad accounts do I have" | `aa_list_ad_accounts` |
| "Find interests for 'cozy mystery readers'" | `aa_search_ad_interests` |
| "What's the engagement benchmark for romance ads" | `aa_get_analytics` |
| "Boost my last Instagram post" / "promote that reel" | **`boost-post` skill (NOT this one)** |
| "Build me an ad for my new book" / "Create a Facebook ad from scratch" | `aa_create_standalone_ad` (this skill) |

## Five-step flow — mirrors the dashboard wizard

### Step 1: Objective

Ask which objective. Options + when to pick each:

- **Engagement** — likes/comments/shares on the ad creative. Good for awareness on a single piece of content.
- **Traffic** — drive clicks to a URL (book sales page, landing page, newsletter signup). The most common objective for authors.
- **Awareness** — maximize reach (impressions). Cheapest CPM but lowest action rate. Pick when the user explicitly says "I just want eyeballs."
- **Video views** — optimize for ThruPlay / 15s view. Use only with video creative.
- **Lead gen** — Meta's in-platform lead form. Create the form first with `aa_create_lead_form` (or pick an existing one from `aa_list_lead_forms`) and pass its id as `leadFormId`.
- **Conversions** — optimize for a pixel event (purchase, signup). Requires Meta pixel installed on the destination site.

Capture as `objective`. If the user is vague ("I just want more book sales"), default to **Traffic** with their book sales URL.

### Step 2: Creative

**Draft with AI — the Creative Studio.** If the user doesn't have creative ready, the studio builds it (all pen-name-scoped, results land in a shared creative library):

- `aa_generate_ad_copy` — hooks + body copy for a book (bookId from their library OR an inline `book` object for titles outside it), style angle (`clean` / `promotional` / `hook` / `hook-high-stakes` / `mockup` / `reviews`), 1–6 variations. Runs on the user's own text-LLM key — `ai_settings_required` / `ai_key_missing` means point them at Settings → AI Providers.
- `aa_generate_ad_creative` — ad IMAGES: pick the style, 1–3 formats (`ad_square` 1:1, `ad_portrait` 4:5, `ad_story` 9:16), 1–6 variations per format; feed in the copy pass's hook/adBody/scenePrompt. **Images can run on the included tier — 12 generations/day — with no image-provider key on file.**
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
- `interests` — use `aa_search_ad_interests({ query })` to resolve user intent ("cozy mystery readers") into Meta interest IDs. Pick 3–8 relevant ones; too few = too narrow, too many = too diffuse.
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
  adAccountId: "...",     // from aa_list_ad_accounts
  objective: "TRAFFIC",
  creative: { headline, primaryText, imageUrl, linkUrl, cta },
  audience: { age, gender, geo, interests, advantageAudience },
  budget: { budgetType, amount, duration, bidStrategy, bidAmount?, roasAverageFloor? },
  status: "paused"
})
```

### After create

Tell the user:

> "Created paused. Total potential spend if launched: $140. Review it in Meta Ads Manager or ask me to launch it when you're ready."

Do NOT launch automatically. Launching is a separate explicit step the user takes.

## Confirm before firing — spend actions

- **`aa_create_standalone_ad`** — always fire the AlertDialog confirm with the dollar amount.
- **Launching** a paused ad — separate confirm: "Launching this ad starts spending against your Meta ad account immediately, up to $X. Proceed?"
- **Raising budget** on a live ad — confirm with the delta: "Increasing daily budget from $20 to $50 = additional $210 over the remaining 7 days. Proceed?"

## Common pitfalls

- **Routing a boost-post request here.** "Promote my last reel" = `boost-post` skill, NOT this one. Ask "is this a fresh ad or a boost of an existing post?" if it's ambiguous.
- **Skipping the duration on daily budgets.** A $20/day ad with no end date is open-ended spend. Always set a duration or surface that risk.
- **Forgetting `bidAmount` / `roasAverageFloor`.** The non-default bid strategies REQUIRE these. The API 422s without them.
- **Auto-launching.** Always paused on create. Always.
- **Wrong `profileId`.** Ad accounts are connected per pen name; using the wrong `profileId` either 404s the `adAccountId` or, worse, finds a matching account under the wrong identity.
- **Vague creative.** "Buy my book" headlines underperform. Help the user write a hook ("Cozy mystery readers — meet the witches of Hollow Creek") before firing.
