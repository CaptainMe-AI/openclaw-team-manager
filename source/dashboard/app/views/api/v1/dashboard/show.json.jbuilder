# frozen_string_literal: true

json.active_agents @dashboard[:active_agents]
json.tasks_in_progress @dashboard[:tasks_in_progress]
json.pending_approvals @dashboard[:pending_approvals]
json.tokens_used_24h @dashboard[:tokens_used_24h]
json.cost_24h_cents @dashboard[:cost_24h_cents]

json.active_agents_trend @dashboard[:active_agents_trend]
json.tasks_in_progress_trend @dashboard[:tasks_in_progress_trend]
json.pending_approvals_trend @dashboard[:pending_approvals_trend]
json.tokens_trend @dashboard[:tokens_trend]

json.recent_tasks do
  json.array! @dashboard[:recent_tasks], partial: 'api/v1/tasks/task', as: :task
end
json.pending_approval_items do
  json.array! @dashboard[:pending_approval_items], partial: 'api/v1/approvals/approval', as: :approval
end

json.activity_events do
  json.array! @dashboard[:activity_events] do |event|
    json.type event[:type]
    json.label event[:label]
    json.agent_name event[:agent_name]
    json.occurred_at event[:occurred_at]&.iso8601
  end
end
