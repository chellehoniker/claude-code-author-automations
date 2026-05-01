# Author Automations Social — Claude Plugin

Schedule social posts, run AI campaigns, and manage your content calendar from Claude Code or Claude Cowork — across **15 platforms** including Instagram (Trial Reels, Stories, feed carousels), TikTok (with auto trending music), Threads (topic chains), YouTube Shorts, Facebook, LinkedIn, X, Pinterest, Reddit, Bluesky, Snapchat, Telegram, Google Business, WhatsApp, and Discord.

## Install

```
/plugin marketplace add https://github.com/chellehoniker/claude-code-author-automations
/plugin install author-automations-social@author-automations
```

The plugin bundles a remote MCP server hosted at `https://authorautomations.social/api/mcp` — **no local install, no Node, no binary download.** Skills, slash commands, and the connector are all packaged together.

After install, run `/mcp` in Claude Code (or use Cowork's connector authorize prompt) to sign in to your Author Automations Social account. You'll be redirected to a consent screen; click **Approve** and tools become available.

> Need a step-by-step walkthrough? See the canonical connect guide: **[authorautomations.social/docs/connect](https://authorautomations.social/docs/connect)** — covers Cowork, Claude Code, and the REST API in one place, with credential generation and troubleshooting.

## Quick start

```
/aa-post My new cozy mystery is available for pre-order!
```

Or just describe what you want:

> "Create a 14-day social media campaign to launch Curses and Currents across Instagram, TikTok, and Facebook"

> "Schedule 4 Trial Reels for next week — auto-graduate based on engagement"

> "Post to Threads under the Book Threads topic"

Claude reads your brand guides, writes platform-specific captions, generates media via Freepik when needed, and schedules everything to your calendar or queue. You review every post before anything goes live.

## What's bundled

| Component | Triggers / Notes |
|---|---|
| **15 MCP tools** | `aa_list_accounts`, `aa_create_post`, `aa_create_campaign`, etc. — full reference at [/docs/api](https://authorautomations.social/docs/api) |
| **Skills** (markdown chat guides) | `aa-setup`, `pen-names` (switch between author identities), `social-post`, `social-campaign`, `instagram-reels` (Trial Reels + covers), `threads-post` (topic tags + chains), `youtube-video` (titles + Shorts), `reddit-post` (subreddit + flair) |
| **Slash commands** | `/aa-post <topic>`, `/aa-campaign <objective>` |

The skills make Claude fluent in platform-specific options. Saying "schedule 8 trial reels" auto-routes through the `instagram-reels` skill which knows the right `instagramOptions.trialParams` shape.

## Authentication

This plugin uses OAuth 2.1 (Authorization Code with PKCE). On first tool call, Claude prompts you to authorize the connector:

1. Click the authorize link Claude shows
2. Sign in to your Author Automations Social account in the browser
3. Click **Approve** on the consent screen
4. Browser closes, tools become available in Claude

You can revoke connector access anytime in [Settings → Cowork Connector](https://authorautomations.social/dashboard/settings).

If you have multiple pen names, the connector authorizes against your account and exposes every pen name you have access to. Switch between them by saying *"post under my [pen name]"* or *"switch to [pen name]"* — the bundled `pen-names` skill teaches Claude how to discover your pen names and route subsequent calls. See `skills/pen-names/SKILL.md`.

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

## What's new in v3.0

- **Bundled remote MCP server.** No local Node, no bun-compiled binary, no SessionStart hook. Plugin install is metadata + skills only; tools are served from `authorautomations.social/api/mcp`.
- **OAuth 2.1 with PKCE.** First-time authorize via consent screen, then tokens auto-refresh.
- **Works identically on Cowork (any OS) and Claude Code CLI.** Single install path.

### Migration from v2.x

If you previously installed v2.x and have a bun-compiled binary on disk, the v3.0 update strips the local-server config and switches to the remote MCP. No action needed beyond the regular update — just sync via the marketplace and restart.

## License

MIT
