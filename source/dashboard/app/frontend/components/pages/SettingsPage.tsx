import { useState, useEffect, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFloppyDisk, faRotateLeft, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { Button, Card } from "@/components/ui";
import { useSettings, useUpdateSetting } from "@/hooks/useSettings";
import { SettingsTabs, type SettingsTab } from "@/components/settings/SettingsTabs";
import { GeneralTab } from "@/components/settings/GeneralTab";
import { AgentsTab } from "@/components/settings/AgentsTab";
import { NotificationsTab } from "@/components/settings/NotificationsTab";
import { DataSourcesTab } from "@/components/settings/DataSourcesTab";
import type { SettingsFormState } from "@/types/settings";

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [formState, setFormState] = useState<SettingsFormState>({});
  const [originalState, setOriginalState] = useState<SettingsFormState>({});
  const [isSaving, setIsSaving] = useState(false);

  const { data, isLoading, isError, refetch } = useSettings();
  const updateSetting = useUpdateSetting();

  useEffect(() => {
    if (data?.data) {
      const initial: SettingsFormState = {};
      data.data.forEach((s) => {
        initial[s.key] = s.value;
      });
      setFormState(initial);
      setOriginalState(initial);
    }
  }, [data]);

  const isDirty = JSON.stringify(formState) !== JSON.stringify(originalState);

  const handleFieldChange = useCallback((key: string, value: unknown) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  }, []);

  function getChangedKeys(): string[] {
    return Object.keys(formState).filter(
      (key) => JSON.stringify(formState[key]) !== JSON.stringify(originalState[key]),
    );
  }

  async function handleSave() {
    const changedKeys = getChangedKeys();
    if (changedKeys.length === 0) return;
    setIsSaving(true);
    try {
      await Promise.all(
        changedKeys.map((key) =>
          updateSetting.mutateAsync({ key, value: formState[key] }),
        ),
      );
      setOriginalState({ ...formState });
      toast.success(`Settings saved (${changedKeys.length} updated)`);
    } catch {
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscard() {
    setFormState({ ...originalState });
    toast("Changes discarded");
  }

  function renderTabContent() {
    switch (activeTab) {
      case "general":
        return <GeneralTab formState={formState} onChange={handleFieldChange} />;
      case "agents":
        return <AgentsTab formState={formState} onChange={handleFieldChange} />;
      case "notifications":
        return <NotificationsTab formState={formState} onChange={handleFieldChange} />;
      case "datasources":
        return <DataSourcesTab formState={formState} onChange={handleFieldChange} />;
    }
  }

  if (isError && !isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage global preferences, agent policies, and data integrations.
            </p>
          </div>
        </div>
        <div className="mt-16 flex flex-col items-center justify-center">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-danger opacity-50"
            style={{ fontSize: 48 }}
          />
          <h2 className="text-sm font-semibold text-text-primary mt-4">
            Failed to load settings
          </h2>
          <p className="text-xs text-text-secondary mt-2">
            Unable to fetch settings from the server.
          </p>
          <div className="mt-4">
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
            <p className="text-sm text-text-secondary mt-1">
              Manage global preferences, agent policies, and data integrations.
            </p>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-surface-hover/50 rounded-md h-10 w-full"
              />
            ))}
          </div>
          <div className="lg:col-span-3 space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="animate-pulse bg-surface-hover/50 rounded-md h-16 w-full"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Settings</h1>
          <p className="text-sm text-text-secondary mt-1">
            Manage global preferences, agent policies, and data integrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            disabled={!isDirty || isSaving}
            onClick={handleDiscard}
          >
            <FontAwesomeIcon icon={faRotateLeft} className="w-3.5 h-3.5" />
            Discard Changes
          </Button>
          <Button
            variant="primary"
            disabled={!isDirty || isSaving}
            onClick={handleSave}
          >
            <FontAwesomeIcon icon={faFloppyDisk} className="w-3.5 h-3.5" />
            {isSaving ? "Saving..." : "Save Configuration"}
          </Button>
        </div>
      </div>

      {isDirty && (
        <div className="mt-4 flex items-center gap-2 text-xs text-warning">
          <span className="w-2 h-2 rounded-full bg-warning" />
          You have unsaved changes
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <SettingsTabs active={activeTab} onChange={setActiveTab} />
        </div>
        <div className="lg:col-span-3">
          <Card>{renderTabContent()}</Card>
        </div>
      </div>
    </div>
  );
}
