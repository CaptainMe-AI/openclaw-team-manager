import { SettingsFormRow } from "./SettingsFormRow";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import {
  getSettingValue,
  TIMEZONE_OPTIONS,
  REFRESH_INTERVAL_OPTIONS,
  type SettingsFormState,
  type DisplayNameValue,
  type TimezoneValue,
  type RefreshIntervalValue,
} from "@/types/settings";

interface GeneralTabProps {
  formState: SettingsFormState;
  onChange: (key: string, value: unknown) => void;
}

export function GeneralTab({ formState, onChange }: GeneralTabProps) {
  return (
    <div className="space-y-6">
      <SettingsFormRow
        label="Display Name"
        description="The name shown in the top navigation and browser tab."
      >
        <Input
          value={
            getSettingValue<DisplayNameValue>(formState, "general.display_name", { name: "" }).name
          }
          onChange={(e) => onChange("general.display_name", { name: e.target.value })}
          placeholder="OpenClaw Dashboard"
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Timezone"
        description="Used for timestamps and scheduled task displays."
      >
        <select
          value={
            getSettingValue<TimezoneValue>(formState, "general.timezone", { timezone: "UTC" })
              .timezone
          }
          onChange={(e) => onChange("general.timezone", { timezone: e.target.value })}
          className={cn(
            "w-full bg-background border border-border rounded-md py-2 px-3",
            "text-sm text-text-primary",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
          )}
        >
          {TIMEZONE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </SettingsFormRow>

      <SettingsFormRow
        label="Dashboard Refresh Interval"
        description="How often the dashboard auto-refreshes data. Set to Manual for no auto-refresh."
      >
        <select
          value={String(
            getSettingValue<RefreshIntervalValue>(formState, "general.refresh_interval", {
              seconds: 30,
            }).seconds,
          )}
          onChange={(e) =>
            onChange("general.refresh_interval", { seconds: Number(e.target.value) })
          }
          className={cn(
            "w-full bg-background border border-border rounded-md py-2 px-3",
            "text-sm text-text-primary",
            "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
          )}
        >
          {REFRESH_INTERVAL_OPTIONS.map((opt) => (
            <option key={opt.value} value={String(opt.value)}>
              {opt.label}
            </option>
          ))}
        </select>
      </SettingsFormRow>
    </div>
  );
}
