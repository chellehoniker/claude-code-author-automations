---
name: guides-author
description: Use when the user wants to create, view, edit, or delete a content guide or persona. Triggers on phrases like "edit my brand guide", "update my prose guide", "create a new persona", "add a sub-brand for my Spicy Romance series", "rename my default persona", "delete my Old Voice persona", "fix the dialogue section in my prose guide", "what does my social media guide say".
---

# Authoring content guides + personas

Guides are the user's brand voice. Every campaign, post, and AI-written caption reads them. This skill walks the user through editing existing guides and creating new ones — through chat, with the user staying in control of every change.

## The model in one paragraph

A pen name has one or more **personas** (also called "guide sets"). Each persona has a user-defined `tag` name (`primary`, `Cozy Mystery`, `Spicy Romance Series`, etc.) and exactly one persona is marked the **default** (the fallback when a generation doesn't specify a tag). Each persona carries **four guides**, each a long block of free-form text:

- **brand_guide** — author identity: pen name, genres, target audience, taglines, mission, personality keywords, voice + tone, visual identity, bio.
- **prose_guide** — fiction writing rules: narrative tone, sentence rhythm, dialogue style, description, pacing, character voice, tension, romance conventions, magic system (if applicable), word choice, punctuation, scene examples.
- **copywriting_guide** — non-fiction writing rules for newsletters, blog posts, press releases, emails, marketing copy: voice + POV, formality, engagement style, language, humor, CTAs, writing samples.
- **social_media_guide** — platform strategy, content pillars, audience targeting, hashtags, emoji style, topics to avoid.

The image-style prompt is separate (one per pen name, lives on `user_ai_settings`) and isn't editable through this skill — point users at Settings → AI for that.

## Decision tree — when to use each tool

| User says... | Tool |
|---|---|
| "What does my brand guide say" / "Show me my prose guide for Cozy Mystery" | `aa_get_guides` (read; pass `tag` if not the default) |
| "What personas do I have" / "List my guide sets" | `aa_list_guide_sets` |
| "Edit the dialogue section in my prose guide" / "Add new social pillars" | `aa_update_guide` (PUT — upserts ONE OR MORE guide fields) |
| "Create a new persona for my Spicy Romance series" | `aa_update_guide` with a never-before-seen tag (the row is created on first PUT) |
| "Rename my Cozy Mystery persona to Cozy Mystery Series" | `aa_rename_guide_set` |
| "Delete my Old Voice persona" | `aa_delete_guide_set` (refuses to delete the default — see below) |

## Editing flow — the "show diff first" rule

Guide content is LONG (a full prose guide can run 400+ lines). Never silently rewrite hundreds of lines. The flow:

### 1. Read the current guide

`aa_get_guides({ tag })` returns the four guides plus the persona name. Read the relevant guide(s) to ground yourself in the user's actual voice — don't generate from scratch.

### 2. Identify the section the user wants to change

Each guide is structured by named sections (see the question library at the bottom). Map the user's intent to the right guide AND the right section:

- "Update my dialogue style" → `prose_guide` → DIALOGUE STYLE section
- "Change my hashtags" → `social_media_guide` → KEYWORD & HASHTAG STRATEGY section
- "Update my CTAs" → `copywriting_guide` → STORYTELLING & CTAS section
- "Refresh my bio" → `brand_guide` → CORE MESSAGING (Author Bio)

### 3. Propose the change

Show the user a SHORT diff:
- Quote the existing 1–3 paragraphs of the section being changed (cut off mid-paragraph if needed — the user knows their guide).
- Show your proposed replacement.
- Highlight what's different.

Don't show the unchanged sections. Don't paste the entire 400-line guide in chat. Be tight.

### 4. Confirm before writing

Ask "Apply this change?" Wait for explicit yes. Don't take silence as consent.

### 5. Write

Call `aa_update_guide` with the FULL new text of the affected guide field. The tool overwrites the whole field — the section-level edit is happening in your head, the tool just stores the resulting full text. Pass only the field(s) that changed; omit the others.

Example for changing prose dialogue:
```
aa_update_guide({
  tag: "Cozy Mystery",
  prose_guide: "<full new prose guide text with the DIALOGUE STYLE section updated>"
})
```

### 6. Confirm

Tell the user what got saved and offer to make further edits.

## Cross-guide overlap — surface it, don't auto-update

Several sections appear (in different shapes) across multiple guides:

| Theme | Where it appears | Notes |
|---|---|---|
| Voice & tone | `brand_guide` (Personality Keywords), `copywriting_guide` (Voice & POV), `prose_guide` (Narrative Tone) | Often slightly different framings of the same voice |
| Topics to avoid | `copywriting_guide` (Words & Phrases I Avoid), `social_media_guide` (Topics to Avoid), `prose_guide` (Forbidden Vocabulary) | These should usually align |
| Sample writing | `copywriting_guide` (Writing Samples), `prose_guide` (Scene Examples) | Different audience but should reflect the same voice |

When the user changes voice/tone in one guide, OFFER to check the others — don't auto-cascade. Example:

> "I've updated the Voice & POV section in your copywriting guide. The brand guide's Personality Keywords ('whimsical, salt-kissed, enchanting, communal') and the prose guide's Narrative Tone description are also voice-related. Want me to read those and check whether they still align?"

Let the user decide whether the change ripples.

## Creating a new persona

A persona is "born" by writing initial guide content under a never-before-seen `tag`. There's no separate `aa_create_persona` tool — `aa_update_guide` with a new tag does the create.

### Walking the user through a fresh persona

This takes a while. Suggest doing it in stages — don't try to fill all four guides in one chat unless the user explicitly wants to.

**Stage 1 — name + brand basics** (`brand_guide`)
- Persona tag (the name they'll address it by — e.g., "Spicy Romance Series")
- Genre / sub-niche
- Target audience (be specific — age range, reading habits, what they avoid)
- Unique differentiator (what sets this voice apart)
- Tagline / slogan (one short line)
- Brand mission (1–2 paragraphs — purpose, perspective, promise)
- Personality keywords (4–6 single words)
- Voice & tone (1–2 paragraphs of HOW the voice sounds)
- Bio (third-person, 1–2 paragraphs — how this persona presents to readers)

Compose into a brand_guide text matching the existing brand guide structure (see question library). Show, confirm, save.

**Stage 2 — prose guide** (only if persona writes fiction)
- Narrative tone (1 paragraph + a CORRECT/INCORRECT example pair)
- Sentence rhythm + paragraph structure preferences
- Dialogue style (Southern? Direct? Sarcasm? Per-character voices?)
- Description priorities (what sensory details matter)
- Pacing approach
- Character voice differentiation (per-character speech patterns)
- Tension / conflict conventions (cozy = no graphic violence, etc.)
- Romance conventions (heat level, forbidden phrases)
- Word choice (preferred + forbidden vocabulary)
- Punctuation quirks (em dashes? Ellipses?)
- Genre conventions (cozy mystery requirements, paranormal additions, etc.)
- Scene examples (1–3 short examples in the persona's voice)

**Stage 3 — copywriting guide**
- Voice & POV by content type (newsletters first-person? Press releases third-person?)
- Formality level (casual / casual-but-organized / professional / formal)
- Engagement style (newsletter format, email replies, social posts)
- Personal engagement level (how hands-on with reader DMs)
- Language & style (preferred phrases, forbidden phrases)
- Humor style
- Punctuation quirks
- Storytelling approach (1 paragraph)
- CTA style (5 sample CTAs)
- Writing samples (1 email reply, 1 newsletter opening, 1 announcement)

**Stage 4 — social media guide**
- Primary platforms + per-platform strategy
- Posting cadence per platform
- Content pillars (5 sets of ~5 themes each)
- Audience targeting (3–4 specific audience segments)
- Hashtag sets (~9 per category)
- Per-platform hashtag strategy
- Emoji style
- Topics to avoid

Each stage compiles into the right guide field. Save after each stage so the user can pause and resume.

## Renaming a persona

`aa_rename_guide_set` does the rename in-place. The is_default flag and all four guide texts travel with the rename — fallback lookups still resolve correctly.

Two error cases:
- **404** — the from_tag doesn't exist. Tell the user, suggest `aa_list_guide_sets` to see actual names.
- **409** — a persona named to_tag already exists. The user must pick a different name OR delete the colliding persona first.

## Deleting a persona

`aa_delete_guide_set` removes the row entirely (all four guide texts disappear).

The server **refuses to delete the default persona** — every fallback lookup resolves to it, so deleting it would leave generations with empty guides. If the user wants to delete the default:

1. Tell them they need to mark a different persona as the default first.
2. Point them at the dashboard's Settings → Guides page (the dashboard has UI for setting the default; the chat surface doesn't yet).
3. After they've changed the default in the dashboard, retry `aa_delete_guide_set`.

For non-default personas, delete works directly. Confirm with the user before calling — this is destructive, and recreating four guide-texts from memory is painful.

## Question library — what to ask for each section

Use these as conversational prompts. Don't dump them as a literal questionnaire — weave them into the conversation as the user works through a section.

### Brand guide questions

- **Genre**: "What genre and sub-niche does this persona write in? Be specific — 'cozy mystery' is broader than 'gulf coast paranormal cozy mystery with witches and shapeshifters'."
- **Target audience**: "Two or three reader segments — for each, give me their age range, how many books they read a month, where they buy them, what they love, and what they avoid."
- **Differentiator**: "What's the one thing your books do that nobody else's do? A specific magic system rule, a setting hook, a relationship dynamic — the thing readers can't get from a similar-shelf book."
- **Tagline**: "One short line that captures the vibe — sub-15 words."
- **Mission**: "Two short paragraphs: who this persona is, what they bring to readers, and what they promise."
- **Personality keywords**: "Four to six single words that describe the voice — adjectives like 'whimsical, salt-kissed, enchanting, communal'."
- **Voice & tone**: "One paragraph: how does this voice SOUND to readers? Use a metaphor or comparison if it helps — 'like a trusted tour guide who knows where the secrets are'."
- **Bio**: "Two short third-person paragraphs that you'd put on Amazon's author page or the back of a book."

### Prose guide questions

- **Narrative tone**: "One sentence describing the voice (e.g., 'whimsical, warm, and conspiratorial'), then 1–2 sentences explaining what that means in practice. Then give me an example of the right tone, and an example of what's WRONG (over-explained, too literal, dialect overdone, etc.)."
- **Dialogue style**: "Southern Texas? Direct? Sarcastic? Do supernatural species in your world have distinct speech patterns? Give me 5 phrases your characters would use, and 5 they wouldn't."
- **Description**: "What sensory details matter most in your scenes? (e.g., 'salt air, golden hour light, weathered wood'.) Are there specific regional references that have to land authentically?"
- **Pacing pattern**: "How does a scene flow in your books? Open with X, build through Y, climax at Z?"
- **Word choice**: "List five word/phrase categories that would BREAK immersion if they appeared (e.g., 'sci-fi tech terms', 'grimdark fantasy phrases', 'graphic violence vocabulary')."

### Copywriting guide questions

- **POV by content type**: "First or third person for newsletters? Emails? Press releases? Blog posts? Social? Be specific per format."
- **Formality**: "On a 1–4 scale (1 = casual, 4 = formal), where do your reader emails sit? Newsletters? Press releases?"
- **Engagement**: "Describe one or two recurring newsletter sections you'd love to run. What questions would you ask readers? How would you respond to a fan email?"
- **CTAs**: "Give me 3–5 sample call-to-action lines in your voice. Promotional ('grab your copy') AND community ('what do you think?')."

### Social media guide questions

- **Platforms**: "Which platforms does this persona prioritize, and why? Match each to one or two demographics it reaches best."
- **Content pillars**: "5 themes you'd post about. For each, give me 3–5 specific content ideas."
- **Audience targeting**: "Three target segments with platforms they're active on, content types they engage with, and creators they follow."
- **Hashtags**: "8–12 hashtags per platform, mixing broad (#CozyMystery) and niche (#GulfCoastWitches)."
- **Emoji style**: "Minimal? Heavy? Specific signature emojis? Tied to seasons or themes?"
- **Topics to avoid**: "Five categories of content this persona steers clear of — graphic content, politics, controversy, personal medical, competitor drama, etc."

## Common mistakes to avoid

- **Don't generate full guide content from a one-line prompt.** "I want a Spicy Romance persona" → ASK the question-library questions. Don't make up a genre, audience, or voice from thin air.
- **Don't show the user 400 lines of generated text and ask them to read it.** Build incrementally — Stage 1, save, Stage 2, save. Each stage takes 5–15 minutes of focused work.
- **Don't try to delete the default persona.** Surface the "set a different default first" workflow rather than retrying with different syntax.
- **Don't auto-cascade voice changes across guides.** Suggest, ask, then act. Cross-guide consistency is valuable, but the user owns the decision.
- **Don't paste the user's API responses back to them verbatim.** When you read a guide via `aa_get_guides`, summarize what you found ("your prose guide opens with a 'whimsical, warm, and conspiratorial' tone and runs about 400 lines") — don't dump the whole text unless they asked.
