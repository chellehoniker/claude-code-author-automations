---
name: aa-setup
description: Use when the user wants to set up, configure, or connect Reader Radius (formerly Author Automations Social). Also triggers when aa_* tools return authentication errors, the connector says "Connection has expired" or won't authenticate, or the tools aren't appearing in your toolkit at all.
---

# Author Automations Social Setup

## When to Use
- User says "set up author automations", "connect my social accounts", "configure AA Social"
- An `aa_*` tool returns 401 / "unauthorized" / "Invalid client credentials"
- The connector card shows "Connection has expired" or "Connection issue"
- The `aa_*` tools aren't appearing at all in your tool list
- User asks how to get started with social media scheduling

## How setup works (v3.15+)

Two parts, intentionally split:

1. **The connector**: added in Claude's "Add custom connector" dialog with one address, `https://readerradius.com/api/mcp`. There's no Client ID or Secret to paste: Claude registers itself, the author signs in to Reader Radius, ticks the pen names Claude may use, and approves. Each approved app shows under **Your connected apps** on the AI setup page (or Settings → Integrations), where the author can disconnect it.
2. **The plugin**: installed via the marketplace. Adds skills (`pen-names`, `instagram-reels`, `threads-post`, etc.) and slash commands (`/aa-post`, `/aa-campaign`). No connector bundled.

Connectors set up earlier with a Client ID and Client Secret keep working; there's no need to replace them. Pairs are still available under **Advanced: use a client ID and secret** on the AI setup page, for apps that can't sign in on their own. ChatGPT and Codex are different: they use `https://readerradius.com/api/mcp/chatgpt` and a pair the author selects while signing in (never pasted into ChatGPT).

## Setup Flow

### Step 1 — Try a tool

Call `aa_list_accounts`. Three possible outcomes:

**(a) Tool returns data or an empty list** — connected and authorized. Skip to Step 4.

**(b) Tool returns 401 / "unauthorized" / "revoked"** — the connector exists but its connection was disconnected, revoked or expired. Go to Step 2.

**(c) `aa_list_accounts` isn't an available tool at all** — no connector exists. Go to Step 3.

### Step 2 — Reconnect the existing connector

Tell the user:

> "In Claude: **Settings → Connectors**, click **Reader Radius**, then **Connect** (or **Reconnect**). Sign in to Reader Radius, choose the pen names Claude can use, and click **Approve**."

If the connector was set up with a Client ID and Secret that has since been revoked, removing the connector and adding it again with just the address (Step 3) is simplest.

If they still hit 401: they may be signed in to a different Reader Radius account than the one with the subscription. Sign out of Reader Radius in the browser and reconnect.

### Step 3 — Add the connector for the first time

Tell the user:

> "In Claude: **Settings → Connectors → Add custom connector** (the global plus button, not the one inside a plugin).
> - Name: **Reader Radius**
> - Remote MCP server URL: `https://readerradius.com/api/mcp`
> - Leave **Advanced settings** empty.
> - Click **Add**, then **Connect**. Sign in to Reader Radius, choose the pen names Claude can use, and click **Approve**."

In **Claude Code** (terminal), the equivalent is:

```
claude mcp add --transport http --scope user reader-radius https://readerradius.com/api/mcp
```

Then run `/mcp`, select **reader-radius**, choose **Authenticate**, and approve in the browser.

If the user previously installed plugin v3.0–v3.2 and has a stuck `author-automations` connector with locked OAuth fields, tell them:

> "Remove the existing connector first: **Settings → Connectors → author-automations → Remove**. Then add a fresh one with the steps above."

### Step 4 — Confirm

> "You're all set. Try asking me to 'list my connected social accounts', 'create a post about [topic]', 'schedule a Trial Reel for my book launch', or 'start a 14-post campaign for my spring release'."

## Troubleshooting Reference

### "Connection has expired" / "Connection issue"
The connector's sign-in expired or was disconnected. Walk through Step 2: click Connect, sign in, approve.

### "Add custom connector" dialog has locked OAuth fields
This happens when a plugin auto-installs a connector — Cowork locks the OAuth fields because it thinks the plugin manages them. The user should delete that auto-installed connector and add a fresh one via the global "Add custom connector" path (not from inside the plugin's Connectors panel). v3.3+ doesn't bundle a connector, so new installs shouldn't hit this — but legacy v3.0–v3.2 connectors need to be removed.

### "Update button is greyed out in Cowork"
Cowork's marketplace cache hasn't caught up. Three-dot menu on the marketplace (not the plugin) → **Check for updates**. If it stays greyed out for more than a day, remove and re-add the marketplace.

### "Tools worked yesterday, not today"
Most likely the app was disconnected on the AI setup page (or its credential pair was revoked). Walk them through Step 2.

### "One platform stopped working but the rest are fine"
That's a per-account token problem, not a connector problem, and it has its own diagnosis. Call `aa_get_accounts_health` (or `aa_get_account_health` for a single account you already have the id for). It returns token validity, whether the account needs reconnecting, whether it can still post, granted versus missing OAuth scopes, and plain recommendations. That is the right answer to "why is TikTok returning no analytics" or "why did my Facebook post fail".

The dashboard shows the same thing as a badge on each account card, with a Reconnect button and a count of how many accounts need reconnecting. Reconnecting is a browser step the user takes, and the one thing to tell them is: **leave every permission box ticked**. A half-granted reconnect looks connected and then fails on the feature whose scope they dropped.

### "Upload step hangs / image upload fails"
The upload PUT goes directly to a storage CDN. Tell the user to enable **Settings → Capabilities → Allow Network Egress → All Domains** in Cowork. The CDN uses subdomain-per-bucket, so single-domain allowlists don't catch it.

### "I have multiple pen names but only see one"
Claude can only use the pen names the author ticked when approving. To change them, reconnect (Step 2) and tick the others. Otherwise the call returned the primary pen name; to switch, tell the user:
> "Say 'list my pen names' and pick the one you want, then 'switch to [pen name]'."

See the `pen-names` skill for the full multi-pen-name flow.

## What the user does NOT need to do

- Generate or paste an `aa_sk_` API key. That's for REST/Make.com/Zapier callers, not the connector.
- Generate or paste a Client ID and Client Secret for Claude. The connector signs in with just the address; pairs are only for apps that can't sign in on their own, and for ChatGPT, where the pair is selected (not pasted) during sign-in.
- Edit `~/.config/author-automations/config.json`. Plugin doesn't use a local config file.
- Install Node.js, bun, or any binary.

If a user is following older instructions that mention any of those, they're reading v1, v2, or early-v3 docs. Point them at `https://readerradius.com/docs/connect`.
