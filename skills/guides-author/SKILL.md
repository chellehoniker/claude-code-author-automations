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

### Why we still write all four guides

The four guides feed different prompt paths in the dashboard's AI generation. Skipping any of them — even when content overlaps — leaves blank fields the campaign generator fills with generic defaults. So we DO populate all four. The trick is to ask each underlying question ONCE and use the answer to populate every guide section it informs.

### The de-duped question flow — facets, not guides

The question library at the bottom is organized by **facet** (the underlying thing you're asking about), not by guide. Each facet maps to one or more guide sections; you ask the question once and compile the answer into every section it lands in. The mapping table:

| Facet | Asked once → populates |
|---|---|
| **Identity** (genre, niche, bio) | brand_guide.GENRE + brand_guide.AUTHOR_BIO |
| **Audience** (segments, ages, habits, what they buy + avoid) | brand_guide.TARGET_AUDIENCE + social_media_guide.SOCIAL_MEDIA_TARGET_AUDIENCE |
| **Voice** (keywords, how it sounds, formality) | brand_guide.PERSONALITY_KEYWORDS + brand_guide.VOICE_AND_TONE + copywriting_guide.VOICE_AND_POV + copywriting_guide.FORMALITY + prose_guide.NARRATIVE_TONE |
| **Off-limits** (forbidden vocabulary categories, taboo topics) | prose_guide.FORBIDDEN_VOCABULARY + copywriting_guide.WORDS_AND_PHRASES_I_AVOID + social_media_guide.TOPICS_TO_AVOID |
| **Differentiator** (the one unique thing) | brand_guide.UNIQUE_DIFFERENTIATOR |
| **Tagline + mission** | brand_guide.TAGLINE + brand_guide.BRAND_MISSION |
| **Sample writing** (1 paragraph in-voice + 1 reader email reply) | prose_guide.SCENE_EXAMPLES (the in-voice paragraph, if fiction) + copywriting_guide.WRITING_SAMPLES (the email reply) |
| **Prose-specific** (dialogue style, description priorities, pacing, romance heat, genre conventions) | prose_guide.* sections |
| **Copywriting-specific** (POV by content type, engagement style, CTA examples) | copywriting_guide.* sections |
| **Social-specific** (platforms, content pillars, hashtag sets, emoji style) | social_media_guide.* sections |

When you compile, be transparent. After each shared facet, briefly tell the user where the answer's going — e.g., *"Got it — these voice keywords land in your brand guide AND inform the voice sections of your copywriting and prose guides."* That way they understand why one answer covers three places.

### Stages — work the facets in this order

This takes a while; do it in stages and save after each so the user can pause and resume.

**Stage 1 — Foundation** (covers identity + audience + voice + differentiator + tagline + mission)
Walk facets 1–6. By end of stage, you can compile + save the brand_guide entirely AND prefill the voice sections of copywriting_guide and prose_guide. Save brand_guide via `aa_update_guide({tag, brand_guide: "<full text>"})`.

**Stage 2 — Off-limits** (one focused question)
Walk facet 4 (forbidden vocabulary categories + topics to avoid). Compile and stash these in your context — they'll be merged into prose, copywriting, and social guides at the end of each respective stage.

**Stage 3 — Sample writing** (one focused conversation)
Walk facet 7. Two artifacts: a 1-paragraph in-voice prose example (skip if persona is non-fiction-only), and a 1–2-paragraph reader email reply in the persona's voice. Stash for later.

**Stage 4 — Prose deepening** (only if fiction persona)
Walk facets 8 (prose-specific). Compile prose_guide using the voice text from Stage 1 + off-limits from Stage 2 + scene examples from Stage 3 + the prose-specific answers. Save via `aa_update_guide({tag, prose_guide: "<full text>"})`.

**Stage 5 — Copywriting deepening**
Walk facets 9 (copywriting-specific). Compile copywriting_guide using Stage 1 voice + Stage 2 off-limits + Stage 3 email reply + the copywriting-specific answers. Save.

**Stage 6 — Social deepening**
Walk facets 10 (social-specific). Compile social_media_guide using Stage 1 audience + Stage 2 off-limits + the social-specific answers. Save.

After Stage 1, the user has a usable persona (the brand_guide is enough for AI to write campaigns; the other guides refine quality). After all 6, the persona is fully populated. The user can stop after any stage and come back later — Stage N just needs Stage 1 + Stage 2 in your context.

### Skipping stages for a non-fiction persona

If the persona is non-fiction only (coaching, business, nonfiction author), skip Stage 4. The prose_guide field can stay NULL — the AI generator handles missing prose guides gracefully (it falls back to the copywriting voice for any fiction-shaped task that comes up, which for non-fiction personas is rare).

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

## Question library — facets, not guides

Each facet is asked ONCE. The mapping table above shows which guide sections each answer populates — be transparent with the user as you go. Don't dump these as a literal questionnaire; weave them into the conversation.

### Facet 1: Identity (genre, niche, bio)

- **Genre / niche**: "What genre and sub-niche does this persona write in? Be specific — 'cozy mystery' is broader than 'gulf coast paranormal cozy mystery with witches and shapeshifters'."
- **Bio**: "Two short third-person paragraphs that you'd put on Amazon's author page or the back of a book."

### Facet 2: Audience

- **Reader segments**: "Two or three reader segments — for each, give me their age range, how many books they read a month, where they buy them (Kindle Unlimited, Amazon print, Barnes & Noble, indie shops), what they love, what they avoid, and what online spaces they hang out in (Goodreads groups, Facebook book clubs, BookTok creators they follow)."

This single answer is rich enough to compile into both `brand_guide.TARGET_AUDIENCE` and `social_media_guide.SOCIAL_MEDIA_TARGET_AUDIENCE` — the social-media version foregrounds the platforms the segment uses, the brand version foregrounds reading habits + dealbreakers.

### Facet 3: Voice

- **Personality keywords**: "Four to six single words that describe the voice — adjectives like 'whimsical, salt-kissed, enchanting, communal'."
- **How it sounds**: "One paragraph: how does this voice SOUND to readers? Use a metaphor or comparison if it helps — 'like a trusted tour guide who knows where the secrets are'."
- **Formality level**: "On a 1–4 scale (1 = chatty/casual, 4 = formal), where does this persona sit? It's OK to give different numbers for newsletters vs press releases vs reader-DM replies — different content types, different formality."

These three answers populate FIVE guide sections: brand's PERSONALITY_KEYWORDS + VOICE_AND_TONE; copywriting's VOICE_AND_POV + FORMALITY; prose's NARRATIVE_TONE. After capturing these, tell the user: *"Got it — voice work covered. These answers land in your brand guide AND inform the voice sections of your copywriting and prose guides — no need to repeat any of this later."*

### Facet 4: Off-limits

- **Forbidden vocabulary categories**: "List five word/phrase categories that would BREAK immersion or violate the brand if they showed up. For example: sci-fi tech terms (cyber warfare, neural implants), grimdark fantasy (dark lord, sword of destiny), graphic violence (arterial spray, eviscerated), explicit romance (heaving bosom, throbbing desire), or anything else off-brand. Be specific so the AI knows what to avoid."
- **Social topics to avoid**: "On social specifically, what topics steer clear? Politics, religion, real-crime details, competitor drama, personal medical, family problems — categories the persona shouldn't post about."

These two answers populate three sections: prose's FORBIDDEN_VOCABULARY, copywriting's WORDS_AND_PHRASES_I_AVOID, social's TOPICS_TO_AVOID.

### Facet 5: Differentiator

- **The unique thing**: "What's the one thing your books do that nobody else's do? A specific magic system rule, a setting hook, a relationship dynamic — the thing readers can't get from a similar-shelf book."

### Facet 6: Tagline + mission

- **Tagline**: "One short line that captures the vibe — sub-15 words."
- **Mission**: "Two short paragraphs: who this persona is, what they bring to readers, and what they promise."

### Facet 7: Sample writing

- **In-voice prose paragraph** (skip if non-fiction-only persona): "Write me ONE paragraph (~5–8 sentences) of fiction in this persona's voice. A scene fragment, an opening hook, a moment of dialogue — anything that demonstrates how the prose actually sounds. Don't summarize it; write it."
- **Reader email reply**: "Write a 1–2 paragraph reply to a hypothetical fan email saying *'I loved your last book, the world feels so real.'* Reply in the persona's voice — that's the model for how she/he/they writes back to readers."

### Facet 8: Prose-specific (only for fiction personas)

- **Dialogue style**: "Southern Texas? Direct? Sarcastic? Do different supernatural species or character types in your world have distinct speech patterns? Give me 5 phrases your characters would use, and 5 they wouldn't."
- **Description priorities**: "What sensory details matter most in your scenes? (e.g., 'salt air, golden hour light, weathered wood'.) Are there specific regional references that have to land authentically?"
- **Pacing pattern**: "How does a scene flow in your books? Open with X, build through Y, climax at Z?"
- **Punctuation quirks**: "Em dashes? Ellipses? Italics? When and why?"
- **Romance heat level**: "Closed door / fade-to-black, kissing only, on-page intimate, explicit? Any romance phrases that would feel WRONG in this world (e.g., bodice-ripper clichés in a literary romance)?"
- **Genre conventions**: "What genre rules MUST hold? (Cozy mystery: no graphic violence, amateur sleuth, restored harmony. Paranormal: clear magic rules, masquerade, etc.)"

### Facet 9: Copywriting-specific

- **POV by content type**: "First or third person? Vary per format — newsletters, emails, press releases, blog posts, social. Be specific per format."
- **Engagement style**: "Describe one or two recurring newsletter sections you'd love to run. What questions would you ask readers? How would you respond to a fan email?"
- **Personal engagement level**: "How hands-on do you want to be with reader DMs? Reply personally to most? Have an assistant screen 90% and only flag the meaningful ones to you?"
- **CTAs**: "Give me 3–5 sample call-to-action lines in your voice. Mix promotional ('grab your copy') with community ('what do you think?')."

### Facet 10: Social-specific

- **Primary platforms + strategy**: "Which 2–4 platforms does this persona prioritize, and what's the angle on each? Match each to one or two demographics it reaches best."
- **Posting cadence**: "How often per platform — daily, 3x weekly, weekly?"
- **Content pillars**: "5 content themes the persona posts about. For each, give 3–5 specific content ideas."
- **Hashtag sets**: "8–12 hashtags per platform, mixing broad (#CozyMystery) and niche (#GulfCoastWitches). One set per platform; they don't need to overlap."
- **Per-platform hashtag strategy**: "How many hashtags per post on each platform? Where to place them (caption vs first comment)?"
- **Emoji style**: "Minimal? Heavy? Specific signature emojis? Tied to seasons or themes?"

## Common mistakes to avoid

- **Don't generate full guide content from a one-line prompt.** "I want a Spicy Romance persona" → ASK the question-library questions. Don't make up a genre, audience, or voice from thin air.
- **Don't show the user 400 lines of generated text and ask them to read it.** Build incrementally — Stage 1, save, Stage 2, save. Each stage takes 5–15 minutes of focused work.
- **Don't try to delete the default persona.** Surface the "set a different default first" workflow rather than retrying with different syntax.
- **Don't auto-cascade voice changes across guides.** Suggest, ask, then act. Cross-guide consistency is valuable, but the user owns the decision.
- **Don't paste the user's API responses back to them verbatim.** When you read a guide via `aa_get_guides`, summarize what you found ("your prose guide opens with a 'whimsical, warm, and conspiratorial' tone and runs about 400 lines") — don't dump the whole text unless they asked.
