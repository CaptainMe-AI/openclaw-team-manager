# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Usage', type: :request do
  let(:user) { create(:user) }
  let(:agent) { create(:agent) }

  before { sign_in user }

  describe 'GET /api/v1/usage' do
    before do
      create(:usage_record, agent: agent, recorded_at: 2.days.ago)
      create(:usage_record, agent: agent, recorded_at: 1.day.ago)
      create(:usage_record, agent: create(:agent), recorded_at: Time.current)
    end

    it 'returns 200 with data array (no pagination)' do
      get api_v1_usage_index_path, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['data']).to be_an(Array)
      expect(json['data'].length).to eq(3)
      expect(json).not_to have_key('pagination')
    end

    it 'filters by agent_id' do
      get api_v1_usage_index_path, params: { agent_id: agent.id }, as: :json
      json = response.parsed_body
      expect(json['data'].length).to eq(2)
    end

    it 'filters by date range' do
      get api_v1_usage_index_path, params: {
        from: 36.hours.ago.iso8601,
        to: 1.hour.from_now.iso8601
      }, as: :json
      json = response.parsed_body
      expect(json['data'].length).to eq(2)
    end

    it 'returns records with correct fields' do
      get api_v1_usage_index_path, as: :json
      json = response.parsed_body
      record = json['data'].first
      expect(record).to include('id', 'agent_id', 'agent_name', 'input_tokens', 'output_tokens',
                                'api_calls', 'cost_cents', 'llm_model', 'recorded_at')
    end
  end

  describe 'GET /api/v1/usage/summary' do
    before do
      create(:usage_record, agent: agent, recorded_at: 12.hours.ago, latency_ms: 200)
      create(:usage_record, agent: agent, recorded_at: 36.hours.ago, latency_ms: 300)
    end

    it 'returns 200 with summary data including trends' do
      get summary_api_v1_usage_index_path, params: {
        from: 24.hours.ago.iso8601,
        to: Time.current.iso8601
      }, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json).to include('total_tokens', 'total_api_calls', 'total_cost_cents', 'avg_latency_ms')
      expect(json).to include('token_trend', 'api_calls_trend', 'cost_trend', 'latency_trend')
    end

    it 'defaults to 24h range when no params provided' do
      get summary_api_v1_usage_index_path, as: :json
      expect(response).to have_http_status(:ok)
    end
  end

  describe 'GET /api/v1/usage/charts' do
    before do
      create(:usage_record, agent: agent, recorded_at: 6.hours.ago, latency_ms: 150,
                            endpoint: '/v1/chat/completions')
      create(:usage_record, agent: agent, recorded_at: 3.hours.ago, latency_ms: 250,
                            endpoint: '/v1/embeddings')
    end

    it 'returns 200 with all 4 chart dataset keys' do
      get charts_api_v1_usage_index_path, params: {
        from: 24.hours.ago.iso8601,
        to: Time.current.iso8601,
        granularity: 'hour'
      }, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json).to include('token_usage_over_time', 'cost_by_agent', 'calls_by_endpoint', 'latency_distribution')
    end

    it 'returns chart datasets as arrays' do
      get charts_api_v1_usage_index_path, params: {
        from: 24.hours.ago.iso8601,
        to: Time.current.iso8601,
        granularity: 'hour'
      }, as: :json
      json = response.parsed_body
      expect(json['token_usage_over_time']).to be_an(Array)
      expect(json['cost_by_agent']).to be_an(Array)
      expect(json['calls_by_endpoint']).to be_an(Array)
      expect(json['latency_distribution']).to be_an(Array)
    end

    it 'returns chart data filtered by time range' do
      get charts_api_v1_usage_index_path, params: {
        from: 4.hours.ago.iso8601,
        to: Time.current.iso8601
      }, as: :json
      json = response.parsed_body
      # Only the 3.hours.ago record falls in the 4h window
      expect(json['token_usage_over_time'].length).to eq(1)
    end
  end
end
