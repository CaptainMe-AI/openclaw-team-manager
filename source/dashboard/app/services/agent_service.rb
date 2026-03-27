# frozen_string_literal: true

class AgentService
  def self.list(filters: {}, sort: nil, dir: 'desc')
    scope = Agent.all
    scope = scope.where(status: filters[:status]) if filters[:status].present?
    scope = scope.where(llm_model: filters[:llm_model]) if filters[:llm_model].present?
    apply_sort(scope, sort, dir)
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
