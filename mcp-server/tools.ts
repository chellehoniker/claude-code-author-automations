/**
 * MCP Tool Definitions for Author Automations Social
 */

import { apiCall } from "./client.js";

export const TOOLS = [
  // ── Account & Context ──
  {
    name: "aa_list_profiles",
    description:
      "List every pen-name profile this credential can address. " +
      "An API key with a restricted allowlist returns only the pen names in its allowlist (NOT every pen name on the underlying user). " +
      "Use this to populate a pen-name picker before any other call — the X-Profile-Id header on subsequent calls must be one of these IDs.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "aa_list_accounts",
    description: "List the user's connected social media accounts. Returns account IDs (needed for creating posts), platform names, and usernames.",
    inputSchema: {
      type: "object" as const,
      properties: {
        platform: { type: "string", description: "Filter by platform (e.g., instagram, tiktok, facebook)" },
      },
    },
  },
  {
    name: "aa_get_guides",
    description: "Get the user's content guides (prose style, brand voice, copywriting, social media strategy, image style). Read these before writing captions to match the user's voice.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "aa_queue_preview",
    description: "Preview upcoming queue slots. Shows when the next posts will go out if using the queue.",
    inputSchema: {
      type: "object" as const,
      properties: {
        count: { type: "number", description: "Number of upcoming slots to show (default 10)" },
      },
    },
  },
  {
    name: "aa_list_queues",
    description:
      "List the user's posting queues (queue definitions, not next-slot previews — use aa_queue_preview for that). " +
      "Each queue is a recurring set of slots with optional per-platform decoration: a queue can fan out per-platform (e.g., one queue with [instagram, tiktok] populates the next IG slot AND the next TikTok slot). " +
      "Returns queue IDs you can pass to scheduling.",
    inputSchema: {
      type: "object" as const,
      properties: {
        queueId: { type: "string", description: "Specific queue to fetch" },
        all: { type: "boolean", description: "Return all queues regardless of state" },
      },
    },
  },

  // ── Posts ──
  {
    name: "aa_preflight_post",
    description: [
      "Validate a draft post WITHOUT scheduling. Returns the same blockers/warnings",
      "aa_create_post would surface, but with zero side effects — safe to call before",
      "every submit, in a builder UI, or from an automation that wants to verify a",
      "draft is postable.",
      "",
      "Returns { ok, blockers[], warnings[], accounts[] } where:",
      "  blockers: hard failures (caption too long for platform, missing required field,",
      "            account disconnected, media aspect ratio invalid for IG, etc.).",
      "  warnings: soft hints (no caption, link in LinkedIn body, etc.).",
      "  accounts: per-account health (isActive, platformStatus, intentionalDisconnectAt).",
      "",
      "Use the same accountIds + mediaItems shape as aa_create_post. The four optional",
      "fields below match the typed *Options blockers (YouTube/Reddit/Threads).",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        content: { type: "string", description: "Post text/caption" },
        accountIds: { type: "array", items: { type: "string" }, description: "Account IDs to validate against" },
        mediaItems: {
          type: "array",
          description: "Media attachments — same shape as aa_create_post. width/height let aspect-ratio gates run without a probe fetch.",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["image", "video"] },
              url: { type: "string" },
              width: { type: "number" },
              height: { type: "number" },
              durationSec: { type: "number" },
              sizeBytes: { type: "number" },
            },
            required: ["type", "url"],
          },
        },
        youtubeTitle: { type: "string", description: "Required-on-create field — pre-flight checks it's set + within length" },
        redditSubreddit: { type: "string", description: "Required-on-create field" },
        redditTitle: { type: "string", description: "Required-on-create field" },
        threadsTopicTag: { type: "string", description: "Optional — pre-flight checks the format constraints" },
      },
      required: ["accountIds"],
    },
  },
  {
    name: "aa_create_post",
    description: [
      "Create and schedule a social media post. Use accountIds from aa_list_accounts.",
      "Set publishNow:true to post immediately, or scheduledAt for a specific time.",
      "",
      "═══ PER-PLATFORM OPTIONS — TWO LAYERS ═══",
      "",
      "1) TYPED options (instagramOptions, tiktokOptions, threadsOptions, etc).",
      "   Validated locally → fast 422 with a clear suggestion when something's off.",
      "   Use these for the common cases. Field names are camelCase here.",
      "",
      "2) RAW platformOptions: { instagram: {...}, threads: {...}, twitter: {...}, ... }.",
      "   Forwarded directly to the upstream platformSpecificData payload.",
      "   Use this for anything not in the typed list, OR for platforms we haven't",
      "   typed yet (twitter, bluesky, telegram, snapchat, googlebusiness, discord, whatsapp).",
      "",
      "Typed options take precedence; raw fills the rest. Both merge per platform.",
      "",
      "═══ INSTAGRAM ═══",
      "Aspect ratios: Feed = 0.75:1 to 1.91:1 (use 1080×1080, 1080×1350, or 1080×566).",
      "Stories/Reels = 9:16 single media only (use 1080×1920).",
      "If user has 4 vertical (9:16) images for IG, post 4 separate Stories — NOT one carousel.",
      "Carousels: up to 10 items, all same media type (no mixing image+video).",
      "",
      "instagramOptions:",
      "  contentType:        'story' | 'reel'    — omit for Feed (default)",
      "  coverImage:         URL of a 9:16 image  — Reel cover (use aa_create_post AFTER you've",
      "                                             generated the cover via Freepik or similar)",
      "  coverFromTimestamp: ms into video        — Reel cover from a video frame; ignored if coverImage set",
      "  trialParams:        { graduationStrategy: 'MANUAL' | 'SS_PERFORMANCE' }",
      "                                          — Trial Reel: shown to non-followers first, graduates",
      "                                            either manually (in IG app) or auto when engagement is good",
      "  shareToFeed:        true (default) | false  — Reel shows on main feed grid AND Reels tab, or just Reels tab",
      "  collaborators:      string[] (max 3)    — IG handles invited as collaborators",
      "  firstComment:       string              — auto-posted as first comment after publish",
      "  audioName:          string              — custom name for original Reel audio",
      "  userTags:           [{ username, x, y, mediaIndex? }]  — tag IG users in image posts",
      "",
      "═══ TIKTOK ═══",
      "tiktokOptions:",
      "  draft, privacyLevel ('PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'SELF_ONLY')",
      "  allowComment, allowDuet, allowStitch, autoAddMusic, videoMadeWithAi",
      "  videoCoverTimestampMs / videoCoverImageUrl  — pick a cover frame, or supply a separate cover URL",
      "  photoCoverIndex   — for photo posts: which image (0-based) is the cover",
      "  commercialContentType ('none' | 'brand_organic' | 'brand_content'), brandPartnerPromote, isBrandOrganicPost",
      "  contentPreviewConfirmed, expressConsentGiven  — TikTok requires these be true for sponsored content",
      "  description, mediaType ('video' | 'photo')",
      "",
      "═══ THREADS ═══",
      "threadsOptions:",
      "  topicTag: string (1–50 chars, NO '.' or '&')",
      "    — Sets the post's topic for discovery (e.g. 'Book Threads', 'Writing Community').",
      "      Overrides Threads' auto-extraction from hashtags. Leave empty to keep auto-extract.",
      "",
      "═══ YOUTUBE (REQUIRED: title for video posts) ═══",
      "youtubeOptions:",
      "  title:    REQUIRED for video posts. 1–100 chars. Separate from caption.",
      "  visibility: 'public' | 'private' | 'unlisted'",
      "  madeForKids, containsSyntheticMedia, firstComment, categoryId, playlistId",
      "",
      "═══ REDDIT (REQUIRED: subreddit + title) ═══",
      "redditOptions:",
      "  subreddit: REQUIRED. Like 'Fantasy' or 'BookRecommendations' (without 'r/').",
      "  title:     REQUIRED. Max 300 chars. Separate from the body/content.",
      "  url, forceSelf, flairId",
      "",
      "═══ FACEBOOK ═══",
      "facebookOptions: contentType ('story' | 'reel'), title (Reel only), firstComment, pageId, draft",
      "",
      "═══ PINTEREST ═══",
      "pinterestOptions: title, boardId, link, coverImageUrl, coverImageKeyFrameTime, firstComment",
      "",
      "═══ LINKEDIN ═══",
      "linkedinOptions: documentTitle, organizationUrn, firstComment, disableLinkPreview",
      "",
      "═══ FIRST COMMENT (LinkedIn 40-50% reach win) ═══",
      "`firstComment` is available on linkedinOptions, instagramOptions, facebookOptions,",
      "pinterestOptions, and youtubeOptions — auto-posted as the first comment after publish.",
      "For posts with external links targeting LinkedIn, prefer putting the URL in",
      "`linkedinOptions.firstComment` rather than the caption — LinkedIn suppresses link-bearing",
      "post reach 40-50%. Caps: LinkedIn/Pinterest/YouTube 10000, Facebook 8000, Instagram 2200.",
      "",
      "═══ EVERYTHING ELSE ═══",
      "Use raw platformOptions with the platform-native field names. Examples:",
      "  platformOptions: { twitter: { replyToTweetId, replySettings, threadItems, poll, longVideo } }",
      "  platformOptions: { telegram: { parseMode: 'Markdown', disableWebPagePreview: true } }",
      "  platformOptions: { discord: { channelId, embeds, poll, forumThreadName, forumAppliedTags } }",
      "  platformOptions: { snapchat: { contentType: 'spotlight' } }",
      "  platformOptions: { googlebusiness: { topicType: 'EVENT', event: {...} } }",
      "",
      "═══ MEDIA ═══",
      "Pass width/height on each image mediaItem when known — server skips a probe-fetch and validates IG faster.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        content: { type: "string", description: "Post text/caption (up to 25,000 chars)" },
        accountIds: { type: "array", items: { type: "string" }, description: "Account IDs to post to (from aa_list_accounts)" },
        publishNow: { type: "boolean", description: "Publish immediately (default true)" },
        scheduledAt: { type: "string", description: "ISO 8601 datetime to schedule for" },
        timezone: { type: "string", description: "IANA timezone (e.g., America/Chicago)" },
        mediaItems: {
          type: "array",
          description: "Media attachments. Include width/height when known so Instagram aspect-ratio validation skips the probe fetch.",
          items: {
            type: "object",
            properties: {
              type: { type: "string", enum: ["image", "video"] },
              url: { type: "string" },
              width: { type: "number" },
              height: { type: "number" },
              altText: { type: "string", description: "Accessibility text (Instagram uses this; other platforms ignore)" },
            },
            required: ["type", "url"],
          },
        },
        instagramOptions: {
          type: "object",
          description: "Instagram-specific. See full description above.",
          properties: {
            contentType: { type: "string", enum: ["story", "reel"], description: "Omit for Feed; 'story' for a 9:16 Story; 'reel' for a 9:16 Reel video" },
            coverImage: { type: "string", description: "Reel cover image URL (9:16). Generate via Freepik first if needed." },
            coverFromTimestamp: { type: "number", description: "Reel cover from a video frame (ms into video). Ignored when coverImage is set." },
            trialParams: {
              type: "object",
              description: "Trial Reel: shown to non-followers first; graduates to all followers manually (in IG app) or automatically based on engagement.",
              properties: {
                graduationStrategy: { type: "string", enum: ["MANUAL", "SS_PERFORMANCE"] },
              },
            },
            shareToFeed: { type: "boolean", description: "Reel appears on main grid AND Reels tab (default true) or just Reels tab" },
            collaborators: { type: "array", items: { type: "string" }, description: "Up to 3 IG handles invited as collaborators" },
            firstComment: { type: "string", description: "Auto-posted as first comment after publish" },
            audioName: { type: "string", description: "Custom name for original Reel audio" },
            userTags: {
              type: "array",
              description: "Tag IG users in image posts. x/y are 0–1 coordinates from top-left.",
              items: {
                type: "object",
                properties: {
                  username: { type: "string" },
                  x: { type: "number" },
                  y: { type: "number" },
                  mediaIndex: { type: "number", description: "Carousel slide (0-based)" },
                },
                required: ["username", "x", "y"],
              },
            },
          },
        },
        tiktokOptions: {
          type: "object",
          description: "TikTok-specific. See full description above.",
          properties: {
            draft: { type: "boolean" },
            privacyLevel: { type: "string", enum: ["PUBLIC_TO_EVERYONE", "MUTUAL_FOLLOW_FRIENDS", "SELF_ONLY"] },
            allowComment: { type: "boolean" },
            allowDuet: { type: "boolean" },
            allowStitch: { type: "boolean" },
            commercialContentType: { type: "string", enum: ["none", "brand_organic", "brand_content"] },
            autoAddMusic: { type: "boolean" },
            videoCoverTimestampMs: { type: "number" },
            videoCoverImageUrl: { type: "string" },
            photoCoverIndex: { type: "number" },
            brandPartnerPromote: { type: "boolean" },
            isBrandOrganicPost: { type: "boolean" },
            contentPreviewConfirmed: { type: "boolean" },
            expressConsentGiven: { type: "boolean" },
            mediaType: { type: "string", enum: ["video", "photo"] },
            videoMadeWithAi: { type: "boolean" },
            description: { type: "string" },
          },
        },
        threadsOptions: {
          type: "object",
          description: "Threads-specific. topicTag is 1–50 chars, no '.' or '&'.",
          properties: {
            topicTag: { type: "string", description: "Topic for discovery (e.g. 'Book Threads'). Overrides hashtag auto-extract." },
          },
        },
        youtubeOptions: {
          type: "object",
          description: "YouTube-specific. title is REQUIRED for video posts.",
          properties: {
            title: { type: "string", description: "Video title (1–100 chars). REQUIRED for video posts." },
            visibility: { type: "string", enum: ["public", "private", "unlisted"] },
            madeForKids: { type: "boolean" },
            firstComment: { type: "string" },
            containsSyntheticMedia: { type: "boolean" },
            categoryId: { type: "string" },
            playlistId: { type: "string" },
          },
        },
        redditOptions: {
          type: "object",
          description: "Reddit-specific. Both subreddit AND title are REQUIRED.",
          properties: {
            subreddit: { type: "string", description: "Subreddit name without 'r/'. REQUIRED." },
            title: { type: "string", description: "Post title (max 300 chars). REQUIRED." },
            url: { type: "string" },
            forceSelf: { type: "boolean" },
            flairId: { type: "string" },
          },
        },
        facebookOptions: {
          type: "object",
          properties: {
            contentType: { type: "string", enum: ["story", "reel"] },
            title: { type: "string" },
            firstComment: { type: "string" },
            pageId: { type: "string" },
            draft: { type: "boolean" },
          },
        },
        pinterestOptions: {
          type: "object",
          properties: {
            title: { type: "string" },
            boardId: { type: "string" },
            link: { type: "string" },
            coverImageUrl: { type: "string" },
            coverImageKeyFrameTime: { type: "number" },
            firstComment: { type: "string", description: "Auto-posted as first comment after publish (max 10000 chars)" },
          },
        },
        linkedinOptions: {
          type: "object",
          properties: {
            documentTitle: { type: "string" },
            organizationUrn: { type: "string" },
            firstComment: { type: "string", description: "Auto-posted as first comment after publish (max 10000 chars). LinkedIn suppresses link-bearing post reach 40-50% — put external URLs here instead of the caption." },
            disableLinkPreview: { type: "boolean" },
          },
        },
        platformOptions: {
          type: "object",
          description: "Raw passthrough to the upstream platformSpecificData. Keys are platform names; values are objects using the platform-native field names. Use for Twitter, Bluesky, Telegram, Snapchat, Google Business, Discord, WhatsApp — and for any field not covered by the typed *Options above.",
          properties: {
            instagram: { type: "object" },
            tiktok: { type: "object" },
            threads: { type: "object" },
            youtube: { type: "object" },
            reddit: { type: "object" },
            facebook: { type: "object" },
            pinterest: { type: "object" },
            linkedin: { type: "object" },
            twitter: { type: "object" },
            bluesky: { type: "object" },
            telegram: { type: "object" },
            snapchat: { type: "object" },
            googlebusiness: { type: "object" },
            discord: { type: "object" },
            whatsapp: { type: "object" },
          },
        },
      },
      required: ["content", "accountIds"],
    },
  },
  {
    name: "aa_list_posts",
    description: [
      "List the user's posts with optional filters. Each post has a platforms[] array — one entry per platform leg.",
      "",
      "═══ PER-LEG STATUS (post-Phase-6e) ═══",
      "Each platforms[i] now carries its own status, publishedAt, errorMessage, and platformPostId — derived from the per-leg",
      "delivery row (aa_post_deliveries), not the legacy posts_mirror. The post-level status is rolled up worst-status-wins:",
      "  - all legs published → 'published'",
      "  - any leg failed → 'failed'",
      "  - any leg posting → 'posting'",
      "  - otherwise → 'scheduled' / 'draft'",
      "Iterate platforms[] to see the actual per-platform outcome — and platforms[i].errorMessage when a leg failed.",
      "",
      "═══ ATTRIBUTION (cross-tenant safety) ═══",
      "When referring to which account a post belongs to, use platforms[i].platformSpecificData.__usernameSnapshot",
      "(snapshot at schedule-time, always safe) — do NOT trust accountId.username or accountId.displayName from a populated",
      "accountId object (can be substituted when the original account was deleted upstream).",
      "If accountId._id isn't in aa_list_accounts for this user, treat the binding as unknown.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        status: { type: "string", enum: ["scheduled", "published", "failed"], description: "Filter by post-level rollup status" },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },
  {
    name: "aa_update_post",
    description: [
      "Update a post's content or time. Behavior depends on whether each leg has published yet:",
      "",
      "─ SCHEDULED legs: caption + scheduledAt are freely editable.",
      "",
      "─ PUBLISHED legs: edit-after-publish capability varies by platform.",
      "  Caption-editable: Instagram (caption + alt text), Facebook, LinkedIn, Pinterest (title/desc/link),",
      "                    Reddit body (NOT title — Reddit policy), YouTube (title + description), Twitter Premium (within 30 min).",
      "  Locked: TikTok, Threads, Bluesky — delete + repost to change.",
      "  Media is locked everywhere once published.",
      "",
      "If you send a caption update for a locked leg, Zernio's API will reject — the dashboard surfaces the error in last_error.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        postId: { type: "string", description: "Post ID" },
        content: { type: "string" },
        scheduledAt: { type: "string" },
      },
      required: ["postId"],
    },
  },
  {
    name: "aa_delete_post",
    description: "Delete a post.",
    inputSchema: {
      type: "object" as const,
      properties: { postId: { type: "string" } },
      required: ["postId"],
    },
  },

  // ── Media ──
  {
    name: "aa_upload_media",
    description: [
      "Get a presigned URL for uploading media. Three-step pattern:",
      "  1) Call this tool → returns { uploadUrl, publicUrl }.",
      "  2) PUT the file bytes to uploadUrl (Cloudflare R2). YOU do this step, not the AA server.",
      "  3) Use publicUrl in a post's mediaItems.",
      "",
      "NETWORK EGRESS NOTE: step 2 PUTs to a Cloudflare R2 host (`*.r2.cloudflarestorage.com`).",
      "If you're running in Claude Desktop or a sandboxed environment and the PUT fails with a network/proxy/blocked error,",
      "the user needs to enable network egress to that host. Tell them:",
      "  - Claude Desktop: Settings → Capabilities → Allow Network Egress → ON, set to \"All Domains\"",
      "    (R2 uses subdomains, so a single-domain allowlist won't catch the bucket host).",
      "  - Claude Cowork / sandboxed runners: ensure the runner's outbound proxy permits *.r2.cloudflarestorage.com.",
      "Do NOT suggest alternative hosting or pasting publicUrl-only — uploads must land in our R2 to be served to the social platforms.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        filename: { type: "string" },
        contentType: { type: "string", description: "MIME type (image/jpeg, image/png, video/mp4, etc.)" },
        size: { type: "number", description: "File size in bytes" },
      },
      required: ["filename", "contentType"],
    },
  },

  // ── Campaigns ──
  {
    name: "aa_list_campaigns",
    description: "List the user's campaigns.",
    inputSchema: { type: "object" as const, properties: {} },
  },
  {
    name: "aa_create_campaign",
    description: "Create a new campaign. After creating, use aa_save_campaign_plan to add the content plan.",
    inputSchema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        objective: { type: "string" },
        duration_days: { type: "number", description: "1, 3, 7, 14, or 30" },
        platforms: { type: "array", items: { type: "string" }, description: "Platform names (instagram, tiktok, etc.)" },
        content_mix: { type: "string", enum: ["images_only", "mostly_images", "mixed", "videos_only", "user_decides"] },
      },
      required: ["name", "objective"],
    },
  },
  {
    name: "aa_save_campaign_plan",
    description: [
      "Save a content plan to a campaign. The plan is an array of day objects with captions per platform, image/video/music prompts.",
      "Creates one campaign_posts row per day.",
      "",
      "Carousel days: pass slideConfigs (or imagePrompts as a back-compat fallback) to drive per-slide generation.",
      "Video days: videoDuration controls clip length; >10s chains multiple FFmpeg-concat'd clips.",
      "Per-day provider override: providerOverrides scopes the generator picker to one day (e.g., rescue a Magnific failure with fal.ai without changing the campaign default).",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        plan: {
          type: "array",
          items: {
            type: "object",
            properties: {
              day: { type: "number" },
              theme: { type: "string" },
              captions: { type: "object", description: "{ platform: caption } per platform" },
              imagePrompt: { type: "string", description: "Image generation prompt" },
              imagePrompts: { type: "array", items: { type: "string" }, description: "Carousel back-compat: per-slide prompts (prefer slideConfigs)" },
              slideConfigs: {
                type: "array",
                description: "Per-slide config for carousels. Each slide can have its own prompt + text overlays.",
                items: {
                  type: "object",
                  properties: {
                    prompt: { type: "string" },
                    overlay: {
                      type: "object",
                      properties: {
                        text: { type: "string" },
                        position: { type: "string", enum: ["top", "center", "bottom"] },
                        style: { type: "string", description: "FFmpeg drawtext style preset" },
                      },
                    },
                  },
                },
              },
              videoPrompt: { type: "string", description: "Video: camera motion / scene description" },
              musicPrompt: { type: "string", description: "Video: music mood description" },
              videoDuration: { type: "number", enum: [5, 10, 20, 30, 60], description: "Video length in seconds. >10s chains multiple clips via FFmpeg" },
              includeMusic: { type: "boolean", description: "Include AI-generated music (default true)" },
              contentType: { type: "string", enum: ["image", "carousel", "video"] },
              providerOverrides: {
                type: "object",
                description: "Per-day generator override (wins over campaign + pen-name defaults). Shape: { image?: { provider, model }, video?: {...}, music?: {...} }",
                properties: {
                  image: {
                    type: "object",
                    properties: {
                      provider: { type: "string", enum: ["magnific", "fal", "gemini"] },
                      model: { type: "string" },
                    },
                  },
                  video: {
                    type: "object",
                    properties: {
                      provider: { type: "string", enum: ["magnific", "fal"] },
                      model: { type: "string" },
                    },
                  },
                  music: {
                    type: "object",
                    properties: {
                      provider: { type: "string", enum: ["magnific", "fal"] },
                      model: { type: "string" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      required: ["campaignId", "plan"],
    },
  },
  {
    name: "aa_generate_media",
    description: [
      "Start generating images/videos/music for a campaign. Returns immediately — poll aa_check_media_status for progress.",
      "",
      "Provider routing (resolved per task type at job start):",
      "  - Per-day override on campaign_posts.provider_overrides → wins for that day",
      "  - Per-campaign override on campaigns.{image,video,music}_provider → next priority",
      "  - Pen-name default on user_ai_settings.{image,video,music}_provider → fallback",
      "Providers: Magnific (default), fal.ai, Google Gemini (image-only).",
      "",
      "Per-post failures are captured into campaign_posts.last_error so the dashboard's DayCard surfaces specific reasons",
      "(e.g., 'Image 1080x1350: fal.ai API error 401: Invalid API key'). Failed days can be re-run individually.",
    ].join("\n"),
    inputSchema: {
      type: "object" as const,
      properties: { campaignId: { type: "string" } },
      required: ["campaignId"],
    },
  },
  {
    name: "aa_check_media_status",
    description:
      "Check media generation progress for a campaign. Returns per-post status + last_error so callers can render granular progress and surface per-day failure reasons.",
    inputSchema: {
      type: "object" as const,
      properties: { campaignId: { type: "string" } },
      required: ["campaignId"],
    },
  },
  {
    name: "aa_schedule_campaign",
    description: "Schedule all ready campaign posts. Maps platforms to account IDs and sets the posting schedule.",
    inputSchema: {
      type: "object" as const,
      properties: {
        campaignId: { type: "string" },
        startDate: { type: "string", description: "ISO date (YYYY-MM-DD)" },
        timezone: { type: "string" },
        scheduleMode: { type: "string", enum: ["spread", "queue", "custom"], description: "spread=one per day, queue=use queue slots, custom=multiple daily times" },
        accountMap: { type: "object", description: "{ platform: accountId } mapping" },
        postTimes: { type: "array", items: { type: "string" }, description: "HH:mm times for spread/custom mode" },
      },
      required: ["campaignId", "startDate", "accountMap"],
    },
  },

  // ── Link shortener (Switchy) ──
  {
    name: "aa_shorten_url",
    description:
      "Shorten a URL to the user's branded domain (storylink.to by default) via Switchy. Use this inline when you're about to paste a long URL into a caption — the short version is cleaner, trackable, and fits in tight character budgets on X/Bluesky. Optionally appends UTM parameters before shortening. Returns { shortUrl, linkId, domain }. Returns a 501 error if the user hasn't configured a link shortener yet — surface the error message to the user so they know to set it up in Settings → Link shortener.",
    inputSchema: {
      type: "object" as const,
      properties: {
        url: {
          type: "string",
          description:
            "The long URL to shorten. Include the https:// prefix. If you want UTM tracking, build the UTM'd URL first (e.g. https://example.com/page?utm_source=instagram&utm_medium=organic&utm_campaign=book-launch) before calling this tool — the result is shortened as-is.",
        },
        customSlug: {
          type: "string",
          description:
            "Optional. A human-readable slug for the short URL — e.g. 'launch' → storylink.to/launch. If omitted, Switchy picks a random short slug. Keep to lowercase letters, numbers, and hyphens.",
        },
        note: {
          type: "string",
          description:
            "Optional free-form note saved with the link in Switchy's dashboard. Useful for the author to remember what a link was for later. Example: 'Curses and Currents — Instagram carousel'.",
        },
        tags: {
          type: "array",
          items: { type: "string" },
          description:
            "Optional list of tags (max ~5). Tags show up in Switchy's dashboard and help filter by campaign/source/book.",
        },
        sourceType: {
          type: "string",
          enum: [
            "manual",
            "utm_builder",
            "compose",
            "campaign_auto",
            "template_auto",
          ],
          description:
            "Where the shortening is happening, used for the Links dashboard filter. Default 'manual'. If Claude is shortening as part of drafting a post, use 'compose'.",
        },
        campaignId: {
          type: "string",
          description:
            "Optional. If the link is for a specific campaign, pass the campaign ID so the link shows up under that campaign in the Links dashboard.",
        },
      },
      required: ["url"],
    },
  },
];

// ── Tool Handlers ──

export async function handleTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case "aa_list_profiles":
      return apiCall("/profiles");

    case "aa_list_accounts":
      return apiCall("/accounts", { params: args.platform ? { platform: args.platform as string } : undefined });

    case "aa_get_guides":
      return apiCall("/guides");

    case "aa_queue_preview":
      return apiCall("/queue/preview", { params: args.count ? { count: String(args.count) } : undefined });

    case "aa_list_queues":
      return apiCall("/queue", {
        params: Object.fromEntries(
          Object.entries({
            queueId: args.queueId,
            all: args.all === true ? "true" : undefined,
          }).filter(([, v]) => v != null) as [string, string][]
        ),
      });

    case "aa_preflight_post":
      return apiCall("/posts/preflight", { method: "POST", body: args });

    case "aa_create_post":
      return apiCall("/posts", { method: "POST", body: args });

    case "aa_list_posts":
      return apiCall("/posts", { params: Object.fromEntries(Object.entries(args).filter(([, v]) => v != null).map(([k, v]) => [k, String(v)])) });

    case "aa_update_post":
      return apiCall(`/posts/${args.postId}`, { method: "PATCH", body: { content: args.content, scheduledAt: args.scheduledAt } });

    case "aa_delete_post":
      return apiCall(`/posts/${args.postId}`, { method: "DELETE" });

    case "aa_upload_media":
      return apiCall("/media/presign", { method: "POST", body: args });

    case "aa_list_campaigns":
      return apiCall("/campaigns");

    case "aa_create_campaign":
      return apiCall("/campaigns", { method: "POST", body: args });

    case "aa_save_campaign_plan":
      return apiCall(`/campaigns/${args.campaignId}/save-plan`, { method: "POST", body: { plan: args.plan } });

    case "aa_generate_media":
      return apiCall(`/campaigns/${args.campaignId}/generate-media`, { method: "POST" });

    case "aa_check_media_status":
      return apiCall(`/campaigns/${args.campaignId}/generate-media`);

    case "aa_schedule_campaign":
      return apiCall(`/campaigns/${args.campaignId}/schedule`, { method: "POST", body: args });

    case "aa_shorten_url":
      return apiCall("/shorten", { method: "POST", body: args });

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
