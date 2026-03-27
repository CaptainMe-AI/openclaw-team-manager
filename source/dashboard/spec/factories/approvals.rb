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
FactoryBot.define do
  factory :approval do
    title { Faker::Lorem.sentence(word_count: 3) }
    description { Faker::Lorem.paragraph }
    approval_type { 'dangerous_command' }
    status { 'pending' }
    risk_level { 'medium' }
    context { { command: 'rm -rf /tmp/cache' } }
    requested_at { Time.current }
    association :agent
    resolved_by { nil }
    resolved_at { nil }
  end
end
