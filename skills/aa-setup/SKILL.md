---
name: aa-setup
description: Use when the user wants to set up, configure, or connect Author Automations Social. Also triggers when AA Social tools return authentication errors, or when the aa_* tools aren't appearing in your toolkit at all (which usually means the binary download failed or Cowork hasn't refreshed yet).
---

# Author Automations Social Setup

## When to Use
- User says "set up author automations", "connect my social accounts", "configure AA Social"
- An `aa_*` tool returns an authentication error
- The `aa_*` tools aren't appearing at all in your tool list — this is almost always either (a) Cowork hasn't refreshed since install (fixed by a full Cowork restart) or (b) the binary download failed (fixed by checking the install error file, see Troubleshooting below)
- User asks how to get started with social media scheduling

## Setup Flow

### Step 1 — Verify the MCP server is connected

Try calling `aa_list_accounts`. Three possible outcomes:

**(a) Tool returns data or an empty list** — server is connected. Skip to Step 2.

**(b) Tool returns an authentication error** ("not configured", "invalid API key") — server is connected, just needs the API key. Skip to Step 2.

**(c) `aa_list_accounts` isn't an available tool at all** — the MCP server didn't load. Two possible causes:

  1. **Cowork hasn't refreshed since the plugin installed.** Most common. Tell the user: "Fully quit Cowork (Cmd+Q on Mac, right-click tray icon → Quit on Windows — not just close the window) and reopen. The MCP server will attach on the next session." After they restart, run /aa-setup again.

  2. **The binary download failed during install.** Less common but real. Check for an install error file. Tell the user: "Let me check the plugin install log." Run a Bash check for `${CLAUDE_PLUGIN_DATA}/.install-error` or look in `${CLAUDE_PLUGIN_ROOT}/mcp-server/.install-error`. If found, read it and surface the message — it'll point at the most common cause (Cowork's network egress setting). Walk the user through:
     > "Open Cowork **Settings → Capabilities → Allow Network Egress**. Toggle it ON and set to 'All Domains'. The plugin needs to download a small binary on first run; the egress block is preventing that. After enabling, fully restart Cowork."

### Step 2 — Get the API key

Tell them:
> "You'll need your API key from Author Automations Social. Go to https://authorautomations.social/dashboard/settings and look for the API Key section. Click 'Generate API Key' if you haven't already. The key starts with `aa_sk_`."

### Step 3 — Save the config

Once they provide the key, save it:

```bash
mkdir -p ~/.config/author-automations
echo '{"apiKey":"THE_KEY_HERE"}' > ~/.config/author-automations/config.json
```

### Step 4 — Test the connection

Call `aa_list_accounts` again to verify the key works.

- If it succeeds, show them their connected accounts.
- If it fails with an authentication error, ask them to double-check the key — typo, missing prefix, expired.

### Step 5 — Confirm

> "You're all set! You can now create posts, manage campaigns, and schedule content. Try asking me to 'create a post about [topic]' or 'schedule a Trial Reel for my book launch' or 'start a 14-day campaign for my spring release'."

## Troubleshooting Reference

### "Update button is greyed out in Cowork"

This is normal until Cowork's marketplace cache catches up. From the marketplace settings, click the three-dot menu on the marketplace (not the plugin) → "Check for updates." If it stays greyed out for more than a day, remove and re-add the marketplace.

### "Tools worked yesterday, not today"

Cowork sometimes loses MCP server connections between sessions. Fully quit and reopen. If that doesn't fix it, check for `${CLAUDE_PLUGIN_ROOT}/mcp-server/.install-error` — a network change may have invalidated the binary on a re-download attempt.

### "Upload step hangs / image upload fails"

The upload PUT goes directly to the storage CDN (`*.r2.cloudflarestorage.com`). Tell the user to enable **Settings → Capabilities → Allow Network Egress → All Domains** in Cowork. R2 uses subdomain-per-bucket, so single-domain allowlists don't catch it.

## Config File Location

`~/.config/author-automations/config.json`

```json
{
  "apiKey": "aa_sk_..."
}
```
