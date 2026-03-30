// Value shape interfaces per setting key
export interface DisplayNameValue {
  name: string;
}
export interface TimezoneValue {
  timezone: string;
}
export interface RefreshIntervalValue {
  seconds: number;
}
export interface DefaultBudgetValue {
  amount: number;
}
export interface AutoRestartValue {
  enabled: boolean;
}
export interface AllowedToolsValue {
  tools: string[];
}
export interface BudgetThresholdValue {
  percent: number;
}
export interface FailureAlertValue {
  enabled: boolean;
  consecutive: number;
}
export interface ApprovalTimeoutValue {
  minutes: number;
}
export interface AgentOfflineValue {
  minutes: number;
}
export interface GatewayUrlValue {
  url: string;
}
export interface OpenclawHomeValue {
  path: string;
}
export interface AuthTokenValue {
  token: string;
}
export interface SessionPathValue {
  path: string;
}
export interface DatasourceRefreshValue {
  seconds: number;
}

// Form state: key -> value mapping for all settings
export type SettingsFormState = Record<string, unknown>;

// Helper to extract typed value from a setting
export function getSettingValue<T>(
  settings: SettingsFormState,
  key: string,
  defaultValue: T,
): T {
  const val = settings[key];
  if (val === undefined || val === null) return defaultValue;
  return val as T;
}

// Timezone options (curated list)
export const TIMEZONE_OPTIONS = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "America/New_York (EST/EDT)" },
  { value: "America/Chicago", label: "America/Chicago (CST/CDT)" },
  { value: "America/Denver", label: "America/Denver (MST/MDT)" },
  { value: "America/Los_Angeles", label: "America/Los_Angeles (PST/PDT)" },
  { value: "America/Anchorage", label: "America/Anchorage (AKST/AKDT)" },
  { value: "Pacific/Honolulu", label: "Pacific/Honolulu (HST)" },
  { value: "Europe/London", label: "Europe/London (GMT/BST)" },
  { value: "Europe/Paris", label: "Europe/Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Europe/Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Asia/Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Asia/Shanghai (CST)" },
  { value: "Asia/Kolkata", label: "Asia/Kolkata (IST)" },
  { value: "Australia/Sydney", label: "Australia/Sydney (AEST/AEDT)" },
];

// Dashboard refresh interval options
export const REFRESH_INTERVAL_OPTIONS = [
  { value: 0, label: "Manual" },
  { value: 10, label: "10 seconds" },
  { value: 30, label: "30 seconds" },
  { value: 60, label: "1 minute" },
  { value: 300, label: "5 minutes" },
];

// Available tools for multi-select
export const AVAILABLE_TOOLS = [
  "file_read",
  "file_write",
  "shell_exec",
  "web_search",
  "database_query",
  "code_review",
  "api_call",
  "browser",
];
