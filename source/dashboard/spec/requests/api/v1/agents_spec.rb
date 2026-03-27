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
        expect(json['data'].pluck('status').uniq).to eq(['active'])
      end

      it 'returns enriched fields (current_task, tokens_7d, tokens_7d_series)' do
        agent = Agent.first
        create(:task, agent: agent, status: 'in_progress', title: 'Deploy widget')
        create(:usage_record, agent: agent, input_tokens: 1000, output_tokens: 500, recorded_at: 1.day.ago)
        create(:usage_record, agent: agent, input_tokens: 2000, output_tokens: 800, recorded_at: 2.days.ago)

        get api_v1_agents_path, as: :json
        json = response.parsed_body
        enriched = json['data'].find { |a| a['id'] == agent.id }

        expect(enriched['current_task']).to eq('Deploy widget')
        expect(enriched['tokens_7d']).to be > 0
        expect(enriched['tokens_7d_series']).to be_an(Array)
        expect(enriched['tokens_7d_series'].length).to eq(7)
      end

      it 'returns null current_task when agent has no in_progress task' do
        agent = Agent.first
        create(:task, agent: agent, status: 'completed', title: 'Done task')

        get api_v1_agents_path, as: :json
        json = response.parsed_body
        enriched = json['data'].find { |a| a['id'] == agent.id }

        expect(enriched['current_task']).to be_nil
      end

      it 'filters by llm_model' do
        # Clear existing agents first and create with known models
        Agent.destroy_all
        create(:agent, llm_model: 'opus')
        create(:agent, llm_model: 'opus')
        create(:agent, llm_model: 'sonnet')

        get api_v1_agents_path, params: { llm_model: 'opus' }, as: :json
        json = response.parsed_body
        expect(json['data'].length).to eq(2)
        expect(json['data'].pluck('llm_model').uniq).to eq(['opus'])
      end

      it 'sorts by name ascending' do
        Agent.destroy_all
        create(:agent, name: 'Charlie-agent')
        create(:agent, name: 'Alpha-agent')
        create(:agent, name: 'Bravo-agent')

        get api_v1_agents_path, params: { sort: 'name', dir: 'asc' }, as: :json
        json = response.parsed_body
        names = json['data'].pluck('name')
        expect(names).to eq(%w[Alpha-agent Bravo-agent Charlie-agent])
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

    it 'returns enriched fields in show endpoint' do
      create(:task, agent: agent, status: 'in_progress', title: 'Analyze data')
      create(:usage_record, agent: agent, input_tokens: 3000, output_tokens: 1500, recorded_at: 1.day.ago)

      get api_v1_agent_path(agent), as: :json
      json = response.parsed_body

      expect(json['current_task']).to eq('Analyze data')
      expect(json['tokens_7d']).to eq(4500)
      expect(json['tokens_7d_series']).to be_an(Array)
      expect(json['tokens_7d_series'].length).to eq(7)
    end
  end
end
