# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsageService do
  describe '.list' do
    let(:agent1) { create(:agent) }
    let(:agent2) { create(:agent) }
    let!(:record1) { create(:usage_record, agent: agent1, recorded_at: 2.days.ago) }
    let!(:record2) { create(:usage_record, agent: agent2, recorded_at: 1.day.ago) }
    let!(:record3) { create(:usage_record, agent: agent1, recorded_at: Time.current) }

    it 'returns all usage records ordered by recorded_at asc' do
      result = described_class.list
      expect(result).to eq([record1, record2, record3])
    end

    it 'filters by agent_id' do
      result = described_class.list(filters: { agent_id: agent1.id })
      expect(result).to include(record1, record3)
      expect(result).not_to include(record2)
    end

    it 'filters by date range (from)' do
      result = described_class.list(filters: { from: 1.day.ago.beginning_of_day.iso8601 })
      expect(result).to include(record2, record3)
      expect(result).not_to include(record1)
    end

    it 'filters by date range (from and to)' do
      result = described_class.list(filters: {
        from: 3.days.ago.iso8601,
        to: 1.day.ago.end_of_day.iso8601
      })
      expect(result).to include(record1, record2)
      expect(result).not_to include(record3)
    end
  end

  describe '.summary' do
    let(:agent) { create(:agent) }

    before do
      create(:usage_record, agent: agent, input_tokens: 100, output_tokens: 50, api_calls: 5, cost_cents: 10, recorded_at: 1.hour.ago)
      create(:usage_record, agent: agent, input_tokens: 200, output_tokens: 100, api_calls: 10, cost_cents: 20, recorded_at: 2.hours.ago)
    end

    it 'returns correct total_tokens' do
      result = described_class.summary(from: 1.day.ago, to: Time.current)
      expect(result[:total_tokens]).to eq(450)
    end

    it 'returns correct total_api_calls' do
      result = described_class.summary(from: 1.day.ago, to: Time.current)
      expect(result[:total_api_calls]).to eq(15)
    end

    it 'returns correct total_cost_cents' do
      result = described_class.summary(from: 1.day.ago, to: Time.current)
      expect(result[:total_cost_cents]).to eq(30)
    end

    it 'returns nil for avg_latency_ms' do
      result = described_class.summary(from: 1.day.ago, to: Time.current)
      expect(result[:avg_latency_ms]).to be_nil
    end

    it 'returns records in the range' do
      result = described_class.summary(from: 1.day.ago, to: Time.current)
      expect(result[:records].count).to eq(2)
    end
  end
end
