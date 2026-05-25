---
name: organize-with-labels
description: Use when the user wants to tag, filter, or categorize their posts — by series, theme, campaign, tone, or any custom grouping. Triggers on "label my posts", "tag this", "filter to my evergreen posts", "categorize my book launch posts", "give me a tag for X", "organize my calendar".
---

# Labels — tag and group posts for filtering

Labels are user-defined tags attached to posts. They drive calendar filters, queue filtering, and quick "show me all my launch posts" views. A post can carry multiple labels.

## Quick facts

- **Pen-name-scoped.** Labels live per pen name — every label tool takes `profileId`. Switch context first via `pen-names` and carry the resolved `profileId` through every call.
- A label has: `name` (free text, unique per pen name), `color` (hex `#rrggbb`).
- A post can have **multiple** labels. The post↔label join is set wholesale via `aa_set_post_labels` (PUT-style — replaces the full set).
- Default colors when the user gives no preference: blue `#3b82f6` for launches, green `#22c55e` for evergreen, amber `#f59e0b` for promotional, rose `#f43f5e` for limited-time, slate `#64748b` for general.

## Decision tree

| User says... | Tool |
|---|---|
| "What labels do I have" / "Show me my tags" | `aa_list_labels` |
| "Create a label called 'Book Launch'" | `aa_create_label` |
| "Rename my Launch label to Book Launch" / "Change the color of my Evergreen label" | `aa_update_label` |
| "Delete the Old Stuff label" | `aa_delete_label` |
| "What labels are on this post" | `aa_get_post_labels` |
| "Tag this post as Launch" / "Add Evergreen to that post" / "Remove the Promo label from these" | `aa_set_post_labels` (UNION existing — see below) |
| "Label all my book launch posts" | `aa_list_posts` to find, then `aa_set_post_labels` per post |

## Flow

### Always list existing labels first

Call `aa_list_labels` before creating anything. Users routinely ask for a label that already exists under a slightly different name ("Launches" vs "Launch" vs "Book Launch"). Surface the closest match and ask before creating a duplicate.

### Creating a new label

1. Confirm the name doesn't already exist (case-insensitive match against the list above).
2. Pick a color: if the user gave a meaning ("amber for promos"), use that. Otherwise pick from the defaults above based on the label semantic.
3. Call `aa_create_label({ name, color, profileId? })`.

### Setting labels on a post — UNION, don't clobber

`aa_set_post_labels` is a **PUT** — it replaces the full set of labels on the post. If the user says "add Evergreen to this post," you MUST:

1. Call `aa_get_post_labels({ postId, profileId? })` to read the current set.
2. Add the new label id to the existing list.
3. Call `aa_set_post_labels({ postId, labelIds: [...existing, newId], profileId? })`.

Skipping step 1 silently strips every other label the user had on that post.

When the user explicitly says "REPLACE the labels on this post with X" or "clear all labels and just set Launch," skip the read — pass only the new ids (or `[]` to clear).

### Bulk-labeling a group of posts

Pattern: "label all my book launch posts as Launch."

1. `aa_list_posts({ profileId?, /* filters: status, dateRange, search, etc. */ })` to get the candidate set.
2. Show the user the matched posts and confirm the count ("Found 12 posts matching 'book launch' — label all of them?").
3. For each post: read existing labels (`aa_get_post_labels`), union the new label id, call `aa_set_post_labels`.
4. Report: "Tagged 12 posts with Launch."

This is N+1 calls — for sets larger than ~50 posts, warn the user it'll take a moment.

## Editing + deleting labels

- **Update** — `aa_update_label({ labelId, name?, color? })`. Omitted fields stay as-is.
- **Delete** — `aa_delete_label({ labelId })`. Removing a label drops it from every post it was on. Confirm before firing on any label that's attached to >5 posts: "The Launch label is on 23 posts — deleting it will remove that tag from all of them. Proceed?"

## Common pitfalls

- **Clobbering existing labels** via `aa_set_post_labels` without reading first. This is the single most common mistake — always union unless the user said "replace."
- **Creating duplicates** by skipping `aa_list_labels`. Two labels named "Launch" and "Launches" both half-populated is worse than one consolidated label.
- **Forgetting `profileId`.** Labels are per pen name; tagging a post under the wrong pen name's namespace silently no-ops from the user's perspective.
- **Picking garish colors.** Stick to the muted palette above — the calendar gets visually noisy fast when every label is saturated red.
