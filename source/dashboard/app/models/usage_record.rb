# frozen_string_literal: true

# == Schema Information
#
# Table name: usage_records
#
#  id            :uuid             not null, primary key
#  api_calls     :integer          default(0), not null
#  cost_cents    :integer          default(0), not null
#  input_tokens  :integer          default(0), not null
#  llm_model     :string
#  output_tokens :integer          default(0), not null
#  recorded_at   :datetime         not null
#  created_at    :datetime         not null
#  updated_at    :datetime         not null
#  agent_id      :uuid             not null
#
# Indexes
#
#  index_usage_records_on_agent_id                  (agent_id)
#  index_usage_records_on_agent_id_and_recorded_at  (agent_id,recorded_at)
#  index_usage_records_on_recorded_at               (recorded_at)
#
# Foreign Keys
#
#  fk_rails_...  (agent_id => agents.id)
#
class UsageRecord < ApplicationRecord
  belongs_to :agent

  validates :recorded_at, presence: true
end
