# frozen_string_literal: true

class UsageService
  def self.list(filters: {})
    scope = UsageRecord.includes(:agent)
    scope = apply_filters(scope, filters)
    scope.order(recorded_at: :asc)
  end

  private_class_method def self.apply_filters(scope, filters)
    scope = scope.where(agent_id: filters[:agent_id]) if filters[:agent_id].present?
    scope = scope.where(recorded_at: Time.zone.parse(filters[:from])..) if filters[:from].present?
    scope = scope.where(recorded_at: ..Time.zone.parse(filters[:to])) if filters[:to].present?
    scope
  end

  def self.summary(from:, to:)
    scope = UsageRecord.where(recorded_at: from..to)

    {
      total_tokens: scope.sum('input_tokens + output_tokens'),
      total_api_calls: scope.sum(:api_calls),
      total_cost_cents: scope.sum(:cost_cents),
      avg_latency_ms: scope.where.not(latency_ms: nil).average(:latency_ms)&.round(0)
    }
  end

  def self.summary_with_trends(from:, to:)
    current = summary(from: from, to: to)
    previous = summary(**previous_period(from, to))

    current.merge(trend_fields(previous, current))
  end

  def self.by_agent_over_time(from:, to:, granularity: 'hour')
    trunc = validated_granularity(granularity)
    token_query(from, to, trunc)
      .map { |bucket, name, _id, tokens| { bucket: bucket, agent_name: name, total_tokens: tokens } }
  end

  def self.cost_by_agent(from:, to:)
    UsageRecord
      .joins(:agent)
      .where(recorded_at: from..to)
      .group('agents.name')
      .order(Arel.sql('SUM(cost_cents) DESC'))
      .pluck('agents.name', Arel.sql('SUM(cost_cents) AS total_cost'))
      .map { |name, cost| { agent_name: name, cost_cents: cost } }
  end

  def self.calls_by_endpoint(from:, to:)
    UsageRecord
      .where(recorded_at: from..to)
      .where.not(endpoint: nil)
      .group(:endpoint)
      .order(Arel.sql('SUM(api_calls) DESC'))
      .pluck(:endpoint, Arel.sql('SUM(api_calls) AS total_calls'))
      .map { |endpoint, calls| { endpoint: endpoint, total_calls: calls } }
  end

  def self.latency_distribution(from:, to:)
    buckets = [[0, 100], [100, 200], [200, 300], [300, 400], [400, 500], [500, 750], [750, 1000]]
    scope = UsageRecord.where(recorded_at: from..to).where.not(latency_ms: nil)

    result = buckets.map do |low, high|
      { range: "#{low}-#{high}ms", count: scope.where(latency_ms: low...high).count }
    end
    result << { range: '1000ms+', count: scope.where(latency_ms: 1000..).count }
    result
  end

  private_class_method def self.previous_period(from, to)
    duration = to - from
    { from: from - duration, to: from }
  end

  private_class_method def self.trend_fields(previous, current)
    {
      token_trend: percent_change(previous[:total_tokens], current[:total_tokens]),
      api_calls_trend: percent_change(previous[:total_api_calls], current[:total_api_calls]),
      cost_trend: percent_change(previous[:total_cost_cents], current[:total_cost_cents]),
      latency_trend: percent_change(previous[:avg_latency_ms], current[:avg_latency_ms])
    }
  end

  private_class_method def self.validated_granularity(granularity)
    %w[hour day].include?(granularity) ? granularity : 'hour'
  end

  private_class_method def self.token_query(from, to, trunc)
    trunc_sql = "date_trunc('#{trunc}', recorded_at)"
    UsageRecord
      .joins(:agent)
      .where(recorded_at: from..to)
      .group(Arel.sql(trunc_sql), 'agents.name', 'agents.id')
      .order(Arel.sql(trunc_sql))
      .pluck(
        Arel.sql("#{trunc_sql} AS bucket"), 'agents.name', 'agents.id',
        Arel.sql('SUM(input_tokens + output_tokens) AS total_tokens')
      )
  end

  private_class_method def self.percent_change(old_val, new_val)
    return nil if old_val.nil? || old_val.to_i.zero?

    ((new_val.to_f - old_val.to_f) / old_val.to_f * 100).round(1)
  end
end
