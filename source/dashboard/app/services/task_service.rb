# frozen_string_literal: true

class TaskService
  def self.list(filters: {}, sort: nil, dir: 'desc')
    scope = Task.all
    scope = scope.where(status: filters[:status]) if filters[:status].present?
    scope = scope.where(priority: filters[:priority]) if filters[:priority].present?
    scope = scope.where(agent_id: filters[:agent_id]) if filters[:agent_id].present?
    apply_sort(scope, sort, dir)
  end

  def self.find(id)
    Task.find(id)
  end

  def self.create(params)
    Task.create!(params)
  end

  def self.update(id, params)
    task = Task.find(id)
    task.update!(params)
    task
  end

  private_class_method def self.apply_sort(scope, sort, dir)
    return scope.order(created_at: :desc) unless sort

    allowed = %w[title status priority created_at]
    return scope.order(created_at: :desc) unless allowed.include?(sort)

    direction = dir == 'asc' ? :asc : :desc
    scope.order(sort => direction)
  end
end
