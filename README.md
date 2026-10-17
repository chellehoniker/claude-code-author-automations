# Reader Radius — Claude and ChatGPT Plugin

**New in 3.13.1:** Reader Radius is the display name in Claude and ChatGPT. The internal `author-automations-social` plugin ID and `author-automations` marketplace ID are intentionally unchanged, so existing installations, command namespaces, and separately configured MCP connections remain compatible. Update the plugin to receive the new branding; older clients without display-name support may still show the internal ID. No new credentials or connector setup is required.

Schedule social posts, run AI campaigns, and manage your content calendar from Claude Code or Claude Cowork — across **15 platforms** including Instagram (Trial Reels, Stories, feed carousels), TikTok (with auto trending music), Threads (topic chains), YouTube Shorts, Facebook, LinkedIn, X, Pinterest, Reddit, Bluesky, Snapchat, Telegram, Google Business, WhatsApp, and Discord.

## Install

The plugin ships **skills and slash commands**. The MCP connector itself is added separately because Cowork's plugin-bundled connector flow currently locks the OAuth credential fields, which we can't work around from the plugin manifest. Two short steps:

### Step 1 — Add the connector

In Cowork (or Claude Desktop): **Settings → Connectors → Add custom connector**

- **Name:** `Reader Radius` (existing connector names can remain unchanged)
- **Remote MCP server URL:** `https://authorautomations.social/api/mcp`
- **Advanced settings → OAuth Client ID:** generate at [authorautomations.social/dashboard/settings](https://authorautomations.social/dashboard/settings) → **Claude Connector** card → **Generate credential pair** → copy the value starting with `aacw_`
- **Advanced settings → OAuth Client Secret:** the value starting with `aacs_` (shown once, copy carefully)
- Click **Add**.

The connector authenticates immediately and the `aa_*` tools become available.

### Step 2 — Install the plugin (for skills + slash commands)

In any Claude Code or Cowork session:

```
/plugin marketplace add https://github.com/chellehoniker/claude-code-author-automations
/plugin install author-automations-social@author-automations
```

This adds the conversational skills (`pen-names`, `instagram-reels`, `threads-post`, `youtube-video`, `reddit-post`, `tiktok-post`, `linkedin-post`, `aa-setup`, `social-post`, `social-campaign`, `queues`, `guides-author`, `inbox-triage`, `social-analytics`, `boost-post`, `rss-publishing`, `find-something-to-post`, `calendar-notes`, `organize-with-labels`, `comment-to-dm-automation`, `create-meta-ad`) and the `/aa-post` and `/aa-campaign` slash commands. No connector is bundled — Step 1 already covers that.

> Full step-by-step walkthrough with screenshots: **[authorautomations.social/docs/connect](https://authorautomations.social/docs/connect)**.

## Quick start

```
/aa-post My new cozy mystery is available for pre-order!
```

Or just describe what you want:

> "Create a 14-post social media campaign to launch Curses and Currents across Instagram, TikTok, and Facebook"

> "Schedule 4 Trial Reels for next week — auto-graduate based on engagement"

> "Post to Threads under the Book Threads topic"

Claude reads your brand guides, writes platform-specific captions, generates media via your chosen AI provider (Pollinations, Magnific, fal.ai, or Google Gemini — set per pen name in Settings → AI; image generation includes a free 12/day tier with no API key needed), and schedules everything to your calendar or queue. You review every post before anything goes live.

**New in 3.14:** run your **Shopify store** from chat: products, prices, stock, series collections and discount codes, with books put on the storefront only when you say so.

**New in 3.13:** one goal-first **Create ad** wizard covering all eight ad destinations (Meta, TikTok, Amazon, LinkedIn, Google, Pinterest, X and ChatGPT) with progress saved, so a half-built ad resumes where you left it, **campaign groups** that roll every network's spend up under one label and give a plain verdict on whether the launch is working, **Amazon Sponsored Products** built and started inside the app, **six nonfiction campaign objectives** (sell the book, teach a concept, establish authority, lead magnet, course or service, speaking and events), turning an approved **carousel deck into a video** from chat, comment **pinning** on TikTok, and **landscape plus Pinterest ad image formats**. Nothing spends until you start it in-app; you never get sent to a network's own console.

## What's bundled

| Component | Triggers / Notes |
|---|---|
| **371 MCP tools** (served live by the connector) | Publishing, campaigns, queues, and guides at the core (`aa_create_post`, `aa_create_campaign`, queue + guide CRUD), plus the full 2026 surface: unified inbox (DMs, comments incl. likes, private replies, TikTok pinning, reviews, automation flows), analytics (engagement, best-time, follower growth, content decay, per-platform deep dives), Media Studio (standalone image/video/audio generation with a 12/day included image tier), carousel-to-video conversion, the unified All-Ads dashboard + campaign groups + Creative Studio + Amazon Ads create/start (ads upgrade), Shopify store management (products, sales channels, collections, inventory, discounts), CRM (contacts, broadcasts, sequences), Google Business Profile suite, WhatsApp suite (templates, flows, groups, numbers), account groups, per-platform validators, link shortening, and publish logs. Tool definitions update server-side — no plugin reinstall needed. Full reference at [/docs/api](https://authorautomations.social/docs/api) |
| **Skills** (markdown chat guides) | `aa-setup`, `pen-names` (switch between author identities), `social-post`, `social-campaign`, `instagram-reels` (Trial Reels + covers), `threads-post` (topic tags + chains), `youtube-video` (titles + Shorts), `reddit-post` (subreddit + flair), `tiktok-post` (drafts, brand-partner disclosure, AI attestation), `linkedin-post` (the firstComment URL trick, PDF document posts), `queues` (per-platform + per-persona scheduling), `guides-author` (chat-edit personas + content guides), `inbox-triage` (DMs, comments, reviews), `social-analytics` (performance + best-time), `boost-post` (paid promotion with spend gates; ads upgrade), `rss-publishing` (auto-post from blog/feed), `find-something-to-post` (idea picker from books + feeds), `calendar-notes` (date annotations on the calendar), `organize-with-labels` (tag + filter posts), `comment-to-dm-automation` (auto-DM commenters), `create-meta-ad` (build a fresh ad from scratch on any of the eight ad destinations, Amazon Sponsored Products included, plus campaign groups and cross-network verdicts; ads upgrade), `shopify-store` (products, prices, stock, series collections and discount codes on your Shopify store; every plan) |
| **Slash commands** | `/aa-post <topic>`, `/aa-campaign <objective>` |

The skills make Claude fluent in platform-specific options. Saying "schedule 8 trial reels" auto-routes through the `instagram-reels` skill which knows the right `instagramOptions.trialParams` shape.

## Authentication

Authentication is on the **connector** (added in Step 1 of Install), not the plugin. You paste a Client ID + Client Secret pair you generate from your Author Automations Social dashboard into the connector's Advanced settings; Cowork runs the OAuth `client_credentials` grant against our token endpoint, mints a Bearer JWT, and uses it on every MCP request.

Lost the Secret? Generate a new pair from [Settings → Claude Connector](https://authorautomations.social/dashboard/settings), then update the connector in Cowork: Settings → Connectors → click the connector → paste the new credentials → Save. The old pair stays revocable from the same Settings card.

If you have multiple pen names, your connector exposes every pen name you have access to. Switch between them by saying *"post under my [pen name]"* or *"switch to [pen name]"* — the bundled `pen-names` skill teaches Claude how to discover your pen names and route subsequent calls. See `skills/pen-names/SKILL.md`.

## Updating

### Claude Cowork

Settings → Plugins → three-dot menu next to the marketplace → toggle **Sync automatically** ON. Updates flow as we ship them. To force a check, click **Check for updates**.

### Claude Code (CLI)

```
/plugin update author-automations-social@author-automations
```

## Requirements

- An active [Author Automations Social](https://authorautomations.social) subscription ($29/month or $290/year)
- At least one connected social media account
- Modern browser (for the OAuth authorize step)
- **Ads features** (boost, standalone ads, unified ads dashboard, Creative Studio, Amazon Ads) require the **ads upgrade — $20/month**, included in every StorytellerOS plan

## Support

- **Connect guide:** [authorautomations.social/docs/connect](https://authorautomations.social/docs/connect) — install + credentials + troubleshooting
- API reference: [authorautomations.social/docs/api](https://authorautomations.social/docs/api)
- Email: support@authorautomations.com
- Bugs / feature requests: [open an issue](https://github.com/chellehoniker/claude-code-author-automations/issues)

## What's new

### v3.14.0 (2026-10-17): Shopify store from chat

- **New `shopify-store` skill** for the 18 new Shopify tools: check the store's permissions (`aa_shopify_store`), list, create (with images), edit and reprice products, put a product on the storefront (`aa_list_shopify_channels`, `aa_publish_shopify_product`), series collections, stock levels by location, and discount codes. Free on every plan. The skill's main rule: an **active** product isn't on sale until it is published to the Online Store channel. New products start as drafts, and the ISBN goes in `sku`.
- **`boost-post`:** a paused boost pauses only its campaign, so starting the campaign in-app is what makes it deliver; networks now refuse targeting they can't use (age and gender on Google, LinkedIn and X; languages off Meta and Google; interests on Google), and the server drops those fields; a brand-new boost can take a sync cycle to show up in the ads tools.
- **`inbox-triage` and `comment-to-dm-automation`:** comment-keyword flows don't work on X anymore (X comments no longer arrive); X stays available for DM triggers. Both skills, and `social-analytics`, no longer call themselves StorytellerOS-only: inbox, comment automations and analytics are on every plan. `comment-to-dm-automation` now pauses with `isActive: false` and sets the public reply as `commentReply` text.
- **`create-meta-ad`:** the `aa_create_standalone_ad` example matches the real parameters (status, goal and schedule go in `extra`); Sponsored Brands and Sponsored Display are available on Amazon; X is listed in the wizard but can't be created yet.
- **`boost-post`:** excluded locations use the `countries` / `regions` / `cities` / `zips` buckets.

### v3.13.0 (2026-09-12): synced to the 312-tool MCP surface

Eight new tools since v3.12.0, and a set of dashboard flows the skills now know how to describe. Tool definitions load server-side, so existing installs pick this up with no reinstall.

- **Campaign groups** (`aa_ads_groups_list`, `aa_ads_groups_create`, `aa_ads_groups_update`, `aa_ads_groups_assign`, `aa_ads_groups_rollup`): label your ads once ("Curses launch Sep 26") and get one cross-network answer: spend, revenue, ROAS, CPC, per-platform breakdown, and a verdict of winning / watch / losing / too early / no data. Set your own target (ROAS, ACOS or CPC) or a break-even ROAS and the verdict measures against it. A campaign sits in exactly one group, so spend is never double-counted. Documented in `create-meta-ad`, with the reporting entry point in `social-analytics`.
- **Amazon Sponsored Products, end to end.** `aa_amazon_ads_brands` (registered brands and logos for an advertiser profile) and `aa_amazon_ads_campaign_state` (in-app Start / Pause) join `aa_create_amazon_campaign`, which now takes `campaignType` (`sp`; Sponsored Brands is written but shipped disabled and refused), `asin`, `targetingType` auto or manual, and up to 100 `negativeKeywords` with exact or phrase matching. Campaigns are created **paused** and started **in the app**, never in Amazon's console. `create-meta-ad` gained a full Amazon section; `boost-post` no longer calls Amazon reporting-only.
- **One Create ad wizard.** A single goal-first wizard at `/dashboard/ads/create` covering all eight destinations: Meta, TikTok, Amazon, LinkedIn, Google, Pinterest, X and ChatGPT. Each destination gets its own campaign and budget, and progress is saved as you advance so a half-built ad resumes where you left it. Meta, TikTok, LinkedIn and Amazon are created paused and switched on with **Start these ads**; Google, Pinterest, X and ChatGPT have no paused state, so they are created at that same moment, which the wizard says up front.
- **Comment pinning** (`aa_pin_inbox_comment`): pin or unpin a top-level comment. TikTok only today. `inbox-triage` also gained a TikTok section: comments support reply, like, hide, delete-own and pin but **no private reply**; DMs are reply-only, capped at 10 messages in the 48 hours after the reader's last message, and each message is text (up to 6,000 characters) **or** one JPG/PNG up to 3 MB, never both.
- **Ad image formats.** `aa_generate_ad_creative` adds `ad_landscape` (1.91:1) for link cards, Google Display and Amazon custom images, and `ad_pin` (2:3) for Pinterest.
- **Ad copy steering.** `aa_generate_ad_copy` takes `directive` (up to 2,000 characters; the campaign objective every variation must serve) and `hooks` (up to 6 headlines of 160 characters each; you get one variation per hook, in order).
- **Six nonfiction campaign objectives:** sell the book, teach a concept, establish authority, lead magnet, promote a course or service, and support speaking or events, each carrying a grounding rule that forbids invented credentials, results, statistics or testimonials. All fourteen are accepted directly by `aa_create_campaign` now, and `social-campaign` lists them.
- **Carousel deck to video, from chat** (`aa_carousel_video_start`, `aa_carousel_video_status`, `aa_carousel_video_clear`): publish an approved carousel as one video built from its panels (5 seconds per panel by default, adjustable 1 to 15, optional prompt-driven instrumental music, 2 to 20 slides). It is a per-post choice rather than an addition: the video ships and the slides don't, and `aa_carousel_video_clear` reverts to the deck and cancels a build in progress. One build per post at a time. Documented in `social-campaign`.
- **Targeted media reruns.** `aa_generate_media` takes `slideIndices` (regenerate only those 0-based slides of a per-slide carousel) and `retryMissing` (fill only the slots a partly failed run left empty, leaving generated media alone), and answers `{ status: "skipped" }` when there is genuinely nothing to do, which is success rather than an error. Documented in `social-campaign`.
- **Account health and reconnect.** `aa-setup` now covers `aa_get_accounts_health` / `aa_get_account_health` as the answer to "one platform stopped working", including the dashboard's per-account badge, its reconnect count, and the one instruction that matters on reconnect: leave every permission box ticked.

### v3.12.0 (2026-09-05) — synced to the 301-tool MCP surface

The hosted MCP grew to **301 tools**. New in this sync: the wizard-era campaign shape (post counts instead of day slots, per-platform options, recipe-guided carousels with the real-cover closer), the book reference library (`aa_*` tools for labeled reference docs — quotes, scenes, character notes — that ground campaign generation), media folders and asset management (`aa_list_media_folders`, `aa_create_media_folder`, `aa_delete_media_folder`, `aa_update_studio_asset`, `aa_delete_studio_asset`), and video-studio provenance on campaign media. Tool definitions load server-side, so existing installs pick all of this up with no reinstall.

### v3.11.0 (2026-07-27) — synced to the 281-tool MCP surface

The hosted MCP server grew from ~92 to **281 tools** since the last release (upstream contract parity + the unified ads/creative wave — all live in prod; the connector picks tool definitions up automatically). This release syncs the plugin's skills and docs to that surface:

- **Entitlement model** — ads tools (boost, standalone ads, unified dashboard, Creative Studio, Amazon) now require the **ads upgrade: $20/month, purchasable from the dashboard, included in every STOS plan**. `boost-post` and `create-meta-ad` updated from the old "STOS-only" framing. Inbox and analytics remain STOS-plan features; inbox automation **flows** are free on every plan.
- **`boost-post`** — boosting now covers Meta, TikTok, LinkedIn, Google, and Pinterest (minimums: TikTok $20/day, Pinterest $5); ChatGPT and Amazon campaigns are created through the dashboard's Create ad wizard and started in-app. Documents the `targeting` vs `rawTargeting` mutual exclusion and `aa_search_ad_targeting` for geo lookups.
- **`create-meta-ad`** — Creative Studio flow (`aa_generate_ad_copy` → `aa_generate_ad_creative` / `aa_generate_ad_video`, `aa_draft_ad_campaign` reviewable drafts, carousels), `aa_create_lead_form` for the Leads objective, and per-network notes for TikTok/LinkedIn/Google/Pinterest standalone ads + `aa_create_amazon_campaign`.
- **`inbox-triage`** — comment likes (`aa_like_inbox_comment`), public-comment→private-DM replies (`aa_private_reply_inbox_comment`), conversation archiving, message edit/delete/react (per-platform support noted), and automation flows (`aa_create_flow` / `aa_activate_flow` / `aa_get_flow_runs`).
- **`social-analytics`** — follower growth, content decay, posting frequency, Instagram demographics, LinkedIn aggregate/per-post, YouTube daily views, per-post timelines, and the all-networks ads view (`aa_list_all_ads` / `aa_get_ads_timeline`).
- **Media generation** — `aa_generate_media` now takes per-run `imageProvider` / `videoProvider` / `musicProvider` (+ model) overrides; provider settings are a preference, not a gate — **Pollinations images run on an included 12/day tier with no API key**. `social-post` and `instagram-reels` now route standalone generation through the Media Studio (`aa_studio_generate_media`).
- **`social-post`** — `aa_get_next_queue_slot` for "when would the queue publish this?", root-level YouTube `tags`, Discord platform options, and `aa_shorten_link` (link shortening is now a chat tool; the v3.10.1 "dashboard-only" note is superseded — setup still lives in Settings → AI).
- **`social-campaign`** — checks `aa_list_campaign_drafts` for stalled campaigns before creating new ones.

### v3.10.1 (2026-05-29)

Documents the Link Shortener. `social-post`, `social-campaign`, and `guides-author` now note that branded short domains and auto-shorten (for campaigns and templates) are configured in the dashboard's **Settings → AI** and applied automatically server-side — there's no chat tool for it, so agents point users to the dashboard instead of trying to shorten links from chat.

### v3.10.0 — Nine new user-facing skills

Closes the gap between the MCP tool surface and what users can ask for in chat. Five high-frequency flows (Tier 1) plus four niche-but-useful ones (Tier 2):

**Tier 1 — most-requested workflows:**

- `inbox-triage` — read DMs, comments, and reviews across all connected accounts. Draft replies in the user's voice (via `aa_get_guides`), show, and send only after explicit confirmation. Hide spam only on explicit user OK. STOS-only.
- `social-analytics` — performance review across a date range (default last 7 days), top + bottom performers, per-platform breakdown, and best-time-to-post recommendations from `aa_get_best_time`. Hands off to `boost-post` when the user wants to amplify a winner. STOS-only.
- `boost-post` — paid promotion of an already-published post on Meta ad accounts. Two non-negotiable gates: explicit post pick, then a verbatim "type 'go' to confirm" gate after showing computed total spend (daily × duration). Defaults to PAUSED state when the user is uncertain. STOS-only.
- `rss-publishing` — subscribe a blog/feed so new items become posts. Auto-post defaults to OFF (items land as drafts). Immediate post-create poll surfaces recent items so the user sees it's working.
- `find-something-to-post` — idea picker that pulls candidates from the user's books library and subscribed RSS feeds via `aa_find_content`. Presents 5 options, then hands off to `social-post` for drafting and scheduling.

**Tier 2 — niche but useful:**

- `calendar-notes` — add a date annotation (launch milestone, reminder, placeholder) to the calendar without scheduling an actual post. Pen-name scoped.
- `organize-with-labels` — tag, filter, and bulk-organize posts. Knows the PUT-replaces-full-set foot-gun on `aa_set_post_labels` and prescribes read-then-union when adding to an existing label set. Pen-name scoped.
- `comment-to-dm-automation` — set up Meta's auto-DM-on-comment rules. Defaults to PAUSED on create; explicit user enable required. STOS-only.
- `create-meta-ad` — build a fresh Meta ad from scratch (5-step wizard: Objective → Creative → Audience → Budget → Review). Full bid-strategy matrix; defaults to PAUSED state with a "type 'go'" total-spend confirm. Cross-references `boost-post` if the user actually wants to promote an existing post. STOS-only.

### v3.9.1 (2026-05-23)

- **Pen-name correctness for the campaign + post lifecycle.** Six MCP tools (`aa_save_campaign_plan`, `aa_generate_media`, `aa_check_media_status`, `aa_schedule_campaign`, `aa_update_post`, `aa_delete_post`) previously had no `profileId` parameter, so calls against campaigns or posts on a non-primary pen name silently scoped to the user's primary profile and 404'd "Campaign not found" / "Post not found." Server side: each route already gated correctly on the stored profile id, so there was zero cross-tenant write — the failure was fail-safe, not a tenancy leak. Now every campaign-lifecycle and post-lifecycle tool accepts `profileId`; the `pen-names` skill lists all 13 profile-scoped tools and the `social-campaign` skill threads `profileId` through every step of the build sequence.

### v3.9.0 (2026-05-14)

- **Two new specialist skills** matching the per-platform option expansion that landed in social-standalone today:
  - `tiktok-post` — TikTok drafts (Creator Inbox), the `commercialContentType` + paired-brand-flag contract (brand_organic/brand_content rejection if you forget the pair), AI-generated-video attestation, content-preview + express-consent policy fields. Trigger on "tiktok draft," "paid partnership," "ai generated video," "duet/stitch."
  - `linkedin-post` — The first-comment URL trick (LinkedIn down-ranks caption-URLs 40–50%, comments are exempt — put the link in `firstComment` and end the caption with "Link in the comments 👇"). PDF document posts with `documentTitle`. Link-preview suppression.
- **Orchestrator updates** — `social-post` now routes TikTok and LinkedIn requests to the new specialists, and folds in three single-field controls inline: Facebook `draft` (Publishing Tools), Twitter `longVideo` (X Premium amplify_video), Pinterest `link` (destination URL per pin).
- **Campaign-level platform options** documented in `social-campaign`: TikTok draft + commercial content + long description, Facebook draft + firstComment + Reel title, Instagram/LinkedIn/YouTube firstComment, Twitter longVideo, Pinterest link. Apply once at the campaign level instead of per-post.

### v3.7.1 (2026-05-08)

- `guides-author` skill: question library re-organized as **facets, not guides**. Each underlying question is asked ONCE and the answer is compiled into every guide section it informs (voice → 5 sections across 3 guides; off-limits → 3 sections; etc.). Skill is transparent about which guides each answer lands in. All four guides still get written — none of them are skipped — because the dashboard's AI generator reads each separately. The previous structure asked the same things multiple times across the 4-guide questionnaire; this is a clean dedup.

### v3.7.0 (2026-05-08)

- **Queue CRUD via chat** — new `aa_create_queue`, `aa_update_queue`, `aa_delete_queue`, `aa_list_queues` tools and a `queues` skill. Queues now scope per-platform AND per-persona: a queue can serve only specific networks (`platforms[]`) and/or only one persona under the pen name (`tag` matching `aa_list_guide_sets`). The campaign scheduler prefers persona-scoped queues for that campaign's posts, falling back to shared queues.
- **Guides + personas chat-edit** — new `aa_update_guide`, `aa_rename_guide_set`, `aa_delete_guide_set` tools and a `guides-author` skill that walks the user through editing existing guides ("show me the diff before applying") and creating new personas in stages (brand → prose → copywriting → social media). The skill knows the question library used by the dashboard's guide-generation flow so it asks the same things in the same order.
- Migration 044 adds `persona_tag` to `aa_queue_platforms` (NULL = shared, non-NULL = persona-scoped).

### v3.6.0 (2026-05-08)

- **Carousel slide configs** in `social-campaign` — per-slide prompts and per-slide text overlays via `slideConfigs` on the day plan. Lossy back-compat with `imagePrompts` (string array) preserved.
- **Per-day generator overrides** — set `providerOverrides.{image,video,music}` on any day to use a different model than the campaign or pen-name default. Lets authors rescue a wedged provider day without changing the campaign-wide setting.
- **Multi-provider media gen** — `aa_generate_media` routes per task type to Magnific, fal.ai, or Google Gemini per the resolution chain (per-day → per-campaign → pen-name default). Per-post `last_error` captures specific failure reasons (rate-limit, expired key, unsupported model).
- **Skip-day + upload-your-own** — skill now mentions both affordances so Claude knows to suggest them when a day's gen fails or the user has their own asset.
- **Brand sweep** — replaced "Freepik" with the multi-provider naming across `social-post`, `social-campaign`, `instagram-reels`, `youtube-video`, README. The plugin no longer hard-references one image provider in any user-facing copy.

### v3.3.0 (2026-05-01)

- **Connector unbundled.** The plugin no longer ships a `.mcp.json`. Cowork's plugin-bundled connectors lock the OAuth Client ID/Secret fields, and `userConfig` doesn't unlock them for HTTP MCP servers. Splitting the connector out into a manual "Add custom connector" step (which keeps those fields editable) is the cleaner mental model and gets users unblocked. Plugin still ships every skill and slash command — credentials live on the connector, not the plugin.

### v3.2.0 (2026-05-01) — superseded

- Tried to declare Client ID + Client Secret as required `userConfig`. The fields appeared but didn't unlock the connector dialog's OAuth slots. Removed in v3.3.

### v3.1.0

- `pen-names` skill: switch between author identities mid-conversation. Multi-pen-name users now see all their pen names exposed; previously the plugin defaulted to the primary.

### v3.0.0

- Moved tools from a local MCP server to the hosted one at `authorautomations.social/api/mcp`. No more Node, bun-compiled binary, or SessionStart hook.
- Works identically on Cowork (any OS) and Claude Code CLI.

### Migration from v3.0–v3.2

If you previously installed v3.0–v3.2, you may have a half-broken auto-installed connector with locked credentials. Clean up:

1. Settings → Connectors → find the auto-installed `author-automations` connector → **Remove**.
2. Settings → Connectors → **Add custom connector** with the URL + credentials from the Install section above.
3. The plugin keeps working as-is — its skills and slash commands don't change.

## License

MIT
