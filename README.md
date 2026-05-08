# Author Automations Social — Claude Plugin

Create and schedule social media posts, run AI-powered campaigns, and manage your content across **14 platforms** directly from Claude Code or Claude Cowork.

## What It Does

This plugin connects Claude to your [Author Automations Social](https://authorautomations.social) account, letting you:

- **Create posts** with platform-specific captions (Instagram, TikTok, Facebook, LinkedIn, Twitter/X, WhatsApp, and 8 more)
- **Run AI campaigns** — Claude writes your captions using your brand voice, while AI generates images and videos
- **Schedule content** — publish now, schedule for later, or fill your posting queue
- **Upload media** — attach images and videos to your posts

### The Hybrid AI Model

Unlike typical integrations where a server-side AI writes your content, this plugin lets **Claude write your captions directly**. Claude reads your brand guides, understands your current project context, and crafts platform-specific captions that match your voice. Media generation (images, videos, music) happens server-side via your chosen AI provider (Magnific, fal.ai, or Google Gemini) — set per pen name in Settings → AI, with per-campaign and per-day overrides.

## Install

This repo is its own Claude plugin marketplace. Two commands in Claude Code or Cowork — no clone, no build, no npm install on your end:

```
/plugin marketplace add https://github.com/chellehoniker/claude-code-author-automations
/plugin install author-automations-social@author-automations
```

That's it. Claude Code downloads the plugin on demand.

## Setup

### 1. Get your API key

1. Log in at [authorautomations.social](https://authorautomations.social)
2. Go to **Settings → API Key**
3. Click **Generate API Key**
4. Copy the key (starts with `aa_sk_`)

### 2. Connect your account

In any Claude conversation, run:

```
/author-automations-social:aa-setup
```

Paste your API key when Claude asks. It's stored locally in your Claude config and never leaves your machine.

### 3. Fill out your AI content guides (one-time)

Back at [authorautomations.social](https://authorautomations.social) → **Settings → AI Configuration**. Fill out all four:

- **Prose Guide** — your writing voice and tone
- **Brand Guide** — your author identity and values
- **Copywriting Guide** — persuasion principles you use
- **Social Media Guide** — platform-specific strategies and hashtag habits

Claude reads all four before writing any caption. Fifteen minutes here makes every post downstream sound like you.

## Usage

### Quick Post

```
/author-automations-social:aa-post My new cozy mystery is available for pre-order!
```

Or just tell Claude what you want:

> "Create a post about my book launch for Instagram and TikTok"

Claude reads your guides, writes unique captions for each platform, and schedules the post.

### AI Campaign

```
/author-automations-social:aa-campaign 14-day campaign for my spring book launch
```

Or describe it:

> "Create a 14-day social media campaign to promote Curses and Currents across Instagram, TikTok, and Facebook"

Claude will:
1. Ask about your objective and platforms
2. Read your brand/prose/social media guides
3. Write day-by-day captions tailored to each platform
4. Generate images and video via your chosen provider (Magnific / fal.ai / Gemini) — 2–3 min per video
5. Schedule everything to your content calendar or queue

### Available Tools

| Tool | Description |
|------|-------------|
| `aa_list_profiles` | List the pen-name profiles this credential can address (use first to know your X-Profile-Id options) |
| `aa_list_accounts` | See your connected social accounts |
| `aa_get_guides` | Read your content guides (brand, prose, social) |
| `aa_queue_preview` | See upcoming queue slots |
| `aa_list_queues` | List queue definitions (per-platform queue support — ATH-207) |
| `aa_preflight_post` | Validate a draft post WITHOUT scheduling — surfaces the same blockers/warnings as create, with zero side effects |
| `aa_create_post` | Create and schedule a post |
| `aa_list_posts` | View your scheduled/published posts (per-leg status, errorMessage, publishedAt — Phase 6e) |
| `aa_update_post` | Edit a post — per-leg edit-after-publish for platforms whose API supports it (Phase 6b) |
| `aa_delete_post` | Remove a post |
| `aa_upload_media` | Get a presigned URL for media upload |
| `aa_create_campaign` | Start a new campaign |
| `aa_save_campaign_plan` | Save a content plan to a campaign — supports slideConfigs, providerOverrides per-day |
| `aa_generate_media` | Generate images/videos/music — routes per task type to Magnific / fal.ai / Gemini |
| `aa_check_media_status` | Check media generation progress (per-post last_error surfaced) |
| `aa_schedule_campaign` | Schedule all campaign posts |
| `aa_list_campaigns` | View your campaigns |
| `aa_shorten_url` | Shorten URLs through your branded domain (Switchy) |

## What's new — version comparison

The plugin's "skills" are markdown guides Claude reads to handle specific intents. v2.x added platform specialists so prompts like "schedule 8 Trial Reels for next week" or "post to Threads under Book Threads topic" produce the right API calls without you having to know the field names.

### Skills in this version

| Skill | Triggers when you say... | What it does | Added |
|------|---|---|---|
| `aa-setup` | "set up author automations", "connect AA Social" | Walks through API key setup; troubleshoots install issues (binary download, Cowork restart, network egress) | v1.0 |
| `social-post` | "post to instagram", "schedule a tweet", "share on social" | Orchestrator: reads your guides, lists accounts, drafts platform-specific captions, schedules. Delegates to specialists when needed | v1.0 (revamped v2.1) |
| `social-campaign` | "14-day campaign", "book launch", "content plan" | Plans multi-day campaigns with AI-generated images/video; routes Reel days through `instagram-reels` for Trial Reels and covers | v1.0 (extended v2.1) |
| **`instagram-reels`** | "trial reel", "post a Reel", "reel cover", "story for IG" | Decision tree for Feed (4:5) vs Story (9:16) vs Reel; supports **Trial Reels** with `MANUAL` or `SS_PERFORMANCE` graduation; cover-image picker (URL / video frame / auto) | **v2.1 NEW** |
| **`threads-post`** | "post to Threads", "topic tag", "thread chain" | Sets `topicTag` (1–50 chars, no `.`/`&`) for Threads discovery; supports multi-part thread chains | **v2.1 NEW** |
| **`youtube-video`** | "YouTube video", "schedule a Short", "playlist" | Required title (separate from caption), visibility (public/private/unlisted), made-for-kids and AI-disclosure flags | **v2.1 NEW** |
| **`reddit-post`** | "Reddit", "r/<subreddit>", "post to subreddit" | Required subreddit + title; self vs link post; flair conventions and AutoMod warnings | **v2.1 NEW** |

### Try it — natural-language prompts that now Just Work

```
Schedule 4 Trial Reels for my book launch over the next 2 weeks.
Use auto-graduation and generate covers via Freepik.
```
→ `instagram-reels` skill handles `trialParams: { graduationStrategy: "SS_PERFORMANCE" }`, generates 9:16 covers, schedules each post.

```
Post a Threads update about my novel and file it under Book Threads.
```
→ `threads-post` skill validates the topic tag, calls `aa_create_post` with `threadsOptions.topicTag: "Book Threads"`.

```
Schedule my book trailer to YouTube for Friday at 9am with the title
"3 Years of Writing — My First Fantasy Novel" and add it to my Author Vlogs playlist.
```
→ `youtube-video` skill enforces the title requirement, sets `containsSyntheticMedia: true` if the trailer was AI-generated, routes to the playlist.

```
Cross-post my launch announcement to r/Fantasy and r/SelfPublishing.
```
→ `reddit-post` skill asks about flair (per-subreddit requirement), drafts subreddit-specific titles, schedules each.

### Version history

| Version | What changed |
|---|---|
| **2.2.0** | New tools: `aa_list_profiles` (pen-name picker), `aa_preflight_post` (validate without scheduling), `aa_list_queues` (per-platform queue defs). `aa_list_posts` now reports per-leg status + per-leg `errorMessage` + `publishedAt` (Phase 6e — `aa_post_deliveries` is the source of truth). `aa_update_post` now supports per-leg edit-after-publish where the platform's API allows it (Instagram caption, LinkedIn caption, Pinterest title/desc/link, etc.). Media generation is multi-provider (Magnific / fal.ai / Gemini) with per-day overrides via `aa_save_campaign_plan.providerOverrides` |
| **2.1.0** | Skills expansion: new `instagram-reels`, `threads-post`, `youtube-video`, `reddit-post` specialists. Updated `social-post` as orchestrator with platform routing |
| **2.0.0** | **No Node.js required.** MCP server ships as a precompiled per-platform binary (~60MB, downloaded on first session) instead of a JS bundle invoked via `node`. Closes the silent-install-failure conversion blocker for non-technical authors |
| 1.6.0 | Whitelabel cleanup. Single self-contained JS bundle removed the runtime `npm install` |
| 1.5.0 | Full per-platform option surface in `aa_create_post` (Trial Reels, Threads topics, YT/Reddit required fields) |
| 1.4.0 | Internal infrastructure improvements |
| 1.0.0 | Initial release |

## Updating

### Claude Cowork (desktop app)

In **Settings → Plugins**, find the `claude-code-author-automations` marketplace. Click the three-dot menu next to it and toggle **Sync automatically** ON — Cowork will pull updates as they're published. To force a check, click **Check for updates** in the same menu.

After Cowork pulls a new version, **fully quit and reopen** (Cmd+Q on Mac, right-click tray icon → Quit on Windows) so the new MCP server attaches and skills reload. Just closing the window isn't enough.

### Claude Code (CLI)

```
/plugin update author-automations-social@author-automations
```

### When updates aren't appearing

If the **Update** button stays greyed out for more than a day, Cowork's marketplace cache may be stale. From the marketplace settings, remove the marketplace, then re-add it from the GitHub URL. Your installed plugin and config aren't affected.

If `aa_*` tools stop working entirely after an update, look for `${CLAUDE_PLUGIN_ROOT}/mcp-server/.install-error` — if the file exists, it has a fail-loud diagnosis. Most common cause: Cowork's `Settings → Capabilities → Allow Network Egress` got toggled off; turn it back on (set to "All Domains") and restart.

## Requirements

- An active [Author Automations Social](https://authorautomations.social) subscription ($29/month or $290/year)
- At least one connected social media account
- An API key from Settings

## Support

- Docs: [authorautomations.social/docs/api](https://authorautomations.social/docs/api)
- Email: support@authorautomations.com
- Bugs / feature requests: [open an issue](https://github.com/chellehoniker/claude-code-author-automations/issues)

## For developers

The plugin's MCP server is a TypeScript program in `mcp-server/`. From v2.0 onward, it ships as platform-specific binaries built with `bun --compile` and attached to GitHub Releases (not committed to the repo). The `hooks/install-binary.sh` SessionStart hook downloads the right binary at first session.

To hack locally:

```
git clone https://github.com/chellehoniker/claude-code-author-automations
cd claude-code-author-automations
bun install
bun run build       # cross-compiles all 4 binaries to ./dist/
```

To cut a release:

```
# Bump version in package.json, plugin.json, marketplace.json (lockstep)
git tag v2.1.x
git push --tags
```

The `.github/workflows/release.yml` workflow runs on tag push, cross-compiles all 4 platform binaries on a single Ubuntu runner via Bun, generates `checksums.txt`, and attaches everything to the matching GitHub Release.

## License

MIT
