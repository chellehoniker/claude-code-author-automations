/**
 * MCP Tool Definitions for Author Automations Social
 */
export declare const TOOLS: ({
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            platform: {
                type: string;
                description: string;
            };
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            count: {
                type: string;
                description: string;
            };
            platform?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            content: {
                type: string;
                description: string;
            };
            accountIds: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            publishNow: {
                type: string;
                description: string;
            };
            scheduledAt: {
                type: string;
                description: string;
            };
            timezone: {
                type: string;
                description: string;
            };
            mediaItems: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        type: {
                            type: string;
                        };
                        url: {
                            type: string;
                        };
                    };
                };
                description: string;
            };
            tiktokOptions: {
                type: string;
                description: string;
            };
            platform?: undefined;
            count?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            limit: {
                type: string;
                description: string;
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required?: undefined;
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            postId: {
                type: string;
                description: string;
            };
            content: {
                type: string;
                description?: undefined;
            };
            scheduledAt: {
                type: string;
                description?: undefined;
            };
            platform?: undefined;
            count?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            postId: {
                type: string;
                description?: undefined;
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            filename: {
                type: string;
            };
            contentType: {
                type: string;
                description: string;
            };
            size: {
                type: string;
                description: string;
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            name: {
                type: string;
            };
            objective: {
                type: string;
            };
            duration_days: {
                type: string;
                description: string;
            };
            platforms: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            content_mix: {
                type: string;
                enum: string[];
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            campaignId?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            campaignId: {
                type: string;
                description?: undefined;
            };
            plan: {
                type: string;
                items: {
                    type: string;
                    properties: {
                        day: {
                            type: string;
                        };
                        theme: {
                            type: string;
                        };
                        captions: {
                            type: string;
                            description: string;
                        };
                        imagePrompt: {
                            type: string;
                            description: string;
                        };
                        imagePrompts: {
                            type: string;
                            items: {
                                type: string;
                            };
                            description: string;
                        };
                        videoPrompt: {
                            type: string;
                            description: string;
                        };
                        musicPrompt: {
                            type: string;
                            description: string;
                        };
                        videoDuration: {
                            type: string;
                            enum: number[];
                            description: string;
                        };
                        includeMusic: {
                            type: string;
                            description: string;
                        };
                        contentType: {
                            type: string;
                            enum: string[];
                        };
                    };
                };
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            campaignId: {
                type: string;
                description?: undefined;
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            campaignId: {
                type: string;
                description?: undefined;
            };
            startDate: {
                type: string;
                description: string;
            };
            timezone: {
                type: string;
                description?: undefined;
            };
            scheduleMode: {
                type: string;
                enum: string[];
                description: string;
            };
            accountMap: {
                type: string;
                description: string;
            };
            postTimes: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            plan?: undefined;
            url?: undefined;
            customSlug?: undefined;
            note?: undefined;
            tags?: undefined;
            sourceType?: undefined;
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: "object";
        properties: {
            url: {
                type: string;
                description: string;
            };
            customSlug: {
                type: string;
                description: string;
            };
            note: {
                type: string;
                description: string;
            };
            tags: {
                type: string;
                items: {
                    type: string;
                };
                description: string;
            };
            sourceType: {
                type: string;
                enum: string[];
                description: string;
            };
            campaignId: {
                type: string;
                description: string;
            };
            platform?: undefined;
            count?: undefined;
            content?: undefined;
            accountIds?: undefined;
            publishNow?: undefined;
            scheduledAt?: undefined;
            timezone?: undefined;
            mediaItems?: undefined;
            tiktokOptions?: undefined;
            status?: undefined;
            limit?: undefined;
            postId?: undefined;
            filename?: undefined;
            contentType?: undefined;
            size?: undefined;
            name?: undefined;
            objective?: undefined;
            duration_days?: undefined;
            platforms?: undefined;
            content_mix?: undefined;
            plan?: undefined;
            startDate?: undefined;
            scheduleMode?: undefined;
            accountMap?: undefined;
            postTimes?: undefined;
        };
        required: string[];
    };
})[];
export declare function handleTool(name: string, args: Record<string, unknown>): Promise<unknown>;
