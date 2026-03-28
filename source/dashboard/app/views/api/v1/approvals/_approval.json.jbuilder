# frozen_string_literal: true

json.extract! approval, :id, :title, :description, :approval_type, :status, :risk_level, :context
json.agent_id approval.agent_id
json.agent_name approval.agent&.name
json.resolved_by_id approval.resolved_by_id
json.resolved_by_name approval.resolved_by&.email
json.requested_at approval.requested_at&.iso8601
json.resolved_at approval.resolved_at&.iso8601
json.created_at approval.created_at.iso8601
json.updated_at approval.updated_at.iso8601
