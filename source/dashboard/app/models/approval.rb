# frozen_string_literal: true

# == Schema Information
#
# Table name: approvals
#
#  id             :uuid             not null, primary key
#  approval_type  :string           not null
#  context        :jsonb
#  description    :text
#  requested_at   :datetime         not null
#  resolved_at    :datetime
#  risk_level     :string           default("medium"), not null
#  status         :string           default("pending"), not null
#  title          :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  agent_id       :uuid
#  resolved_by_id :uuid
#
# Indexes
#
#  index_approvals_on_agent_id        (agent_id)
#  index_approvals_on_approval_type   (approval_type)
#  index_approvals_on_resolved_by_id  (resolved_by_id)
#  index_approvals_on_risk_level      (risk_level)
#  index_approvals_on_status          (status)
#
# Foreign Keys
#
#  fk_rails_...  (agent_id => agents.id)
#  fk_rails_...  (resolved_by_id => users.id)
#
class Approval < ApplicationRecord
  enum :approval_type, { dangerous_command: "dangerous_command", sensitive_data: "sensitive_data",
                         budget_override: "budget_override" }
  enum :status, { pending: "pending", approved: "approved", denied: "denied" }
  enum :risk_level, { low: "low", medium: "medium", high: "high", critical: "critical" }

  belongs_to :agent, optional: true
  belongs_to :resolved_by, class_name: "User", optional: true

  validates :title, presence: true
  validates :approval_type, presence: true
  validates :status, presence: true
  validates :risk_level, presence: true
  validates :requested_at, presence: true
end
