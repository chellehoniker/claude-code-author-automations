---
name: ads-plan-review
description: Use when an author wants to know whether their running ads are following their adopted ads strategy plan, or wants changes proposed against it. Compares live campaigns on every connected network with the plan's budget, platform, kill and scale rules and click-test progress, then proposes pauses, budget moves and next tests for the author to approve one by one. Triggers on "review my ads against the plan", "are my ads on track", "check my ads plan", "what should I change in my ads", "is my launch plan working", "which test is next", "judge my click test".
---

# Ads plan review

Check the author's running campaigns against the ads strategy plan they adopted (usually built with the `ads-strategy-interview` skill), say plainly what's on plan and what isn't, and propose changes. Every change waits for the author's yes.

## Ground rules

- **Pen name first.** Settle the pen name (the `pen-names` skill) and pass its `profileId` on every call.
- **Ads must be switched on.** The plan, optimize and test tools answer `ADS_UPGRADE_REQUIRED` when the account doesn't have ads; `aa_ads_capabilities` shows the path to switch them on.
- **Look first, change later.** Steps 1 to 3 don't change any campaign. (A fresh Amazon sync or a review audit refreshes stored data, but launches and spends nothing.) Nothing is paused, resumed, judged or archived without a clear yes for that specific change.
- **One change per confirmation.** List the proposals, then confirm and apply them one at a time. Don't bulk-apply.
- **Never invent numbers.** Quote spend, ACOS, ROAS and CTR as the tools return them. Check each campaign's `currency` in `aa_list_all_ads` (and `mixedCurrency` on group rollups) before totaling; amounts in different currencies are never summed.

## Step 1: Load the plan

1. `aa_ads_strategy_plans_list` and pick the adopted plan for the book the author means. No adopted plan? Offer the `ads-strategy-interview` skill, or review against a draft plan if the author prefers, and say that's what you're doing.
2. `aa_ads_strategy_plan_get({ planId })` and read the adopted version (`current_version_id`). Keep these from its contract: platform choice, starting daily budget and structure, the ACOS target in the economics area (`playbook.economics.value.targetAcosPct`; `computedFrom: "fallback"` means it's the house default, not the author's numbers), the click and impression thresholds in KPI targets, kill and scale rules, cadence, `testPlan`, `gaps` and `complianceConstraints`.

## Step 2: Pull what's actually running

| Call | Why |
|---|---|
| `aa_list_all_ads` (`from`/`to` matching the plan's cadence; default last 30 days) | Every campaign on every network with status, spend, results, and the book each one is mapped to. Read `errors` for networks that didn't answer and `notices` for account-wide problems, and say those first. |
| `aa_get_ad_title_map` | Which campaigns advertise this book. Campaigns with no mapping can be mapped with `aa_set_ad_title_map` after the author confirms which book they belong to. |
| `aa_optimize_ads` (same window) | The deterministic verdicts: a fixed profitability decision tree per campaign plus creative fatigue (spend up, results down over the last 7 days vs. the 7 before). No AI key needed, and it's on the MCP plan as well as the dashboard plan (ads must be switched on). This is the main source for proposals. |
| `aa_amazon_ads_campaigns` and `aa_amazon_ads_pnl` | Amazon spend, sales, ACOS, and ad-attributed royalties including page reads where available. Tell the author any `accountNotes` (payment problems, account budget) and per-campaign `deliveryNote` first. If numbers look stale, `aa_amazon_ads_sync_now`, then check back in a few minutes. |
| `aa_ads_groups_rollup` (`window`: `7d`, `30d`, `90d` or `lifetime`) | If the author groups campaigns, the cross-network ROAS and a winning / watch / losing / too early verdict per group against their own target. |
| `aa_ads_test_runs_list({ planId })` | Click-test progress for this plan: which tests ran, which are running, which were judged, and the winners carried forward (`held`). Pass `runId` to read one run's live per-idea results. |

**Optional, dashboard plans only:** `aa_get_ads_recommendations` runs the summary through the author's own AI key and returns up to five recommendations tied to named campaigns. It isn't available on the MCP plan, and it answers `ai_settings_required` when no AI key is set up (Settings, then AI Providers). If it's refused either way, skip it; `aa_optimize_ads` already covers the verdicts.

## Step 3: Compare and report

Give one short report, plan vs. reality, in this order:

1. **Account problems first:** payment failures, disconnected networks, `errors` from any network.
2. **Platform:** is the spend where the plan said to start? Spend on a network the plan didn't choose isn't wrong, but say so.
3. **Budget:** actual daily spend vs. the plan's starting daily budget, per campaign and in total.
4. **Kill and scale** (to the author: "when to stop an ad and when to raise its budget"): apply the plan's own rules to each campaign, alongside the `aa_optimize_ads` verdict. When they disagree, show both and say which one you'd follow and why, in one line.
5. **Amazon break-even:** compare ACOS with the plan's ACOS target. Plans built from chat usually carry the house fallback target, because royalty rates can't be passed in from chat, and no break-even figure. To the author, call it "Reader Radius's standard starting target". If the author wants a true break-even, ask for their royalty per sale and list price, then break-even ACOS is royalty divided by price. Show the arithmetic.
6. **Click tests:** which test is next in `testPlan`, whether every idea in the current run has been shown about 400 times (the floor counts impressions; say "shown about 400 times" to the author), and the suggested winners.
7. **Creative fatigue:** campaigns flagged as fatigued. If fresh angles would help, `aa_ads_strategy_review_audit({ bookId, asin })` pulls new pain points and ad-ready phrases from the book's real reviews. It reads reviews, not campaign results, so present it as a source for new creative only.
8. **Gaps and compliance:** anything the plan left as a gap, and any compliance constraint the running ads might be missing (Meta's Special Ad Category for health or finance books, for example).

Keep each line tied to a named campaign and a number.

## Step 4: Propose, then apply one change at a time

Turn the report into a numbered list of proposals, each with the reason and what it costs or saves:

> 1. Pause "Curses SP auto" on Amazon: 91% ACOS (ad spend as a share of sales) over 30 days against the plan's 35% target. Saves about $8 a day.
> 2. Pick the winners of Test 1 (hooks): all 12 ideas have been shown about 400 times; the suggested winners are ideas 3 and 7.
> 3. Hold the Meta campaign at $10 a day: it's in the plan's "too early" window.

Then confirm each one separately and use the matching tool:

| Change | Tool | Note |
|---|---|---|
| Pause or resume a campaign on any network other than Amazon | `aa_update_ad_campaign_status` (`id` is the campaign id and `accountId` the connected account, as `aa_list_all_ads` shows them; `status: "paused"` or `"active"`). `platform` takes the provider name, which differs from the network name for two networks: Meta is `facebook` and X is `twitter`. The others are `tiktok`, `linkedin`, `pinterest`, `google` and `openai` (ChatGPT). | Resuming spends money again; confirm first. |
| Pause or start an Amazon campaign | `aa_amazon_ads_campaign_state` (`campaignId`, `amazonProfileId`, `state: "PAUSED"` or `"ENABLED"`, `adProduct` when it isn't Sponsored Products) | `ENABLED` starts spending the daily budget right away. Never use `ARCHIVED` to stop spending: it's permanent. Archive only when the author asks for it after you've said it can't be undone. |
| Judge a click test | `aa_ads_test_run_judge` | Call it without `confirm` first to read the results and show them. Record winners with `confirm: true` and the `winners` the author picked. If some ideas haven't been shown about 400 times yet it's refused; pass `override: true` only when the author chooses to judge early, and tell them that's recorded on the run. The response carries `nextTest` with the wizard link for the next test. |
| Budget changes, new campaigns or new test ads | The dashboard's Create ad wizard (`/dashboard/ads/create?plan=<planId>`), or the `create-meta-ad` skill and the Amazon create tools from chat | Show what will be created first, and say "I'll confirm with you before anything goes live." |
| Map a campaign to the book | `aa_set_ad_title_map` | After the author confirms which book it is. |

After each change, re-read the campaign (`aa_list_all_ads` or `aa_amazon_ads_campaigns`) and report the new state as the tool shows it.

## When the plan itself needs to change

If the author's situation has changed (a new book in the series, going wide, a bigger budget), the plan's brief is out of date. Offer the `ads-strategy-interview` skill to build a new plan. Plans are versioned: adopting a new one never edits the old one.

## Common mistakes

- Applying a pause or a judgment because the verdict said so, without asking.
- Treating `aa_ads_strategy_review_audit` as a performance check. It reads reader reviews.
- Calling `aa_get_ads_recommendations` on the MCP plan and stopping when it's refused. Use `aa_optimize_ads`.
- Summing spend across currencies.
- Archiving an Amazon campaign to stop it for now. Pause it.
