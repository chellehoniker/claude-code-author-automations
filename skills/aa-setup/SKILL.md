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

## How v3.3+ setup works

Two parts, intentionally split:

1. **The connector** — added manually via Cowork's "Add custom connector" dialog. Lives at `https://authorautomations.social/api/mcp` and authenticates with a Client ID + Client Secret pair the user generates from their dashboard. Cowork runs OAuth `client_credentials` against our token endpoint and mints a Bearer JWT for each MCP request.
2. **The plugin** — installed via the marketplace. Adds skills (`pen-names`, `instagram-reels`, `threads-post`, etc.) and slash commands (`/aa-post`, `/aa-campaign`). No connector bundled.

Earlier plugin versions (v3.0–v3.2) tried to bundle the connector via `.mcp.json`. That auto-created a connector entry with the OAuth Client ID/Secret fields LOCKED, so users couldn't enter credentials and the OAuth dance silently failed. v3.3 removes the bundled connector — splitting setup in two unblocks the credential paste.

## Setup Flow

### Step 1 — Try a tool

Call `aa_list_accounts`. Three possible outcomes:

**(a) Tool returns data or an empty list** — connected and authorized. Skip to Step 4.

**(b) Tool returns 401 / "Invalid client credentials"** — connector exists but credentials are wrong, missing, or revoked. Go to Step 2.

**(c) `aa_list_accounts` isn't an available tool at all** — no connector exists. Go to Step 3.

### Step 2 — Update the connector's credentials

Tell the user:

> "The connector needs a fresh Client ID and Client Secret. Open https://authorautomations.social/dashboard/settings, find the **Claude Connector** card, click **Generate credential pair**, and copy both values. The Client Secret is shown only once — copy carefully."

Then walk them through pasting:

> "In Cowork: **Settings → Connectors**, click the **Author Automations** connector, scroll to **Advanced settings**, paste the new Client ID and Client Secret, and click Save. The connector should re-authenticate within seconds."

If they still hit 401 after fresh credentials: check if the credentials they're using were generated under a different account than the one currently signed into Cowork. Each credential pair is bound to a specific dashboard user.

### Step 3 — Add the connector for the first time

Tell the user:

> "First, generate a credential pair: open https://authorautomations.social/dashboard/settings, find the **Claude Connector** card, click **Generate credential pair**. Copy the Client ID (starts with `aacw_`) and Client Secret (starts with `aacs_`). The Secret is shown only once.
>
> Then in Cowork: **Settings → Connectors → Add custom connector**.
> - Name: **Author Automations**
> - Remote MCP server URL: `https://authorautomations.social/api/mcp`
> - Open **Advanced settings** and paste the Client ID and Client Secret.
> - Click **Add**.
>
> The connector goes live within seconds. After it's added, run any AA Social command and the tools should respond."

If the user previously installed plugin v3.0–v3.2 and has a stuck `author-automations` connector with locked OAuth fields, tell them:

> "Remove the existing connector first: **Settings → Connectors → author-automations → Remove**. Then add a fresh one with the steps above. The locked-field issue was a side-effect of how the old plugin bundled its connector — v3.3 unbundled it specifically so the manual flow with editable credentials is the only path."

### Step 4 — Confirm

> "You're all set. Try asking me to 'list my connected social accounts', 'create a post about [topic]', 'schedule a Trial Reel for my book launch', or 'start a 14-day campaign for my spring release'."

## Troubleshooting Reference

### "Connection has expired" / "Connection issue"
The connector's tokens expired and refresh failed (usually because credentials were revoked or rotated). Walk through Step 2 — generate a fresh credential pair and paste it into the existing connector's Advanced settings.

### "Add custom connector" dialog has locked OAuth fields
This happens when a plugin auto-installs a connector — Cowork locks the OAuth fields because it thinks the plugin manages them. The user should delete that auto-installed connector and add a fresh one via the global "Add custom connector" path (not from inside the plugin's Connectors panel). v3.3+ doesn't bundle a connector, so new installs shouldn't hit this — but legacy v3.0–v3.2 connectors need to be removed.

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

- Generate or paste an `aa_sk_` API key. That's for REST/Make.com/Zapier callers, not the connector.
- Run a browser OAuth approval flow. v3.2 dropped that path — the connector uses `client_credentials` grant against our token endpoint and the user's pasted Client ID + Secret.
- Edit `~/.config/author-automations/config.json`. Plugin doesn't use a local config file.
- Install Node.js, bun, or any binary.

If a user is following older instructions that mention any of those, they're reading v1, v2, or early-v3 docs. Point them at `https://authorautomations.social/docs/connect`.
