# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Dashboard', type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe 'GET /api/v1/dashboard' do
    before do
      agent = create(:agent, status: 'active')
      create(:task, status: 'in_progress', agent: agent)
      create(:approval, status: 'pending', agent: agent)
      create(:usage_record, agent: agent, input_tokens: 500, output_tokens: 300, cost_cents: 100,
                            recorded_at: 1.hour.ago)
    end

    it 'returns 200 with all KPI fields' do
      get api_v1_dashboard_path, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json).to include(
        'active_agents', 'tasks_in_progress', 'pending_approvals',
        'tokens_used_24h', 'cost_24h_cents',
        'recent_tasks', 'pending_approval_items'
      )
    end

    it 'returns correct counts' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      expect(json['active_agents']).to eq(1)
      expect(json['tasks_in_progress']).to eq(1)
      expect(json['pending_approvals']).to eq(1)
    end

    it 'returns recent_tasks as array' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      expect(json['recent_tasks']).to be_an(Array)
      expect(json['recent_tasks'].length).to eq(1)
    end

    it 'returns pending_approval_items as array' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      expect(json['pending_approval_items']).to be_an(Array)
      expect(json['pending_approval_items'].length).to eq(1)
    end

    it 'returns usage totals from last 24h' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      expect(json['tokens_used_24h']).to eq(800)
      expect(json['cost_24h_cents']).to eq(100)
    end
  end
end
