import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faExclamationTriangle,
} from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui";
import { useDashboard } from "@/hooks/useDashboard";
import { DashboardKpiCards } from "@/components/dashboard/DashboardKpiCards";
import { ActivityTimeline } from "@/components/dashboard/ActivityTimeline";
import { RecentTasksTable } from "@/components/dashboard/RecentTasksTable";
import { ActionRequired } from "@/components/dashboard/ActionRequired";
import { DashboardTimePeriod } from "@/components/dashboard/DashboardTimePeriod";
import { NewTaskModal } from "@/components/tasks/NewTaskModal";

export function DashboardPage() {
  const [timePeriod, setTimePeriod] = useState("24h");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { data, isLoading, isError, refetch } = useDashboard(timePeriod);

  return (
    <div>
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-text-primary">Overview</h1>
          <p className="text-sm text-text-secondary mt-1">
            Real-time status of your OpenClaw agent fleet.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <DashboardTimePeriod
            value={timePeriod}
            onChange={setTimePeriod}
          />
          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="mr-2" />
            New Task
          </Button>
        </div>
      </div>

      {/* Error State */}
      {isError ? (
        <div className="flex flex-col items-center justify-center py-16">
          <FontAwesomeIcon
            icon={faExclamationTriangle}
            className="text-danger opacity-50 text-[48px]"
          />
          <p className="text-sm font-semibold text-text-primary mt-4">
            Failed to load dashboard
          </p>
          <p className="text-xs text-text-secondary mt-2 max-w-md text-center">
            Unable to fetch dashboard data from the server. Check that the
            Rails server is running and try again.
          </p>
          <Button
            variant="primary"
            className="mt-4"
            onClick={() => refetch()}
          >
            Retry
          </Button>
        </div>
      ) : (
        <>
          {/* KPI Cards Row */}
          <div className="mt-6">
            <DashboardKpiCards data={data} isLoading={isLoading} />
          </div>

          {/* Activity Timeline */}
          <div className="mt-8">
            <ActivityTimeline
              events={data?.activity_events ?? []}
              isLoading={isLoading}
            />
          </div>

          {/* Main Content Area */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <RecentTasksTable
                tasks={data?.recent_tasks ?? []}
                isLoading={isLoading}
              />
            </div>
            <div className="lg:col-span-1">
              <ActionRequired
                approvals={data?.pending_approval_items ?? []}
                isLoading={isLoading}
              />
            </div>
          </div>
        </>
      )}

      {/* New Task Modal */}
      <NewTaskModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
