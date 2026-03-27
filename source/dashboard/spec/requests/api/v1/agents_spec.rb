# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Agents', type: :request do
  let(:user) { create(:user) }

  describe 'GET /api/v1/agents' do
    before do
      create_list(:agent, 3, status: 'active')
      create(:agent, status: 'idle')
    end

    context 'when authenticated' do
      before { sign_in user }

      it 'returns 200 with data array and pagination' do
        get api_v1_agents_path, as: :json
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['data']).to be_an(Array)
        expect(json['data'].length).to eq(4)
        expect(json['pagination']).to include('current_page', 'per_page', 'total_pages', 'total_count')
      end

      it 'returns agents with correct fields' do
        get api_v1_agents_path, as: :json
        json = response.parsed_body
        agent_json = json['data'].first
        expect(agent_json).to include('id', 'name', 'agent_id', 'status', 'llm_model', 'workspace',
                                      'uptime_since', 'created_at', 'updated_at')
      end

      it 'filters by status' do
        get api_v1_agents_path, params: { status: 'active' }, as: :json
        json = response.parsed_body
        expect(json['data'].length).to eq(3)
        expect(json['data'].map { |a| a['status'] }.uniq).to eq(['active'])
      end
    end

    context 'when not authenticated' do
      it 'returns 302 redirect to login' do
        get api_v1_agents_path, as: :json
        expect(response).to have_http_status(:found).or have_http_status(:unauthorized)
      end
    end
  end

  describe 'GET /api/v1/agents/:id' do
    let!(:agent) { create(:agent) }

    before { sign_in user }

    it 'returns 200 with agent JSON' do
      get api_v1_agent_path(agent), as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['id']).to eq(agent.id)
      expect(json['name']).to eq(agent.name)
    end

    it 'returns 404 for invalid id' do
      get api_v1_agent_path(id: SecureRandom.uuid), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end
end
