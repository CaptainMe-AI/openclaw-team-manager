# frozen_string_literal: true

class DashboardService
  def self.summary
    recent_usage = UsageRecord.where(recorded_at: 24.hours.ago..)

    {
      **counts,
      tokens_used_24h: recent_usage.sum('input_tokens + output_tokens'),
      cost_24h_cents: recent_usage.sum(:cost_cents),
      recent_tasks: Task.order(created_at: :desc).limit(5),
      pending_approval_items: Approval.pending.order(requested_at: :asc).limit(5).includes(:agent)
    }
  end

  private_class_method def self.counts
    {
      active_agents: Agent.active.count,
      tasks_in_progress: Task.in_progress.count,
      pending_approvals: Approval.pending.count
    }
  end
end
