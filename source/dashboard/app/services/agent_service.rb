# frozen_string_literal: true

class AgentService
  def self.list(filters: {}, sort: nil, dir: 'desc')
    scope = Agent.includes(:tasks).all
    scope = scope.where(status: filters[:status]) if filters[:status].present?
    scope = scope.where(llm_model: filters[:llm_model]) if filters[:llm_model].present?
    apply_sort(scope, sort, dir)
  end

  def self.enrich_with_token_data(agents)
    agent_ids = agents.map(&:id)
    return agents if agent_ids.empty?

    # Single query: total tokens per agent over last 7 days
    totals = UsageRecord
      .where(agent_id: agent_ids, recorded_at: 7.days.ago..)
      .group(:agent_id)
      .sum(Arel.sql('input_tokens + output_tokens'))

    # Single query: daily token series per agent (7 values)
    daily = UsageRecord
      .where(agent_id: agent_ids, recorded_at: 7.days.ago..)
      .group(:agent_id, Arel.sql('DATE(recorded_at)'))
      .order(Arel.sql('DATE(recorded_at)'))
      .sum(Arel.sql('input_tokens + output_tokens'))

    # Build per-agent series hash: { agent_uuid => [day1, day2, ..., day7] }
    series_map = {}
    daily.each do |(aid, _date), total|
      series_map[aid] ||= []
      series_map[aid] << total
    end

    # Pad each agent's series to exactly 7 entries (fill missing days with 0)
    agents.each do |agent|
      raw_series = series_map[agent.id] || []
      padded = Array.new(7, 0)
      raw_series.last(7).each_with_index { |v, i| padded[7 - raw_series.last(7).length + i] = v }

      agent.define_singleton_method(:tokens_7d) { totals[agent.id] || 0 }
      agent.define_singleton_method(:tokens_7d_series) { padded }
    end

    agents
  end

  def self.find(id)
    Agent.find(id)
  end

  def self.create(params)
    Agent.create!(params)
  end

  def self.update(id, params)
    agent = Agent.find(id)
    agent.update!(params)
    agent
  end

  private_class_method def self.apply_sort(scope, sort, dir)
    return scope.order(created_at: :desc) unless sort

    allowed = %w[name status llm_model uptime_since created_at]
    return scope.order(created_at: :desc) unless allowed.include?(sort)

    direction = dir == 'asc' ? :asc : :desc
    scope.order(sort => direction)
  end
end
