---
name: aa-setup
description: Use when the user wants to set up, configure, or connect Author Automations Social. Also triggers when AA Social tools return authentication errors.
---

# Author Automations Social Setup

## When to Use
- User says "set up author automations", "connect my social accounts", "configure AA Social"
- An `aa_*` tool returns an authentication error
- User asks how to get started with social media scheduling

## Setup Flow

1. **Ask for API key**: The user needs their API key from Author Automations Social.
   Tell them: "You'll need your API key from Author Automations Social. Go to https://authorautomations.social/dashboard/settings and look for the API Key section. Click 'Generate API Key' if you haven't already. The key starts with `aa_sk_`."

2. **Save the config**: Once they provide the key, save it:
   ```bash
   mkdir -p ~/.config/author-automations
   echo '{"apiKey":"THE_KEY_HERE"}' > ~/.config/author-automations/config.json
   ```

3. **Test the connection**: Call `aa_list_accounts` to verify the key works.
   - If it succeeds, show them their connected accounts
   - If it fails, ask them to double-check the key

4. **Confirm setup**: "You're all set! You can now create posts, manage campaigns, and schedule content. Try asking me to 'create a post about [topic]' or 'start a 7-day campaign for [goal]'."

## Config File Location
`~/.config/author-automations/config.json`

```json
{
  "apiKey": "aa_sk_..."
}
```
