import { SettingsFormRow } from "./SettingsFormRow";
import { Input } from "@/components/ui";
import {
  getSettingValue,
  type SettingsFormState,
  type GatewayUrlValue,
  type AuthTokenValue,
  type OpenclawHomeValue,
  type SessionPathValue,
  type DatasourceRefreshValue,
} from "@/types/settings";

interface DataSourcesTabProps {
  formState: SettingsFormState;
  onChange: (key: string, value: unknown) => void;
}

export function DataSourcesTab({ formState, onChange }: DataSourcesTabProps) {
  return (
    <div className="space-y-6">
      <SettingsFormRow
        label="Gateway WebSocket URL"
        description="WebSocket endpoint for the OpenClaw Gateway."
      >
        <Input
          value={
            getSettingValue<GatewayUrlValue>(formState, "datasource.gateway_url", { url: "" }).url
          }
          onChange={(e) => onChange("datasource.gateway_url", { url: e.target.value })}
          placeholder="ws://127.0.0.1:18789"
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Auth Token"
        description="Authentication token for the Gateway connection."
      >
        <Input
          type="password"
          value={
            getSettingValue<AuthTokenValue>(formState, "datasource.auth_token", { token: "" }).token
          }
          onChange={(e) => onChange("datasource.auth_token", { token: e.target.value })}
          placeholder="Enter auth token"
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="OpenClaw Home Directory"
        description="Root directory where OpenClaw stores its configuration and data."
      >
        <Input
          value={
            getSettingValue<OpenclawHomeValue>(formState, "datasource.openclaw_home", { path: "" })
              .path
          }
          onChange={(e) => onChange("datasource.openclaw_home", { path: e.target.value })}
          placeholder="~/.openclaw"
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Agent Session Path"
        description="Directory where OpenClaw stores agent session data."
      >
        <Input
          value={
            getSettingValue<SessionPathValue>(formState, "datasource.session_path", { path: "" })
              .path
          }
          onChange={(e) => onChange("datasource.session_path", { path: e.target.value })}
          placeholder="~/.openclaw/agents/"
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Data Refresh Interval"
        description="How often to poll the data sources for updates (in seconds)."
      >
        <Input
          type="number"
          value={
            getSettingValue<DatasourceRefreshValue>(formState, "datasource.refresh_interval", {
              seconds: 5,
            }).seconds
          }
          onChange={(e) =>
            onChange("datasource.refresh_interval", { seconds: Number(e.target.value) })
          }
          min={1}
          max={300}
          step={1}
        />
      </SettingsFormRow>
    </div>
  );
}
