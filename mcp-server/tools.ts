/**
 * MCP Tool Definitions for Author Automations Social
 */

import { apiCall } from "./client.js";

export const TOOLS = [
  // ── Account & Context ──
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

  // ── Posts ──
  {
    name: "aa_create_post",
    description: "Create and schedule a social media post. Use accountIds from aa_list_accounts. Set publishNow:true to post immediately, or scheduledAt for a specific time.",
    inputSchema: {
      type: "object" as const,
      properties: {
        content: { type: "string", description: "Post text/caption" },
        accountIds: { type: "array", items: { type: "string" }, description: "Account IDs to post to (from aa_list_accounts)" },
        publishNow: { type: "boolean", description: "Publish immediately (default true)" },
        scheduledAt: { type: "string", description: "ISO 8601 datetime to schedule for" },
        timezone: { type: "string", description: "IANA timezone (e.g., America/Chicago)" },
        mediaItems: { type: "array", items: { type: "object", properties: { type: { type: "string" }, url: { type: "string" } } }, description: "Media attachments [{type:'image'|'video', url:'...'}]" },
        tiktokOptions: { type: "object", description: "TikTok-specific options: {draft, privacyLevel, allowComment, allowDuet, allowStitch}" },
      },
      required: ["content", "accountIds"],
    },
  },
  {
    name: "aa_list_posts",
    description: "List the user's posts with optional filters.",
    inputSchema: {
      type: "object" as const,
      properties: {
        status: { type: "string", enum: ["scheduled", "published", "failed"], description: "Filter by status" },
        limit: { type: "number", description: "Max results (default 20)" },
      },
    },
  },
  {
    name: "aa_update_post",
    description: "Update a scheduled post's content or time.",
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
    description: "Get a presigned URL for uploading media. Upload the file via PUT to the uploadUrl, then use the publicUrl in a post's mediaItems.",
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
    description: "Save a content plan to a campaign. The plan is an array of day objects with captions per platform, image prompts, and optional video/music prompts. This creates the campaign posts.",
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
              imagePrompts: { type: "array", items: { type: "string" }, description: "For carousels: per-slide prompts" },
              videoPrompt: { type: "string", description: "For video: camera motion description" },
              musicPrompt: { type: "string", description: "For video: music mood description" },
              videoDuration: { type: "number", enum: [5, 10, 20, 30, 60], description: "Video length in seconds. >10s chains multiple clips via FFmpeg" },
              includeMusic: { type: "boolean", description: "Include AI-generated music (default true)" },
              contentType: { type: "string", enum: ["image", "carousel", "video"] },
            },
          },
        },
      },
      required: ["campaignId", "plan"],
    },
  },
  {
    name: "aa_generate_media",
    description: "Start generating images/videos for a campaign using FreePik AI. Returns immediately — poll aa_check_media_status for progress.",
    inputSchema: {
      type: "object" as const,
      properties: { campaignId: { type: "string" } },
      required: ["campaignId"],
    },
  },
  {
    name: "aa_check_media_status",
    description: "Check media generation progress for a campaign.",
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
    case "aa_list_accounts":
      return apiCall("/accounts", { params: args.platform ? { platform: args.platform as string } : undefined });

    case "aa_get_guides":
      return apiCall("/guides");

    case "aa_queue_preview":
      return apiCall("/queue/preview", { params: args.count ? { count: String(args.count) } : undefined });

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
