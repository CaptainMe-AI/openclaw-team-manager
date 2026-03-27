# frozen_string_literal: true

class ApprovalService
  def self.list(filters: {}, sort: nil, dir: "desc")
    scope = Approval.includes(:agent, :resolved_by)
    scope = scope.where(status: filters[:status]) if filters[:status].present?
    scope = scope.where(risk_level: filters[:risk_level]) if filters[:risk_level].present?
    scope = scope.where(approval_type: filters[:approval_type]) if filters[:approval_type].present?
    scope = scope.where(agent_id: filters[:agent_id]) if filters[:agent_id].present?
    apply_sort(scope, sort, dir)
  end

  def self.find(id)
    Approval.find(id)
  end

  def self.approve(id, user)
    approval = Approval.find(id)
    approval.update!(status: "approved", resolved_at: Time.current, resolved_by: user)
    approval
  end

  def self.deny(id, user)
    approval = Approval.find(id)
    approval.update!(status: "denied", resolved_at: Time.current, resolved_by: user)
    approval
  end

  private_class_method def self.apply_sort(scope, sort, dir)
    return scope.order(requested_at: :desc) unless sort
    allowed = %w[title status risk_level approval_type requested_at created_at]
    return scope.order(requested_at: :desc) unless allowed.include?(sort)
    direction = dir == "asc" ? :asc : :desc
    scope.order(sort => direction)
  end
end
