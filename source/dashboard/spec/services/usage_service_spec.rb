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
                            latency_ms: 200, recorded_at: 1.hour.ago)
      create(:usage_record, agent: agent, input_tokens: 200, output_tokens: 100, api_calls: 10, cost_cents: 20,
                            latency_ms: 300, recorded_at: 2.hours.ago)
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

    it 'returns computed avg_latency_ms' do
      result = described_class.summary(from: 1.day.ago, to: Time.current)
      expect(result[:avg_latency_ms]).to eq(250)
    end

    it 'returns nil avg_latency_ms when no records have latency' do
      UsageRecord.update_all(latency_ms: nil) # rubocop:disable Rails/SkipsModelValidations
      result = described_class.summary(from: 1.day.ago, to: Time.current)
      expect(result[:avg_latency_ms]).to be_nil
    end
  end

  describe '.summary_with_trends' do
    let(:agent) { create(:agent) }

    before do
      # Previous period (24-48 hours ago)
      create(:usage_record, agent: agent, input_tokens: 100, output_tokens: 50, api_calls: 10, cost_cents: 20,
                            latency_ms: 200, recorded_at: 36.hours.ago)

      # Current period (0-24 hours ago)
      create(:usage_record, agent: agent, input_tokens: 200, output_tokens: 100, api_calls: 20, cost_cents: 40,
                            latency_ms: 300, recorded_at: 12.hours.ago)
    end

    it 'returns summary with all trend fields' do
      result = described_class.summary_with_trends(from: 24.hours.ago, to: Time.current)
      expect(result).to include(:total_tokens, :total_api_calls, :total_cost_cents, :avg_latency_ms)
      expect(result).to include(:token_trend, :api_calls_trend, :cost_trend, :latency_trend)
    end

    it 'calculates positive trends when current period is higher' do
      result = described_class.summary_with_trends(from: 24.hours.ago, to: Time.current)
      # Current: 300 tokens, Previous: 150 tokens => +100%
      expect(result[:token_trend]).to eq(100.0)
      # Current: 20 api_calls, Previous: 10 => +100%
      expect(result[:api_calls_trend]).to eq(100.0)
      # Current: 40 cost, Previous: 20 => +100%
      expect(result[:cost_trend]).to eq(100.0)
      # Current: 300ms latency, Previous: 200ms => +50%
      expect(result[:latency_trend]).to eq(50.0)
    end

    it 'returns nil trends when previous period has zero values' do
      # Remove previous period records
      UsageRecord.where(recorded_at: ...24.hours.ago).destroy_all
      result = described_class.summary_with_trends(from: 24.hours.ago, to: Time.current)
      expect(result[:token_trend]).to be_nil
    end
  end

  describe '.by_agent_over_time' do
    let(:alpha_agent) { create(:agent, name: 'agent-alpha') }
    let(:beta_agent) { create(:agent, name: 'agent-beta') }

    before do
      create(:usage_record, agent: alpha_agent, input_tokens: 100, output_tokens: 50, recorded_at: 6.hours.ago)
      create(:usage_record, agent: beta_agent, input_tokens: 200, output_tokens: 100, recorded_at: 6.hours.ago)
      create(:usage_record, agent: alpha_agent, input_tokens: 300, output_tokens: 150, recorded_at: 2.hours.ago)
    end

    it 'returns grouped data with correct shape' do
      result = described_class.by_agent_over_time(from: 24.hours.ago, to: Time.current)
      expect(result).to all(include(:bucket, :agent_name, :total_tokens))
    end

    it 'groups by agent and time bucket' do
      result = described_class.by_agent_over_time(from: 24.hours.ago, to: Time.current)
      expect(result.length).to be >= 2
    end

    it 'sums tokens correctly per bucket' do
      result = described_class.by_agent_over_time(from: 24.hours.ago, to: Time.current)
      alpha_entries = result.select { |r| r[:agent_name] == 'agent-alpha' }
      total_alpha_tokens = alpha_entries.sum { |r| r[:total_tokens] }
      expect(total_alpha_tokens).to eq(600) # (100+50) + (300+150)
    end

    it 'supports day granularity' do
      result = described_class.by_agent_over_time(from: 24.hours.ago, to: Time.current, granularity: 'day')
      expect(result).to all(include(:bucket, :agent_name, :total_tokens))
    end
  end

  describe '.cost_by_agent' do
    let(:expensive_agent) { create(:agent, name: 'expensive-agent') }
    let(:cheap_agent) { create(:agent, name: 'cheap-agent') }

    before do
      create(:usage_record, agent: expensive_agent, cost_cents: 500, recorded_at: 6.hours.ago)
      create(:usage_record, agent: expensive_agent, cost_cents: 300, recorded_at: 3.hours.ago)
      create(:usage_record, agent: cheap_agent, cost_cents: 100, recorded_at: 6.hours.ago)
    end

    it 'returns cost breakdown by agent sorted descending' do
      result = described_class.cost_by_agent(from: 24.hours.ago, to: Time.current)
      expect(result.first[:agent_name]).to eq('expensive-agent')
      expect(result.first[:cost_cents]).to eq(800)
      expect(result.last[:agent_name]).to eq('cheap-agent')
      expect(result.last[:cost_cents]).to eq(100)
    end

    it 'returns correct shape' do
      result = described_class.cost_by_agent(from: 24.hours.ago, to: Time.current)
      expect(result).to all(include(:agent_name, :cost_cents))
    end
  end

  describe '.calls_by_endpoint' do
    before do
      agent = create(:agent)
      create(:usage_record, agent: agent, api_calls: 50, endpoint: '/v1/chat/completions', recorded_at: 6.hours.ago)
      create(:usage_record, agent: agent, api_calls: 30, endpoint: '/v1/chat/completions', recorded_at: 3.hours.ago)
      create(:usage_record, agent: agent, api_calls: 20, endpoint: '/v1/embeddings', recorded_at: 6.hours.ago)
      create(:usage_record, agent: agent, api_calls: 10, endpoint: nil, recorded_at: 6.hours.ago)
    end

    it 'returns calls grouped by endpoint sorted descending' do
      result = described_class.calls_by_endpoint(from: 24.hours.ago, to: Time.current)
      expect(result.first[:endpoint]).to eq('/v1/chat/completions')
      expect(result.first[:total_calls]).to eq(80)
      expect(result.last[:endpoint]).to eq('/v1/embeddings')
      expect(result.last[:total_calls]).to eq(20)
    end

    it 'excludes records with nil endpoint' do
      result = described_class.calls_by_endpoint(from: 24.hours.ago, to: Time.current)
      endpoints = result.pluck(:endpoint)
      expect(endpoints).not_to include(nil)
    end

    it 'returns correct shape' do
      result = described_class.calls_by_endpoint(from: 24.hours.ago, to: Time.current)
      expect(result).to all(include(:endpoint, :total_calls))
    end
  end

  describe '.latency_distribution' do
    before do
      agent = create(:agent)
      create(:usage_record, agent: agent, latency_ms: 50, recorded_at: 6.hours.ago)
      create(:usage_record, agent: agent, latency_ms: 150, recorded_at: 5.hours.ago)
      create(:usage_record, agent: agent, latency_ms: 250, recorded_at: 4.hours.ago)
      create(:usage_record, agent: agent, latency_ms: 350, recorded_at: 3.hours.ago)
      create(:usage_record, agent: agent, latency_ms: 1500, recorded_at: 2.hours.ago)
      create(:usage_record, agent: agent, latency_ms: nil, recorded_at: 1.hour.ago)
    end

    it 'returns distribution buckets with correct counts' do
      result = described_class.latency_distribution(from: 24.hours.ago, to: Time.current)
      low_bucket = result.find { |b| b[:range] == '0-100ms' }
      mid_low_bucket = result.find { |b| b[:range] == '100-200ms' }
      mid_bucket = result.find { |b| b[:range] == '200-300ms' }
      mid_high_bucket = result.find { |b| b[:range] == '300-400ms' }
      overflow_bucket = result.find { |b| b[:range] == '1000ms+' }

      expect(low_bucket[:count]).to eq(1)
      expect(mid_low_bucket[:count]).to eq(1)
      expect(mid_bucket[:count]).to eq(1)
      expect(mid_high_bucket[:count]).to eq(1)
      expect(overflow_bucket[:count]).to eq(1)
    end

    it 'returns all 8 buckets' do
      result = described_class.latency_distribution(from: 24.hours.ago, to: Time.current)
      expect(result.length).to eq(8)
    end

    it 'excludes records with nil latency' do
      result = described_class.latency_distribution(from: 24.hours.ago, to: Time.current)
      total_counted = result.sum { |b| b[:count] }
      expect(total_counted).to eq(5) # 6 records minus 1 nil
    end

    it 'returns correct shape' do
      result = described_class.latency_distribution(from: 24.hours.ago, to: Time.current)
      expect(result).to all(include(:range, :count))
    end
  end
end
