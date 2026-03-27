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

    totals = token_totals(agent_ids)
    series_map = daily_series_map(agent_ids)
    attach_token_methods(agents, totals, series_map)
  end

  private_class_method def self.token_totals(agent_ids)
    UsageRecord
      .where(agent_id: agent_ids, recorded_at: 7.days.ago..)
      .group(:agent_id)
      .sum(Arel.sql('input_tokens + output_tokens'))
  end

  private_class_method def self.daily_series_map(agent_ids)
    daily = UsageRecord
            .where(agent_id: agent_ids, recorded_at: 7.days.ago..)
            .group(:agent_id, Arel.sql('DATE(recorded_at)'))
            .order(Arel.sql('DATE(recorded_at)'))
            .sum(Arel.sql('input_tokens + output_tokens'))

    daily.each_with_object({}) do |((aid, _date), total), map|
      (map[aid] ||= []) << total
    end
  end

  private_class_method def self.attach_token_methods(agents, totals, series_map)
    agents.each do |agent|
      raw = series_map[agent.id] || []
      padded = pad_series(raw)
      total = totals[agent.id] || 0

      agent.define_singleton_method(:tokens_7d) { total }
      agent.define_singleton_method(:tokens_7d_series) { padded }
    end
    agents
  end

  private_class_method def self.pad_series(raw)
    padded = Array.new(7, 0)
    tail = raw.last(7)
    tail.each_with_index { |v, i| padded[7 - tail.length + i] = v }
    padded
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
