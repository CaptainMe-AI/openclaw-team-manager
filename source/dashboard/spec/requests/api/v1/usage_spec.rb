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
end
