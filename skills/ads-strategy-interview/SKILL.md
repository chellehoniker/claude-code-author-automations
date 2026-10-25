---
name: ads-strategy-interview
description: Use when an author wants an ads strategy or a plan before spending money on ads, or doesn't know where to start with book ads. Runs a one-question-at-a-time interview (book, genre, comps, reader, goal, budget, networks, assets, past results), skips anything the account already answers, then builds a Reader Radius ads strategy plan and adopts it only on the author's OK. Triggers on "help me plan my ads", "ads strategy", "where should I advertise my book", "how much should I spend on ads", "build me an ad plan", "interview me about my ads", "I want to run ads for my launch", "should I run Amazon ads or Facebook ads".
---

# Ads strategy interview

Interview the author one question at a time, fill in what their account already knows, then turn the answers into a saved Reader Radius ads strategy plan. The plan is the house playbook applied to their book: which network to start on, how to structure campaigns, a starting daily budget, kill and scale rules, and a six-step click-test plan.

Planning spends nothing. Building ads afterward can spend real money, and you confirm with the author before anything goes live.

## Ground rules

- **One question per message.** Ask, wait, then ask the next. Offer the choices as a short list when the answer has fixed options. Never send the whole questionnaire at once.
- **Look before you ask.** Each question below lists the tools that may already answer it. Call them first. When the data answers the question, say what you found in one line ("You have three books under this pen name; I'll plan for *Curses and Currents* unless you say otherwise") and move on.
- **Pen name first.** Every tool here except `aa_list_profiles` takes `profileId`. If the author has more than one pen name, settle which one before anything else (see the `pen-names` skill) and pass that `profileId` on every call.
- **Two approval gates.** (1) Show the brief and get an OK before `aa_ads_strategy_plan_create`. (2) Show the generated plan and get a clear yes before `aa_ads_strategy_plan_adopt`. A draft plan is harmless; adopting makes it the plan the dashboard builds ads from.
- **Nothing goes live without the author's OK.** If the conversation moves on to building campaigns, show what will be created first and say "I'll confirm with you before anything goes live." Don't promise that every ad is created paused: Amazon campaigns are, but other networks differ, and in the dashboard's Create ad wizard some networks (Google, Pinterest, ChatGPT) aren't created at all until the author presses **Start these ads**.
- **Never invent facts.** No made-up reviews, ratings, sales figures, credentials or comp titles. If the author doesn't know an answer, the closest honest default is fine; say which default you picked.

## Step 0: Look up what you can (no questions yet)

Run these quietly at the start and keep the results for the interview:

| Call | What it tells you |
|---|---|
| `aa_list_profiles` | Pen names. Skip the pen name question if there is only one. |
| `aa_find_content` with `source: "books"` | The pen name's books: `id`, `title`, `snippet` (subtitle or the start of the synopsis), `asin`, `link`, `authors`. It does **not** return genre, series position or fiction/non-fiction, so those still need asking. |
| `aa_ads_strategy_plans_list` | Plans this pen name already has. If there's a draft or adopted plan for the same book, offer to review or rebuild it before starting a new one. |
| `aa_ads_capabilities` | Whether ads are switched on, which destinations (Meta, Amazon, TikTok, ChatGPT, LinkedIn, Google, Pinterest, X) are connected, ad accounts, tracking state. |
| `aa_amazon_ads_status` | Whether an Amazon Ads account is connected and which advertiser profiles are synced. |
| `aa_list_all_ads` (window: last 90 days via `from`/`to`) | Past and current campaigns across every network, with spend and results. |
| `aa_amazon_ads_campaigns` and `aa_amazon_ads_pnl` | Amazon spend, sales, ACOS and ad-attributed royalties, when Amazon is connected. |
| `aa_ads_groups_rollup` | Campaign groups with ROAS and a winning / watch / losing verdict, if the author uses groups. |

If `aa_ads_capabilities` says ads aren't switched on for this account, tell the author plainly and share the path it returns. The strategy plan tools need ads switched on too (they answer `ADS_UPGRADE_REQUIRED` otherwise), so without it you can still run the interview and talk through a plan in chat, but you can't save one.

## Step 1: The interview

Ask only what Step 0 didn't answer. The order matters: the first six answers become the plan's brief, the rest shape research, creative and the build.

| # | Question (one per message) | Skip it when | Where the answer goes |
|---|---|---|---|
| 1 | "Which book is this plan for, or is it for the whole pen name?" | Only one book, or the author already named it | `bookId` on `aa_ads_strategy_plan_create`; `bookTitle`, `asin` on `aa_ads_strategy_plan_generate` |
| 2 | "Is it fiction or non-fiction?" | The book's description makes it unmistakable (still confirm in the brief) | `situation.workType` |
| 3 | "What genre is it?" (fiction) or "What kind of book is it?" (non-fiction). Offer the list below. | Never: the account doesn't store genre | `situation.genre` |
| 3b | Non-fiction only: "What's this book's main job: sell copies, grow your email list, build your reputation as an expert, or lead readers to a course or service?" | Fiction | `situation.nonFictionPurpose` |
| 4 | "Where does it sit in your catalog: first in a series, a later book in a series, a standalone, or a box set?" | Never | `situation.catalogDepth` |
| 5 | "Only on Amazon and in Kindle Unlimited, on Amazon plus other stores, or from your own store?" | Never | `situation.distribution` |
| 6 | "How much are you comfortable spending per day to start?" | Never | `situation.budgetPosture` |
| 6b | "For how long: a week, two weeks, a month?" (its own message, after question 6) | Never | Carries to the build (start and end dates) |
| 7 | "What's the goal right now: a launch, steady sales of a backlist title, read-through to the rest of the series, or growing your list?" | The author already said it | Launch vs. steady sales and list growth carry to the build (the wizard's Launch, Sell and Newsletter goals). Read-through is mostly answered by question 4. For non-fiction, list growth is question 3b. |
| 8 | "Which two or three authors or books would your readers also love?" | Never | Comps for research: `aa_ads_strategy_ad_library_scan` `query`, `aa_ads_strategy_keyword_ideas` `seedKeywords`, Amazon keyword ideas, interest targeting later |
| 9 | "Describe your ideal reader in a sentence or two. What do they come to your books for?" | Never | The reader persona: checked against the plan's personas, or used to write them (see Step 3) |
| 10 | "Where do you want to run ads? You're connected to: ..." (list what `aa_ads_capabilities` shows) | Only one destination is connected and the author is happy with it | Compared with the plan's platform choice; carries to the build |
| 11 | "What do you already have to work with: a cover you like, a trailer or video, a reader magnet, a landing page, reader reviews?" | Answered by the data (`asin` present, reference docs saved) | Creative and destination planning; reviews feed `aa_ads_strategy_review_audit`. Check `aa_list_book_reference_docs` with the `bookId` for saved quotes and scenes. |
| 12 | "Have you run ads for this book before? What happened?" | Step 0 found past campaigns: summarize them instead ("Your Amazon ads spent $210 over the last 90 days at 68% ACOS (ad spend as a share of sales)") and ask only what the numbers can't say, such as what the author thinks went wrong | Context for the plan review and for which network to start on |

### Mapping answers to the brief (exact values only)

Use these strings exactly and nothing else. The server checks most of them and rejects a bad value, but not all, so a typo can slip through and produce the wrong plan.

- **`workType`:** `fiction` or `nonfiction`.
- **`genre`, fiction:** `cozy_mystery`, `thriller`, `romantasy`, `contemporary_romance`, `fantasy`, `science_fiction`, `historical_fiction`, `literary_fiction`, `horror`, `young_adult`, `childrens`. When the author's genre isn't listed (say, paranormal cozy or space opera), pick the closest one, tell them which you picked, and let them change it.
- **`genre`, non-fiction:** `business_entrepreneurship`, `self_help`, `memoir`, `health_wellness`, `spirituality`, `finance`, `how_to_reference`, `parenting`.
- **`nonFictionPurpose`** (required for non-fiction, rejected for fiction): `sell_book`, `lead_magnet` (grow the email list), `establish_authority`, `promote_course_service`.
- **`catalogDepth`:** `first_in_series`, `mid_series`, `standalone`, `box_set`.
- **`distribution`:** `ku_enrolled`, `wide`, `direct_sales`.
- **`budgetPosture`**, from the daily amount: about $5 a day is `micro`, about $10 is `small`, $20 to $30 is `mid`, $50 or more is `large`. Between two bands, pick the lower one and say so.
- **`compliance`** (always send both): `healthOrFinanceAdjacent` is `true` for non-fiction `health_wellness` or `finance`, otherwise `false`. `namedCompetitorsInCreative` is `false` unless the author plans ads that name another author or book head to head.

Comps, persona, goal, duration, networks, assets and past results have no field in the brief. Don't tell the author they change the playbook's numbers; they shape the research, the creative and the build.

## Step 2: Show the brief, then create the draft

Show a short summary in plain words, not enum strings:

> **Plan brief for *Curses and Currents***
> Fiction, cozy mystery, first in a series, Amazon only in Kindle Unlimited, about $10 a day for 30 days.
> Goal: launch. Comps: two authors you named. Reader: "women 45+ who want a puzzle and a found family."
> Running on: Meta and Amazon (both connected).

Ask: "Does that look right? I'll save it as a draft plan. Nothing is spent." On a yes:

```
aa_ads_strategy_plan_create({
  situation: {
    workType: "fiction",
    genre: "cozy_mystery",
    catalogDepth: "first_in_series",
    distribution: "ku_enrolled",
    budgetPosture: "small",
    compliance: { healthOrFinanceAdjacent: false, namedCompetitorsInCreative: false }
  },
  bookId: "<book id from aa_find_content>",
  profileId: "<pen name>"
})
```

A 400 with `Invalid situation` lists the field that's wrong in `details`. Fix it and try again; don't guess a new value without telling the author.

## Step 3: Research, then generate the plan

**Optional research, while you're here** (each can return `available: false` instead of failing, usually with a reason; say the reason, or "no reviews came back" when there isn't one, and carry on):

- `aa_ads_strategy_review_audit({ bookId, asin })`: sorts the book's real reader reviews into pain points, trigger moments, objections, transformations and ad-ready phrases, with a 1 to 5 quality score. Needs an ASIN on the book. Under 20 reviews, it says so; treat the result as thin.
- `aa_ads_strategy_ad_library_scan({ query: "<comp author or genre keywords>" })`: what similar authors are running in Meta's public ad archive. The archive holds ordinary ads only for the EU and UK (default countries GB,IE), so ads that ran only in the US never show up. Never tell the author "nobody in the US runs ads like this."
- `aa_ads_strategy_keyword_ideas({ seedKeywords: [...] })`: Google Ads keyword ideas from the comps and genre terms. Needs a connected Google Ads account.

**Generate:**

```
aa_ads_strategy_plan_generate({
  planId: "<id from plan_create>",
  bookTitle: "Curses and Currents",
  synopsis: "<the book's description; ask for it if the snippet is all you have>",
  asin: "<ASIN, when the book has one>",
  profileId: "<pen name>"
})
```

Three outcomes to handle:

1. **A version comes back with creative** (personas, messaging angles, hooks): use it as is. Compare its personas with the reader the author described in question 9 and point out any mismatch.
2. **The call is refused with "On your plan, your own AI does the writing and the images..."**: the author's plan doesn't include Reader Radius's own writing. Nothing was saved. Call again with `includeCreative: false`, which saves the playbook decisions without creative. Then write the personas, messaging angles (pain, persona, angle) and a handful of hooks yourself, grounded on the review audit, the reader description and the comps. Say clearly that these hooks live in this chat and are not saved in the plan, so the Create ad wizard won't pre-fill them.
3. **The version comes back with `creativeWarning`**: the playbook saved, the creative didn't. Tell the author, and offer to generate again (a new version) or to draft the creative yourself.

Royalty and page-read rates can't be passed through this tool, so the plan's `economics` area falls back to a house default ACOS target (marked `computedFrom: "fallback"`, with no break-even figure). When you show it, call it "Reader Radius's standard starting target", not a fallback or house default. If the author wants a real break-even, the `ads-plan-review` skill does that math from their royalty and price.

## Step 4: Show the plan

Read it back with `aa_ads_strategy_plan_get({ planId })` if you need the full version. Present it in plain language, grouped like this:

- **Where to start:** the platform choice and its reason. If it differs from where the author wanted to run (question 10), say so and explain the reason in one line.
- **Budget and structure:** the starting daily budget, campaign structure and bidding.
- **Targeting:** the playbook's targeting decision, plus the comps you'd add.
- **Creative:** personas, messaging angles, the strongest hooks, and the visual look if there is one.
- **The click-test plan** (`testPlan`): six tests run one at a time (hook, headline, proof, image, primary text, stress), 12 ideas each, about $30 a day for 24 to 36 hours until each idea has been shown about 400 times, winners carried forward. (The floor counts impressions. Say "shown about 400 times" to the author, never "seen by 400 people".) Meta is the only platform it runs on.
- **Targets:** the ACOS target from the economics area (if `computedFrom` is `"fallback"`, call it "Reader Radius's standard starting target"), the click and impression thresholds in KPI targets, the kill and scale rules (to the author: "when to stop an ad and when to raise its budget"), and the cadence.
- **Gaps:** list any area in `gaps` honestly ("the playbook doesn't have a standard setup for box sets yet").
- **Compliance notes:** any `complianceConstraints`, such as Meta's Special Ad Category for health or finance books.

Keep the playbook's numbers exactly as the plan states them. Don't round, merge or "improve" them.

## Step 5: Adopt only on a clear yes

Ask: "Want me to make this the plan for this book? You can still change anything when you build the ads." Only on a clear yes:

```
aa_ads_strategy_plan_adopt({ planId: "<planId>", versionId: "<the version id from generate>", profileId: "<pen name>" })
```

If the author wants changes to the brief, create a new plan with the corrected answers (the brief is set at creation) and generate again. Earlier versions are never edited.

## Step 6: What happens next (only if the author asks to build)

- **Easiest path:** the dashboard's Create ad wizard can start from the adopted plan at `/dashboard/ads/create?plan=<planId>`. It fills in the goal and the book, plus the plan's saved hooks when the plan has them, and the plan page has a **Run Test 1** button for the click-test plan. Nothing built in the wizard runs until the author presses **Start these ads**.
- **Amazon from chat:** use `aa_create_amazon_campaign` (Sponsored Products), `aa_amazon_ads_create_sb` (Sponsored Brands) or `aa_amazon_ads_create_sd` (Sponsored Display) with the ASIN from the book's listing, never a guessed one. Show the campaign name, daily budget, targeting and keywords first and get an OK. Amazon campaigns are created paused. Switch one on with `aa_amazon_ads_campaign_state` `state: "ENABLED"` only after the author confirms, because it starts spending the daily budget right away. Never use `ARCHIVED` to stop spending: it's permanent. Use `PAUSED`.
- **Meta, TikTok, LinkedIn, Google, Pinterest, ChatGPT from chat:** hand off to the `create-meta-ad` skill, which carries each network's rules and the spend confirmation.
- In every case: show the plan for the campaigns first, and say "I'll confirm with you before anything goes live."

Once ads are running, the `ads-plan-review` skill checks them against this plan.

## Common mistakes

- Sending several questions in one message, or asking something Step 0 already answered.
- Inventing a genre or purpose string the brief doesn't accept, or sending `nonFictionPurpose` on a fiction plan.
- Adopting without asking, or creating ads straight from the plan without showing them first.
- Saying "every ad is created paused." Say you'll confirm before anything goes live.
- Claiming Meta ad archive results cover the US.
- Presenting hooks you wrote as part of the saved plan.
