# frozen_string_literal: true

class DashboardService
  def self.summary
    cutoff = 24.hours.ago

    {
      active_agents: Agent.active.count,
      tasks_in_progress: Task.in_progress.count,
      pending_approvals: Approval.pending.count,
      tokens_used_24h: UsageRecord.where(recorded_at: cutoff..).sum('input_tokens + output_tokens'),
      cost_24h_cents: UsageRecord.where(recorded_at: cutoff..).sum(:cost_cents),
      recent_tasks: Task.order(created_at: :desc).limit(5),
      pending_approval_items: Approval.pending.order(requested_at: :asc).limit(5).includes(:agent)
    }
  end
end
