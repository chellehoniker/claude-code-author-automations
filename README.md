# Author Automations Social — Claude Plugin

Create and schedule social media posts, run AI-powered campaigns, and manage your content across **14 platforms** directly from Claude Code or Claude Cowork.

## What It Does

This plugin connects Claude to your [Author Automations Social](https://authorautomations.social) account, letting you:

- **Create posts** with platform-specific captions (Instagram, TikTok, Facebook, LinkedIn, Twitter/X, WhatsApp, and 8 more)
- **Run AI campaigns** — Claude writes your captions using your brand voice, while AI generates images and videos
- **Schedule content** — publish now, schedule for later, or fill your posting queue
- **Upload media** — attach images and videos to your posts

### The Hybrid AI Model

Unlike typical integrations where a server-side AI writes your content, this plugin lets **Claude write your captions directly**. Claude reads your brand guides, understands your current project context, and crafts platform-specific captions that match your voice. Media generation (images, videos, music) happens server-side via FreePik AI.

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
4. Generate images and video via FreePik AI (2–3 min per video)
5. Schedule everything to your content calendar or queue

### Available Tools

| Tool | Description |
|------|-------------|
| `aa_list_accounts` | See your connected social accounts |
| `aa_create_post` | Create and schedule a post |
| `aa_list_posts` | View your scheduled/published posts |
| `aa_update_post` | Edit a scheduled post |
| `aa_delete_post` | Remove a post |
| `aa_upload_media` | Get a presigned URL for media upload |
| `aa_get_guides` | Read your content guides (brand, prose, social) |
| `aa_queue_preview` | See upcoming queue slots |
| `aa_create_campaign` | Start a new campaign |
| `aa_save_campaign_plan` | Save a content plan to a campaign |
| `aa_generate_media` | Generate images/videos for a campaign |
| `aa_check_media_status` | Check media generation progress |
| `aa_schedule_campaign` | Schedule all campaign posts |
| `aa_list_campaigns` | View your campaigns |

## Updating

Claude Code handles updates automatically when you re-run the marketplace install. To force a refresh:

```
/plugin update author-automations-social@author-automations
```

## Requirements

- An active [Author Automations Social](https://authorautomations.social) subscription ($29/month or $290/year)
- At least one connected social media account
- An API key from Settings

## Support

- Docs: [authorautomations.social/docs/api](https://authorautomations.social/docs/api)
- Email: support@authorautomations.com
- Bugs / feature requests: [open an issue](https://github.com/chellehoniker/claude-code-author-automations/issues)

## For developers

Pre-built artifacts live in `mcp-server/dist/` so the plugin works immediately after a marketplace install. To hack on the plugin locally:

```
git clone https://github.com/chellehoniker/claude-code-author-automations
cd claude-code-author-automations
npm install
npm run build
```

Source lives in `mcp-server/`. Commits that change the server code should re-run `npm run build` and include the updated `dist/`.

## License

MIT
