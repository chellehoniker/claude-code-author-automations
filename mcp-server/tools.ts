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

    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}
