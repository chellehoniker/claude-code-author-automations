# Author Automations Social — Claude Plugin

Create and schedule social media posts, run AI-powered campaigns, and manage your content across 13 platforms directly from Claude Code or Claude Cowork.

## What It Does

This plugin connects Claude to your [Author Automations Social](https://authorautomations.social) account, letting you:

- **Create posts** with platform-specific captions (Instagram, TikTok, Facebook, LinkedIn, Twitter/X, and 8 more)
- **Run AI campaigns** — Claude writes your captions using your brand voice, while AI generates images and videos
- **Schedule content** — publish now, schedule for later, or fill your posting queue
- **Upload media** — attach images and videos to your posts

### The Hybrid AI Model

Unlike typical integrations where a server-side AI writes your content, this plugin lets **Claude write your captions directly**. Claude reads your brand guides, understands your current project context, and crafts platform-specific captions that match your voice. Media generation (images, videos, music) happens server-side via FreePik AI.

## Setup

### 1. Get Your API Key

1. Log in at [authorautomations.social](https://authorautomations.social)
2. Go to **Settings > API Key**
3. Click **Generate API Key**
4. Copy the key (starts with `aa_sk_`)

### 2. Install the Plugin

```bash
claude plugin install author-automations-social
```

### 3. Configure

Run the setup command in Claude:

```
/author-automations-social:aa-setup
```

Or tell Claude: "Set up my Author Automations Social account"

## Usage

### Quick Post

```
/author-automations-social:aa-post My new cozy mystery is available for pre-order!
```

Or just tell Claude what you want:

> "Create a post about my book launch for Instagram and TikTok"

Claude will read your brand guides, write unique captions for each platform, and schedule the post.

### AI Campaign

```
/author-automations-social:aa-campaign 7-day Instagram campaign for my spring book launch
```

Or describe what you need:

> "Create a 30-day social media campaign to promote Curses and Currents"

Claude will:
1. Ask about your objective and platforms
2. Read your brand/prose/social media guides
3. Write day-by-day captions tailored to each platform
4. Generate images via FreePik AI
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

## Content Guides

For best results, set up your content guides in the Author Automations Social dashboard under **Settings > AI Configuration**:

- **Prose Guide** — your writing tone and style
- **Brand Guide** — your brand identity and values
- **Copywriting Guide** — your approach to persuasive copy
- **Social Media Guide** — platform-specific strategies and hashtag usage

Claude reads these guides before writing any captions to match your voice.

## Requirements

- An active [Author Automations Social](https://authorautomations.social) subscription
- At least one connected social media account
- An API key from Settings

## Support

- Documentation: [authorautomations.social/docs/api](https://authorautomations.social/docs/api)
- Email: support@authorautomations.com

## License

MIT
