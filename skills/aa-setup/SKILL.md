---
name: aa-setup
description: Use when the user wants to set up, configure, or connect Author Automations Social. Also triggers when aa_* tools return authentication errors, the connector says "Connection has expired" or won't authenticate, or the tools aren't appearing in your toolkit at all.
---

# Author Automations Social Setup

## When to Use
- User says "set up author automations", "connect my social accounts", "configure AA Social"
- An `aa_*` tool returns 401 / "unauthorized" / "Invalid client credentials"
- The connector card shows "Connection has expired" or "Connection issue"
- The `aa_*` tools aren't appearing at all in your tool list
- User asks how to get started with social media scheduling

## How v3.2+ authentication works

The plugin bundles a remote HTTP MCP server at `https://authorautomations.social/api/mcp`. Authentication is a **Client ID + Client Secret pair** the user generates from their dashboard. The plugin manifest declares both fields as required `userConfig`, so the host (Cowork / Claude Code) prompts for them at install time and won't activate the connector until they're pasted in. Once activated, the credentials are sent on every MCP request as HTTP headers (`X-Aa-Client-Id` and `X-Aa-Client-Secret`) and validated server-side against the `oauth_clients` table.

There is no Bearer token to mint, no browser OAuth dance to run, no local config file, no API key paste, no Node prerequisite.

The user generates the pair at: `https://authorautomations.social/dashboard/settings` → **Claude Connector** card → **Generate credential pair**. The Client ID starts with `aacw_`, the Client Secret starts with `aacs_`. The Secret is shown only once. The full install walkthrough lives at `https://authorautomations.social/docs/connect`.

## Setup Flow

### Step 1 — Try a tool

Call `aa_list_accounts`. Three possible outcomes:

**(a) Tool returns data or an empty list** — connected and authorized. Skip to Step 4.

**(b) Tool returns `Invalid client credentials` / 401** — credentials are wrong, missing, or revoked. Go to Step 2.

**(c) `aa_list_accounts` isn't an available tool at all** — the MCP connector didn't load. Go to Step 3.

### Step 2 — Re-paste the credential pair

This is the most common case. Tell the user:

> "The plugin needs a fresh Client ID and Client Secret. Open https://authorautomations.social/dashboard/settings, find the **Claude Connector** card, click **Generate credential pair**, and copy both values. The Client Secret is shown only once — copy carefully."

Then walk them through pasting:

**In Cowork:** Settings → Plugins → find Author Automations Social → click the gear icon next to the plugin → paste Client ID + Client Secret into the prompted fields → Save. The connector should re-authenticate within seconds.

**In Claude Code:** Run `/plugin config author-automations-social` (or edit your user-settings JSON for this plugin) and update `client_id` and `client_secret`. Then re-enable the plugin.

If the user has an existing credential pair they don't want to regenerate, they can find it: the Client ID is visible on the **Claude Connector** card under "Active credentials." But the Secret is hashed server-side and unrecoverable — if they lost it, they MUST generate a new pair.

### Step 3 — Connector didn't load at all

Almost always one of these:

1. **Cowork hasn't refreshed since the plugin installed.** Tell the user:
   > "Fully quit Cowork (Cmd+Q on Mac, right-click tray icon → Quit on Windows — not just close the window) and reopen. The connector will attach on the next session."

2. **Plugin install is on an older version.** v3.1 and earlier didn't prompt for credentials, leaving the connector in a half-installed state. Tell the user:
   > "Open the marketplace: Settings → Plugins → click the three-dot menu on the marketplace and choose **Check for updates**. If 'Author Automations Social' shows v3.2 or newer, install it. Then disable and re-enable the plugin to trigger the credential prompt."

3. **Network egress is locked down.** The remote MCP server lives at `authorautomations.social`. If Cowork can't reach it, no tools load. Tell the user:
   > "Open Cowork **Settings → Capabilities → Allow Network Egress** and set it to **All Domains**. The connector needs to talk to authorautomations.social."

### Step 4 — Confirm

> "You're all set. Try asking me to 'list my connected social accounts', 'create a post about [topic]', 'schedule a Trial Reel for my book launch', or 'start a 14-day campaign for my spring release'."

## Troubleshooting Reference

### "Connection has expired" / "Connection issue"
The connector was created without credentials (typical of v3.0/v3.1 installs that pre-date the userConfig prompt). Or the credentials were revoked. Either way: disable + re-enable the plugin to re-trigger the prompt, then paste a fresh credential pair from Settings → Claude Connector.

### "Update button is greyed out in Cowork"
Cowork's marketplace cache hasn't caught up. Three-dot menu on the marketplace (not the plugin) → **Check for updates**. If it stays greyed out for more than a day, remove and re-add the marketplace.

### "Tools worked yesterday, not today"
Most likely the user revoked the credential pair from the dashboard. Walk them through Step 2.

### "Upload step hangs / image upload fails"
The upload PUT goes directly to a storage CDN. Tell the user to enable **Settings → Capabilities → Allow Network Egress → All Domains** in Cowork. The CDN uses subdomain-per-bucket, so single-domain allowlists don't catch it.

### "I have multiple pen names but only see one"
The `aa_list_accounts` call returned the user's primary pen name. To switch, tell the user:
> "Say 'list my pen names' and pick the one you want, then 'switch to [pen name]'."

See the `pen-names` skill for the full multi-pen-name flow.

## What the user does NOT need to do

- Generate or paste an `aa_sk_` API key. That's for REST/Make.com/Zapier callers, not the plugin.
- Run a browser OAuth flow. v3.2 dropped the browser-redirect Authorization Code dance — credentials go directly in the plugin config.
- Edit `~/.config/author-automations/config.json`. The plugin doesn't use a local config file.
- Install Node.js, bun, or any binary. The plugin is pure HTTP MCP.

If a user is following older instructions that mention any of those, they're reading v1, v2, or early-v3 docs. Point them at `https://authorautomations.social/docs/connect`.
