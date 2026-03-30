import { SettingsFormRow } from "./SettingsFormRow";
import { ToolChipSelect } from "./ToolChipSelect";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui";
import {
  getSettingValue,
  AVAILABLE_TOOLS,
  type SettingsFormState,
  type DefaultBudgetValue,
  type AutoRestartValue,
  type AllowedToolsValue,
} from "@/types/settings";

interface AgentsTabProps {
  formState: SettingsFormState;
  onChange: (key: string, value: unknown) => void;
}

export function AgentsTab({ formState, onChange }: AgentsTabProps) {
  return (
    <div className="space-y-6">
      <SettingsFormRow
        label="Default Agent Budget (cents)"
        description="The default token budget allocated to new agents. Value in cents."
      >
        <Input
          type="number"
          value={
            getSettingValue<DefaultBudgetValue>(formState, "agents.default_budget_cents", {
              amount: 10000,
            }).amount
          }
          onChange={(e) =>
            onChange("agents.default_budget_cents", { amount: Number(e.target.value) })
          }
          min={0}
          step={100}
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Auto-Restart on Failure"
        description="Automatically restart agents when they encounter an error."
      >
        <Toggle
          checked={
            getSettingValue<AutoRestartValue>(formState, "agents.auto_restart", {
              enabled: true,
            }).enabled
          }
          onChange={(checked) => onChange("agents.auto_restart", { enabled: checked })}
        />
      </SettingsFormRow>

      <SettingsFormRow
        label="Global Allowed Tools"
        description="Tools available to all agents by default. Individual agents can have additional tools."
      >
        <ToolChipSelect
          selected={
            getSettingValue<AllowedToolsValue>(formState, "agents.allowed_tools", {
              tools: [],
            }).tools
          }
          available={AVAILABLE_TOOLS}
          onChange={(tools) => onChange("agents.allowed_tools", { tools })}
        />
      </SettingsFormRow>
    </div>
  );
}
