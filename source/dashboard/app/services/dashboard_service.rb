# frozen_string_literal: true

class DashboardService
  def self.summary(from: 24.hours.ago, to: Time.current)
    scoped_usage = UsageRecord.where(recorded_at: from..to)

    {
      **counts,
      tokens_used_24h: scoped_usage.sum('input_tokens + output_tokens'),
      cost_24h_cents: scoped_usage.sum(:cost_cents),
      **trend_fields(from, to),
      recent_tasks: Task.where(created_at: from..to).order(created_at: :desc).limit(5).includes(:agent),
      pending_approval_items: Approval.pending.order(requested_at: :asc).limit(5).includes(:agent),
      activity_events: activity_events(from, to)
    }
  end

  private_class_method def self.counts
    {
      active_agents: Agent.active.count,
      tasks_in_progress: Task.in_progress.count,
      pending_approvals: Approval.pending.count
    }
  end

  private_class_method def self.trend_fields(from, to)
    prev = previous_period(from, to)
    prev_tokens = UsageRecord.where(recorded_at: prev[:from]..prev[:to]).sum('input_tokens + output_tokens')
    current_tokens = UsageRecord.where(recorded_at: from..to).sum('input_tokens + output_tokens')

    {
      active_agents_trend: nil,
      tasks_in_progress_trend: nil,
      pending_approvals_trend: nil,
      tokens_trend: percent_change(prev_tokens, current_tokens)
    }
  end

  private_class_method def self.activity_events(from, to)
    events = []
    events.concat(agent_events(from, to))
    events.concat(task_events(from, to))
    events.concat(approval_events(from, to))
    events.sort_by { |e| e[:occurred_at] }.last(20)
  end

  private_class_method def self.agent_events(from, to)
    Agent.where(updated_at: from..to).map do |agent|
      {
        type: agent.status,
        label: "#{agent.name} became #{agent.status}",
        agent_name: agent.name,
        occurred_at: agent.updated_at
      }
    end
  end

  private_class_method def self.task_events(from, to)
    Task.where(updated_at: from..to).includes(:agent).map do |task|
      {
        type: 'task',
        label: "#{task.title} - #{task.status}",
        agent_name: task.agent&.name,
        occurred_at: task.updated_at
      }
    end
  end

  private_class_method def self.approval_events(from, to)
    approvals_in_range(from, to).map do |approval|
      {
        type: approval.status,
        label: approval.title,
        agent_name: approval.agent&.name,
        occurred_at: approval.resolved_at || approval.requested_at
      }
    end
  end

  private_class_method def self.approvals_in_range(from, to)
    Approval.where(requested_at: from..to)
            .or(Approval.where(resolved_at: from..to))
            .includes(:agent)
  end

  private_class_method def self.previous_period(from, to)
    duration = to - from
    { from: from - duration, to: from }
  end

  private_class_method def self.percent_change(old_val, new_val)
    return nil if old_val.nil? || old_val.to_i.zero?

    ((new_val.to_f - old_val.to_f) / old_val.to_f * 100).round(1)
  end
end
