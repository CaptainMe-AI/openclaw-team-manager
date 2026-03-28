import { format, formatDistanceToNow } from "date-fns";
import { Card, StatusDot } from "@/components/ui";
import type { ActivityEvent } from "@/types/api";

const eventColorMap: Record<
  string,
  "success" | "info" | "warning" | "danger" | "idle"
> = {
  active: "success",
  approved: "success",
  completed: "success",
  task: "info",
  in_progress: "info",
  queued: "info",
  pending: "warning",
  idle: "idle",
  disabled: "idle",
  error: "danger",
  denied: "danger",
  failed: "danger",
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
  isLoading: boolean;
}

function SkeletonTimeline() {
  return (
    <Card>
      <div className="animate-pulse">
        <div className="bg-surface-hover/50 rounded h-4 w-48" />
        <div className="bg-surface-hover/50 rounded h-[48px] w-full mt-4" />
      </div>
    </Card>
  );
}

function getTimeLabel(events: ActivityEvent[]): {
  start: string;
  end: string;
} {
  if (events.length === 0) return { start: "", end: "Now" };

  const earliest = new Date(events[events.length - 1].occurred_at);
  const now = new Date();
  const diffMs = now.getTime() - earliest.getTime();
  const diffHours = diffMs / (1000 * 60 * 60);

  // Use time format for short periods, date format for longer
  const startLabel =
    diffHours <= 24
      ? format(earliest, "HH:mm")
      : format(earliest, "MMM dd");

  return { start: startLabel, end: "Now" };
}

export function ActivityTimeline({
  events,
  isLoading,
}: ActivityTimelineProps) {
  if (isLoading) {
    return <SkeletonTimeline />;
  }

  const labels = getTimeLabel(events);

  return (
    <Card>
      <h2 className="text-sm font-semibold text-text-primary mb-4">
        Agent Activity Timeline
      </h2>
      {events.length === 0 ? (
        <p className="text-sm text-text-secondary py-8 text-center">
          No agent activity in this time period
        </p>
      ) : (
        <div className="overflow-x-auto py-4" style={{ minWidth: 600 }}>
          {/* Dot row */}
          <div className="relative h-8">
            {events.map((event, idx) => {
              const eventTime = new Date(event.occurred_at).getTime();
              const firstTime = new Date(
                events[events.length - 1].occurred_at,
              ).getTime();
              const lastTime = Date.now();
              const range = lastTime - firstTime;
              const position =
                range > 0
                  ? ((eventTime - firstTime) / range) * 100
                  : 50;

              const status = eventColorMap[event.type] ?? "idle";

              return (
                <div
                  key={`${event.occurred_at}-${idx}`}
                  className="group absolute top-1/2 -translate-y-1/2 -translate-x-1/2"
                  style={{ left: `${position}%` }}
                >
                  <StatusDot status={status} size="md" />
                  {/* Tooltip */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-surface border border-border rounded-md shadow-lg px-3 py-2 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-10 whitespace-nowrap pointer-events-none">
                    {event.agent_name && (
                      <p className="text-xs font-semibold text-text-primary">
                        {event.agent_name}
                      </p>
                    )}
                    <p className="text-xs text-text-secondary">
                      {event.label}
                    </p>
                    <p className="text-xs font-mono text-text-secondary">
                      {formatDistanceToNow(new Date(event.occurred_at), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          {/* Time axis */}
          <div className="flex justify-between mt-2">
            <span className="text-xs font-mono text-text-secondary">
              {labels.start}
            </span>
            <span className="text-xs font-mono text-text-secondary">
              {labels.end}
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}
