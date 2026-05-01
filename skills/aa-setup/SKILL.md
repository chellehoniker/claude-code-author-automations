---
name: aa-setup
description: Use when the user wants to set up, configure, or connect Author Automations Social. Also triggers when aa_* tools return authentication errors, the OAuth authorize prompt is failing, or the tools aren't appearing in your toolkit at all.
---

# Author Automations Social Setup

## When to Use
- User says "set up author automations", "connect my social accounts", "configure AA Social"
- An `aa_*` tool returns an authentication error or 401
- The `aa_*` tools aren't appearing at all in your tool list
- The OAuth authorize browser window failed to complete
- User asks how to get started with social media scheduling

## How v3 authentication works

The plugin bundles a remote MCP server at `https://authorautomations.social/api/mcp`. There's no local config file, no API key paste, no binary download. Authentication is OAuth 2.1 with PKCE:

1. Claude Code or Cowork detects the plugin's `.mcp.json`
2. On the first tool call, the client opens a browser window to `https://authorautomations.social/authorize?...`
3. The user signs in (or is already signed in) and clicks **Approve**
4. The browser closes; the client stores the access token and refreshes it automatically

Some hosts (notably some Cowork builds) may instead ask for a **Client ID** and **Client Secret**. That's the manual auth path. The user generates a credential pair at `https://authorautomations.social/dashboard/settings#cowork` and pastes both values into the host's connector form. Same credentials, same backend.

The canonical install walkthrough is at `https://authorautomations.social/docs/connect`.

## Setup Flow

### Step 1 — Try a tool

Call `aa_list_accounts`. Three possible outcomes:

**(a) Tool returns data or an empty list** — connected and authorized. Skip to Step 4 (confirm).

**(b) Tool returns an auth error / 401 / "unauthorized"** — the OAuth handshake either hasn't happened or the token expired and refresh failed. Go to Step 2.

**(c) `aa_list_accounts` isn't an available tool at all** — the MCP server didn't connect. Go to Step 3.

### Step 2 — Re-authorize

Tell the user:

> "I need you to authorize the connector. The next time I call a plugin tool, your browser should open to a page on authorautomations.social. Sign in if needed and click **Approve**."

Then call `aa_list_accounts` again. The host should prompt for authorization. After they approve, the call succeeds.

If the host asks for **Client ID** and **Client Secret** instead of opening a browser:

> "Your host wants the manual auth path. Open a new tab to https://authorautomations.social/dashboard/settings, scroll to the **Claude Cowork Connector** card, click **Generate credential pair**, and copy the Client ID (starts with `aacw_`) and Client Secret (starts with `aacs_`). Paste both into the connector form here. The secret is shown once — copy carefully."

### Step 3 — MCP server didn't connect

Almost always one of these:

1. **Cowork hasn't refreshed since the plugin installed.** Tell the user:
   > "Fully quit Cowork (Cmd+Q on Mac, right-click tray icon → Quit on Windows — not just close the window) and reopen. The connector will attach on the next session."

2. **Plugin install is incomplete.** Tell the user:
   > "Open the marketplace: Settings → Plugins → click the three-dot menu on the marketplace and choose **Check for updates**. If 'Author Automations Social' shows an update, install it. Then fully restart Cowork."

3. **Network egress is locked down.** The remote MCP server lives at `authorautomations.social`. If Cowork can't reach it, no tools load. Tell the user:
   > "Open Cowork **Settings → Capabilities → Allow Network Egress** and set it to **All Domains**. The connector needs to talk to authorautomations.social."

### Step 4 — Confirm

> "You're all set! You can now create posts, manage campaigns, and schedule content. Try asking me to 'create a post about [topic]', 'schedule a Trial Reel for my book launch', or 'start a 14-day campaign for my spring release'."

## Troubleshooting Reference

### "Authorize page fails or hangs"
The user is probably signed into a different account than the one they think. Have them open `https://authorautomations.social/dashboard` in a regular browser tab, confirm they're on the right account (top-right user menu), and retry the authorize step.

### "Update button is greyed out in Cowork"
Cowork's marketplace cache hasn't caught up. Three-dot menu on the marketplace (not the plugin) → **Check for updates**. If it stays greyed out for more than a day, remove and re-add the marketplace.

### "Tools worked yesterday, not today"
Token refresh probably failed. Re-trigger an authorize prompt by calling any tool. If the host doesn't auto-prompt, suggest fully quitting and reopening Cowork — that forces a fresh OAuth dance on next tool call.

### "Upload step hangs / image upload fails"
The upload PUT goes directly to a storage CDN. Tell the user to enable **Settings → Capabilities → Allow Network Egress → All Domains** in Cowork. The CDN uses subdomain-per-bucket, so single-domain allowlists don't catch it.

### "I have multiple pen names but only see one"
The `aa_list_accounts` call returned the user's primary pen name. To switch, tell the user:
> "Say 'list my pen names' and pick the one you want, then 'switch to [pen name]'. The pen-names skill will route subsequent calls to that pen name."

See the `pen-names` skill for the full multi-pen-name flow.

## What the user does NOT need to do

- Generate or paste an `aa_sk_` API key. That's for REST/Make.com/Zapier callers, not the plugin.
- Edit `~/.config/author-automations/config.json`. The v3 plugin doesn't use a local config file.
- Install Node.js, bun, or any binary. v3 is pure HTTP MCP.

If a user is following older instructions that mention any of those, they're reading v1 or v2 docs. Point them at `https://authorautomations.social/docs/connect`.
