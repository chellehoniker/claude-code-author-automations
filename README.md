# Author Automations Social — Claude Plugin

Schedule social posts, run AI campaigns, and manage your content calendar from Claude Code or Claude Cowork — across **15 platforms** including Instagram (Trial Reels, Stories, feed carousels), TikTok (with auto trending music), Threads (topic chains), YouTube Shorts, Facebook, LinkedIn, X, Pinterest, Reddit, Bluesky, Snapchat, Telegram, Google Business, WhatsApp, and Discord.

## Install

The plugin ships **skills and slash commands**. The MCP connector itself is added separately because Cowork's plugin-bundled connector flow currently locks the OAuth credential fields, which we can't work around from the plugin manifest. Two short steps:

### Step 1 — Add the connector

In Cowork (or Claude Desktop): **Settings → Connectors → Add custom connector**

- **Name:** `Author Automations`
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

This adds the conversational skills (`pen-names`, `instagram-reels`, `threads-post`, `youtube-video`, `reddit-post`, `aa-setup`, `social-post`, `social-campaign`) and the `/aa-post` and `/aa-campaign` slash commands. No connector is bundled — Step 1 already covers that.

> Full step-by-step walkthrough with screenshots: **[authorautomations.social/docs/connect](https://authorautomations.social/docs/connect)**.

## Quick start

```
/aa-post My new cozy mystery is available for pre-order!
```

Or just describe what you want:

> "Create a 14-post social media campaign to launch Curses and Currents across Instagram, TikTok, and Facebook"

> "Schedule 4 Trial Reels for next week — auto-graduate based on engagement"

> "Post to Threads under the Book Threads topic"

Claude reads your brand guides, writes platform-specific captions, generates media via your chosen AI provider (Magnific, fal.ai, or Google Gemini — set per pen name in Settings → AI), and schedules everything to your calendar or queue. You review every post before anything goes live.

## What's bundled

| Component | Triggers / Notes |
|---|---|
| **22 MCP tools** | `aa_list_accounts`, `aa_create_post`, `aa_create_campaign`, queue CRUD (`aa_list_queues` / `aa_create_queue` / `aa_update_queue` / `aa_delete_queue`), guide CRUD (`aa_update_guide` / `aa_rename_guide_set` / `aa_delete_guide_set`), etc. — full reference at [/docs/api](https://authorautomations.social/docs/api) |
| **Skills** (markdown chat guides) | `aa-setup`, `pen-names` (switch between author identities), `social-post`, `social-campaign`, `instagram-reels` (Trial Reels + covers), `threads-post` (topic tags + chains), `youtube-video` (titles + Shorts), `reddit-post` (subreddit + flair), `tiktok-post` (drafts, brand-partner disclosure, AI attestation), `linkedin-post` (the firstComment URL trick, PDF document posts), `queues` (per-platform + per-persona scheduling), `guides-author` (chat-edit personas + content guides) |
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

## Support

- **Connect guide:** [authorautomations.social/docs/connect](https://authorautomations.social/docs/connect) — install + credentials + troubleshooting
- API reference: [authorautomations.social/docs/api](https://authorautomations.social/docs/api)
- Email: support@authorautomations.com
- Bugs / feature requests: [open an issue](https://github.com/chellehoniker/claude-code-author-automations/issues)

## What's new

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
