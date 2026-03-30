import { SettingsFormRow } from "./SettingsFormRow";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui";
import {
  getSettingValue,
  type SettingsFormState,
  type BudgetThresholdValue,
  type FailureAlertValue,
  type ApprovalTimeoutValue,
  type AgentOfflineValue,
} from "@/types/settings";

interface NotificationsTabProps {
  formState: SettingsFormState;
  onChange: (key: string, value: unknown) => void;
}

export function NotificationsTab({ formState, onChange }: NotificationsTabProps) {
  const failureAlert = getSettingValue<FailureAlertValue>(
    formState,
    "notifications.failure_alert",
    { enabled: true, consecutive: 3 },
  );

  return (
    <div className="space-y-6">
      <SettingsFormRow
        label="Budget Alert Threshold (%)"
        description="Alert when an agent's token usage exceeds this percentage of its budget."
      >
        <Input
          type="number"
          value={
            getSettingValue<BudgetThresholdValue>(formState, "notifications.budget_threshold", {
              percent: 80,
            }).percent
          }
          onChange={(e) =>
            onChange("notifications.budget_threshold", { percent: Number(e.target.value) })
          }
          min={0}
          max={100}
          step={5}
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Consecutive Failure Alert"
        description="Alert after this many consecutive agent failures. Toggle to enable or disable."
      >
        <div className="flex items-center gap-4">
          <Toggle
            checked={failureAlert.enabled}
            onChange={(checked) =>
              onChange("notifications.failure_alert", { ...failureAlert, enabled: checked })
            }
          />
          <Input
            type="number"
            value={failureAlert.consecutive}
            onChange={(e) =>
              onChange("notifications.failure_alert", {
                ...failureAlert,
                consecutive: Number(e.target.value),
              })
            }
            min={1}
            max={10}
            className="w-24"
          />
        </div>
      </SettingsFormRow>

      <SettingsFormRow
        label="Approval Timeout (minutes)"
        description="Alert when an approval request has been waiting longer than this duration."
      >
        <Input
          type="number"
          value={
            getSettingValue<ApprovalTimeoutValue>(
              formState,
              "notifications.approval_timeout_minutes",
              { minutes: 30 },
            ).minutes
          }
          onChange={(e) =>
            onChange("notifications.approval_timeout_minutes", {
              minutes: Number(e.target.value),
            })
          }
          min={1}
          max={1440}
          step={5}
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Agent Offline Alert (minutes)"
        description="Alert when an agent has been offline for longer than this duration."
      >
        <Input
          type="number"
          value={
            getSettingValue<AgentOfflineValue>(formState, "notifications.agent_offline_minutes", {
              minutes: 5,
            }).minutes
          }
          onChange={(e) =>
            onChange("notifications.agent_offline_minutes", {
              minutes: Number(e.target.value),
            })
          }
          min={1}
          max={60}
          step={1}
        />
      </SettingsFormRow>
    </div>
  );
}
