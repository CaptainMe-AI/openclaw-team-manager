# frozen_string_literal: true

require 'rails_helper'

RSpec.describe UsageService do
  describe '.list' do
    let(:primary_agent) { create(:agent) }
    let(:secondary_agent) { create(:agent) }
    let!(:oldest_record) { create(:usage_record, agent: primary_agent, recorded_at: 2.days.ago) }
    let!(:middle_record) { create(:usage_record, agent: secondary_agent, recorded_at: 1.day.ago) }
    let!(:newest_record) { create(:usage_record, agent: primary_agent, recorded_at: Time.current) }

    it 'returns all usage records ordered by recorded_at asc' do
      result = described_class.list
      expect(result).to eq([oldest_record, middle_record, newest_record])
    end

    it 'filters by agent_id' do
      result = described_class.list(filters: { agent_id: primary_agent.id })
      expect(result).to include(oldest_record, newest_record)
      expect(result).not_to include(middle_record)
    end

    it 'filters by date range (from)' do
      result = described_class.list(filters: { from: 1.day.ago.beginning_of_day.iso8601 })
      expect(result).to include(middle_record, newest_record)
      expect(result).not_to include(oldest_record)
    end

    it 'filters by date range (from and to)' do
      result = described_class.list(filters: {
                                      from: 3.days.ago.iso8601,
                                      to: 1.day.ago.end_of_day.iso8601
                                    })
      expect(result).to include(oldest_record, middle_record)
      expect(result).not_to include(newest_record)
    end
  end

  describe '.summary' do
    let(:agent) { create(:agent) }

    before do
      create(:usage_record, agent: agent, input_tokens: 100, output_tokens: 50, api_calls: 5, cost_cents: 10,
                            recorded_at: 1.hour.ago)
      create(:usage_record, agent: agent, input_tokens: 200, output_tokens: 100, api_calls: 10, cost_cents: 20,
                            recorded_at: 2.hours.ago)
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
