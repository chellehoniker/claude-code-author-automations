"use strict";
/**
 * Author Automations Social API Client
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiCall = apiCall;
exports.getApiKey = getApiKey;
exports.isConfigured = isConfigured;
const fs_1 = require("fs");
const path_1 = require("path");
const os_1 = require("os");
const CONFIG_PATH = (0, path_1.join)((0, os_1.homedir)(), ".config", "author-automations", "config.json");
const BASE_URL = "https://authorautomations.social/api/v1";
function loadConfig() {
    if (!(0, fs_1.existsSync)(CONFIG_PATH)) {
        throw new Error("Not configured. Run /aa-setup in Claude Code to set up your API key.");
    }
    const raw = (0, fs_1.readFileSync)(CONFIG_PATH, "utf-8");
    return JSON.parse(raw);
}
async function apiCall(path, options = {}) {
    const config = loadConfig();
    const baseUrl = config.baseUrl || BASE_URL;
    let url = `${baseUrl}${path}`;
    if (options.params) {
        const searchParams = new URLSearchParams(options.params);
        url += `?${searchParams}`;
    }
    const headers = {
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
        throw new Error(`API error ${response.status}: ${error.error?.message || error.error || response.statusText}`);
    }
    return response.json();
}
function getApiKey() {
    return loadConfig().apiKey;
}
function isConfigured() {
    return (0, fs_1.existsSync)(CONFIG_PATH);
}
