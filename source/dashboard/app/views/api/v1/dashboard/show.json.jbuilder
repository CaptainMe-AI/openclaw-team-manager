# frozen_string_literal: true

json.active_agents @dashboard[:active_agents]
json.tasks_in_progress @dashboard[:tasks_in_progress]
json.pending_approvals @dashboard[:pending_approvals]
json.tokens_used_24h @dashboard[:tokens_used_24h]
json.cost_24h_cents @dashboard[:cost_24h_cents]
json.recent_tasks do
  json.array! @dashboard[:recent_tasks], partial: 'api/v1/tasks/task', as: :task
end
json.pending_approval_items do
  json.array! @dashboard[:pending_approval_items], partial: 'api/v1/approvals/approval', as: :approval
end
