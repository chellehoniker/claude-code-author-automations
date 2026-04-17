/**
 * Author Automations Social API Client
 */
export declare function apiCall(path: string, options?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string>;
}): Promise<unknown>;
export declare function getApiKey(): string;
export declare function isConfigured(): boolean;
