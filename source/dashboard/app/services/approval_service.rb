# frozen_string_literal: true

class ApprovalService
  FILTERABLE_FIELDS = %i[status risk_level approval_type agent_id].freeze

  def self.list(filters: {}, sort: nil, dir: 'desc')
    scope = Approval.includes(:agent, :resolved_by)
    scope = apply_filters(scope, filters)
    apply_sort(scope, sort, dir)
  end

  private_class_method def self.apply_filters(scope, filters)
    FILTERABLE_FIELDS.each do |field|
      scope = scope.where(field => filters[field]) if filters[field].present?
    end
    scope
  end

  def self.find(id)
    Approval.find(id)
  end

  def self.approve(id, user)
    approval = Approval.find(id)
    approval.update!(status: 'approved', resolved_at: Time.current, resolved_by: user)
    approval
  end

  def self.deny(id, user)
    approval = Approval.find(id)
    approval.update!(status: 'denied', resolved_at: Time.current, resolved_by: user)
    approval
  end

  def self.batch_approve(ids, user)
    approvals = Approval.where(id: ids, status: 'pending')
    approvals.each do |approval|
      approval.update!(status: 'approved', resolved_at: Time.current, resolved_by: user)
    end
    approvals
  end

  private_class_method def self.apply_sort(scope, sort, dir)
    return scope.order(requested_at: :desc) unless sort

    allowed = %w[title status risk_level approval_type requested_at created_at]
    return scope.order(requested_at: :desc) unless allowed.include?(sort)

    direction = dir == 'asc' ? :asc : :desc
    scope.order(sort => direction)
  end
end
