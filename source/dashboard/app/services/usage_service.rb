# frozen_string_literal: true

class UsageService
  def self.list(filters: {})
    scope = UsageRecord.includes(:agent)
    scope = scope.where(agent_id: filters[:agent_id]) if filters[:agent_id].present?
    scope = scope.where(recorded_at: Time.zone.parse(filters[:from])..) if filters[:from].present?
    scope = scope.where(recorded_at: ..Time.zone.parse(filters[:to])) if filters[:to].present?
    scope.order(recorded_at: :asc)
  end

  def self.summary(from:, to:)
    scope = UsageRecord.all
    scope = scope.where(recorded_at: from..)
    scope = scope.where(recorded_at: ..to)

    {
      total_tokens: scope.sum('input_tokens + output_tokens'),
      total_api_calls: scope.sum(:api_calls),
      total_cost_cents: scope.sum(:cost_cents),
      avg_latency_ms: nil,
      records: scope.order(recorded_at: :asc)
    }
  end
end
