# frozen_string_literal: true

# == Schema Information
#
# Table name: usage_records
#
#  id            :uuid             not null, primary key
#  api_calls     :integer          default(0), not null
#  cost_cents    :integer          default(0), not null
#  endpoint      :string
#  input_tokens  :integer          default(0), not null
#  latency_ms    :integer
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
#  index_usage_records_on_endpoint                  (endpoint)
#  index_usage_records_on_recorded_at               (recorded_at)
#
# Foreign Keys
#
#  fk_rails_...  (agent_id => agents.id)
#
require 'rails_helper'

RSpec.describe UsageRecord, type: :model do
  subject(:usage_record) { build(:usage_record) }

  describe 'factory' do
    it 'is valid with default attributes' do
      expect(usage_record).to be_valid
    end
  end

  describe 'validations' do
    it 'requires agent' do
      usage_record.agent = nil
      expect(usage_record).not_to be_valid
      expect(usage_record.errors[:agent]).to be_present
    end

    it 'requires recorded_at' do
      usage_record.recorded_at = nil
      expect(usage_record).not_to be_valid
      expect(usage_record.errors[:recorded_at]).to include("can't be blank")
    end
  end

  describe 'associations' do
    it 'belongs to agent' do
      assoc = described_class.reflect_on_association(:agent)
      expect(assoc.macro).to eq(:belongs_to)
    end
  end
end
