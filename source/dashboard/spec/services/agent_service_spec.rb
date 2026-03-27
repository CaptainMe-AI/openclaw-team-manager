# frozen_string_literal: true

require 'rails_helper'

RSpec.describe AgentService do
  describe '.list' do
    let!(:active_agent) { create(:agent, status: 'active', llm_model: 'opus') }
    let!(:idle_agent) { create(:agent, status: 'idle', llm_model: 'sonnet') }

    it 'returns all agents' do
      result = described_class.list
      expect(result).to include(active_agent, idle_agent)
    end

    it 'filters by status' do
      result = described_class.list(filters: { status: 'active' })
      expect(result).to include(active_agent)
      expect(result).not_to include(idle_agent)
    end

    it 'filters by llm_model' do
      result = described_class.list(filters: { llm_model: 'opus' })
      expect(result).to include(active_agent)
      expect(result).not_to include(idle_agent)
    end

    it 'sorts by name ascending' do
      result = described_class.list(sort: 'name', dir: 'asc')
      names = result.map(&:name)
      expect(names).to eq(names.sort)
    end

    it 'defaults to created_at desc sort' do
      result = described_class.list
      expect(result.first.created_at).to be >= result.last.created_at
    end

    it 'ignores invalid sort columns' do
      result = described_class.list(sort: 'invalid_column')
      expect(result).to include(active_agent, idle_agent)
    end
  end

  describe '.find' do
    let!(:agent) { create(:agent) }

    it 'returns the agent by id' do
      result = described_class.find(agent.id)
      expect(result).to eq(agent)
    end

    it 'raises RecordNotFound for invalid id' do
      expect { described_class.find(SecureRandom.uuid) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe '.create' do
    it 'creates a new agent' do
      params = { name: 'test-agent', agent_id: 'agt_test001', status: 'active' }
      agent = described_class.create(params)
      expect(agent).to be_persisted
      expect(agent.name).to eq('test-agent')
    end

    it 'raises RecordInvalid for invalid params' do
      expect { described_class.create(name: '') }.to raise_error(ActiveRecord::RecordInvalid)
    end
  end

  describe '.update' do
    let!(:agent) { create(:agent, name: 'old-name') }

    it 'updates the agent' do
      result = described_class.update(agent.id, name: 'new-name')
      expect(result.name).to eq('new-name')
    end
  end
end
