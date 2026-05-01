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
