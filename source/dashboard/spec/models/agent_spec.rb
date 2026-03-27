# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Agent, type: :model do
  subject(:agent) { build(:agent) }

  describe 'factory' do
    it 'is valid with default attributes' do
      expect(agent).to be_valid
    end
  end

  describe 'validations' do
    it 'requires name' do
      agent.name = ''
      expect(agent).not_to be_valid
      expect(agent.errors[:name]).to include("can't be blank")
    end

    it 'requires agent_id' do
      agent.agent_id = ''
      expect(agent).not_to be_valid
      expect(agent.errors[:agent_id]).to include("can't be blank")
    end

    it 'requires agent_id to be unique' do
      create(:agent, agent_id: 'agt_duplicate')
      duplicate = build(:agent, agent_id: 'agt_duplicate')
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:agent_id]).to include('has already been taken')
    end

    it 'requires status' do
      agent.status = nil
      expect(agent).not_to be_valid
    end
  end

  describe 'enums' do
    it 'defines status enum with active, idle, error, disabled' do
      expect(described_class.statuses).to include(
        "active" => "active",
        "idle" => "idle",
        "error" => "error",
        "disabled" => "disabled"
      )
    end
  end

  describe 'scopes' do
    before do
      create(:agent, status: 'active')
      create(:agent, status: 'idle')
      create(:agent, status: 'error')
      create(:agent, status: 'disabled')
    end

    it 'returns active agents' do
      expect(described_class.active.count).to eq(1)
    end

    it 'returns idle agents' do
      expect(described_class.idle.count).to eq(1)
    end

    it 'returns error agents' do
      expect(described_class.error.count).to eq(1)
    end

    it 'returns disabled agents' do
      expect(described_class.disabled.count).to eq(1)
    end
  end

  describe 'associations' do
    it 'has many tasks' do
      expect(described_class.reflect_on_association(:tasks).macro).to eq(:has_many)
    end

    it 'has many approvals' do
      expect(described_class.reflect_on_association(:approvals).macro).to eq(:has_many)
    end

    it 'has many usage_records' do
      expect(described_class.reflect_on_association(:usage_records).macro).to eq(:has_many)
    end
  end
end
