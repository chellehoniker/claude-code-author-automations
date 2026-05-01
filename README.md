# Author Automations Social — Claude Plugin

Schedule social posts, run AI campaigns, and manage your content calendar from Claude Code or Claude Cowork — across **15 platforms** including Instagram (Trial Reels, Stories, feed carousels), TikTok (with auto trending music), Threads (topic chains), YouTube Shorts, Facebook, LinkedIn, X, Pinterest, Reddit, Bluesky, Snapchat, Telegram, Google Business, WhatsApp, and Discord.

## Install

**Step 1 — Generate a credential pair.** Sign in to [authorautomations.social/dashboard/settings](https://authorautomations.social/dashboard/settings), find the **Claude Connector** card, click **Generate credential pair**. Copy the Client ID (`aacw_…`) and Client Secret (`aacs_…`). The Secret is shown once — copy carefully.

**Step 2 — Install the plugin.** In any Claude Code or Cowork session:

```
/plugin marketplace add https://github.com/chellehoniker/claude-code-author-automations
/plugin install author-automations-social@author-automations
```

The plugin bundles a remote MCP server at `https://authorautomations.social/api/mcp` — **no local install, no Node, no binary download.** Skills, slash commands, and the connector are all packaged together.

**Step 3 — Paste credentials.** When you enable the plugin, Cowork (or Claude Code) prompts you for the **Client ID** and **Client Secret** you generated in Step 1. The plugin won't activate without them. Once pasted, the connector goes live within seconds.

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

This plugin authenticates with a Client ID + Client Secret pair you generate in your Author Automations Social dashboard. The host (Cowork or Claude Code) prompts for both at install time and won't activate the connector until they're filled. The credentials are sent on every MCP request as headers; our server validates them against the `oauth_clients` table.

Lost the Secret? Generate a new pair from [Settings → Claude Connector](https://authorautomations.social/dashboard/settings) and update the plugin config (Cowork: re-enable the plugin and paste the new pair; Claude Code: edit the user-config values for this plugin). The old pair stays revocable from the same Settings card.

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

### v3.2.0 (2026-05-01)

- **Plugin install now prompts for Client ID + Client Secret.** Cowork's "Advanced settings" was locked when the connector was created from plugin install — meaning users couldn't enter credentials and the OAuth dance silently failed. The plugin manifest now declares both fields as required `userConfig`, so the host gates connector activation until the user pastes them. Generate the pair once at [Settings → Claude Connector](https://authorautomations.social/dashboard/settings) and you're set.
- Credentials flow through MCP request headers (`X-Aa-Client-Id`, `X-Aa-Client-Secret`) and are validated server-side against the `oauth_clients` table on every request.

### v3.1.0

- `pen-names` skill: switch between author identities mid-conversation. Multi-pen-name users now see all their pen names exposed; previously the plugin defaulted to the primary.

### v3.0.0

- Bundled remote MCP server. No local Node, no bun-compiled binary, no SessionStart hook. Plugin install is metadata + skills only; tools are served from `authorautomations.social/api/mcp`.
- Works identically on Cowork (any OS) and Claude Code CLI.

### Migration from v3.0/v3.1

After the v3.2 update, your existing connector won't have credentials. **Disable and re-enable the plugin** to trigger the credential prompt, then paste the Client ID + Client Secret pair from [Settings → Claude Connector](https://authorautomations.social/dashboard/settings).

## License

MIT
