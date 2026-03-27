# frozen_string_literal: true

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
