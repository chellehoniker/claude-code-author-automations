/**
 * Author Automations Social API Client
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { homedir } from "os";

const CONFIG_PATH = join(homedir(), ".config", "author-automations", "config.json");
const BASE_URL = "https://authorautomations.social/api/v1";

interface Config {
  apiKey: string;
  baseUrl?: string;
}

function loadConfig(): Config {
  if (!existsSync(CONFIG_PATH)) {
    throw new Error(
      "Not configured. Run /aa-setup in Claude Code to set up your API key."
    );
  }
  const raw = readFileSync(CONFIG_PATH, "utf-8");
  return JSON.parse(raw);
}

export async function apiCall(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    params?: Record<string, string>;
  } = {}
): Promise<unknown> {
  const config = loadConfig();
  const baseUrl = config.baseUrl || BASE_URL;

  let url = `${baseUrl}${path}`;
  if (options.params) {
    const searchParams = new URLSearchParams(options.params);
    url += `?${searchParams}`;
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiKey}`,
    "Content-Type": "application/json",
  };

  const response = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(
      `API error ${response.status}: ${error.error?.message || error.error || response.statusText}`
    );
  }

  return response.json();
}

export function getApiKey(): string {
  return loadConfig().apiKey;
}

export function isConfigured(): boolean {
  return existsSync(CONFIG_PATH);
}
