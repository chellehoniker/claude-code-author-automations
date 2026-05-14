---
name: linkedin-post
description: Use when the user wants to post to LinkedIn, share a PDF/document, or include an external link on LinkedIn. Triggers on "linkedin", "li post", "linkedin document", "linkedin pdf", "linkedin link", "first comment", "linkedin reach hack".
---

# LinkedIn — The First-Comment URL Trick + Document Posts

## When to Use

- User wants to post to LinkedIn
- User wants to include a link to their book, article, or sales page
- User wants to share a PDF or document
- User asks about LinkedIn engagement / reach

This skill writes the right `linkedinOptions` block. Hand scheduling back to `social-post`.

## The unique LinkedIn rule: links kill reach

LinkedIn's algorithm down-ranks posts that contain external links in the main caption — typical hit is **40–50% lower reach** vs an otherwise identical post without a link. This is well-documented and platform-confirmed.

The workaround every LinkedIn growth account uses: **put the URL in the first comment, not the caption.** LinkedIn's reach-suppression only scans the caption; comments are exempt.

So whenever the user wants to share a link on LinkedIn:

1. Write the caption WITHOUT the URL — instead, end with "Link in the comments 👇" or similar.
2. Put the URL in `firstComment`.

The AA system auto-posts `firstComment` as the first comment immediately after publish, so the user gets the comment-link UX without manual follow-up.

ASK THE USER if they don't explicitly say where to put the link: *"On LinkedIn, external links in the caption tank reach by 40-50%. I'll put the URL in the first comment instead — that's the standard reach-preserving move. OK?"*

## Disabling link previews

LinkedIn auto-generates a preview card for any URL in the post. Sometimes that's good (book covers, sales pages with og:image). Sometimes it's noisy (the preview hijacks visual focus).

Set `disableLinkPreview: true` to suppress the auto-card. Useful when:
- The user has a custom image they want featured
- The URL points at a page without good OG metadata

Defaults to `false` (preview shown).

## Document posts (PDF)

LinkedIn lets you attach a PDF/document. The platform renders it as a swipeable preview card — high engagement on LinkedIn vs link-out-to-PDF.

When the user uploads a PDF as media:
- Set `documentTitle` — REQUIRED. Headline above the PDF preview.
- 1–140 chars, no emoji.
- If the user doesn't supply one, ask: *"What headline should sit above the PDF? (e.g. 'Indie Author Marketing Playbook — 12 pages')"*

The system falls back to the filename if you don't set `documentTitle`, but filenames make for ugly headlines. Always set it explicitly.

## Personal vs Company Page

LinkedIn supports posting to either the user's personal profile or a Company Page they admin. `organizationUrn` selects which.

- If the user has only a personal account connected → omit `organizationUrn`. Default works.
- If they have a Company Page connected and want to post there → pass the urn (call `GET /v1/accounts/{id}/linkedin-organizations` to list).

The user typically tells you which: "post to my company page" vs "post to my profile."

## Flow

### Step 1: Verify the user has a LinkedIn account connected

Call `aa_list_accounts`.

### Step 2: Decide where the link goes

If the post includes a URL:
- Default: URL in `firstComment`, caption ends with "Link in the comments 👇"
- Override: if the user explicitly says "put the link in the post," respect that, but note the reach trade-off.

### Step 3: Build the post

```js
aa_create_post({
  content: "<caption — no URL; end with 'Link in the comments 👇' if applicable>",
  accountIds: ["<linkedin-account-id>"],
  scheduledAt: "<ISO timestamp>",
  linkedinOptions: {
    firstComment: "https://example.com/sales-page",  // URL lives here
    disableLinkPreview: false,                        // unless user wants no card
    // documentTitle: "<headline>",                   // PDF posts only
    // organizationUrn: "urn:li:organization:...",    // company page only
  }
})
```

### Step 4: Hand off to social-post for scheduling

## Caption style on LinkedIn

LinkedIn rewards a specific caption shape:
- **Hook in the first 2 lines** (the "see more" cutoff). Lead with a result, an opinion, or a question. Never bury the lede.
- **Short paragraphs**, single sentences per line. The platform formats with whitespace; long paragraphs collapse engagement.
- **Professional but personal voice.** Stories outperform tips outperform pure promotion.
- **No more than 1-3 hashtags.** LinkedIn is hashtag-light; spam tanks reach.

## Common mistakes to avoid

- **Pasting the URL into the caption.** 40-50% reach hit. Use `firstComment`.
- **Forgetting `documentTitle` on a PDF post.** Falls back to the filename, which looks unprofessional.
- **Setting `disableLinkPreview: true` when you wanted the OG card.** Default is `false`; only flip when you have a custom image AND want it to be the visual focus.
- **5+ hashtags.** LinkedIn isn't Instagram. Stop.
- **Posting to a company page without admin access.** The post silently fails. Confirm via `aa_list_accounts` that the org appears in the user's connected accounts.
