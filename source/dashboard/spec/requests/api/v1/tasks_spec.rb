# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Tasks', type: :request do
  let(:user) { create(:user) }
  let(:agent) { create(:agent) }

  before { sign_in user }

  describe 'GET /api/v1/tasks' do
    before do
      create(:task, status: 'backlog', priority: 0, agent: agent)
      create(:task, status: 'in_progress', priority: 2, agent: nil)
    end

    it 'returns 200 with data and pagination' do
      get api_v1_tasks_path, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['data']).to be_an(Array)
      expect(json['data'].length).to eq(2)
      expect(json['pagination']).to be_present
    end

    it 'filters by status' do
      get api_v1_tasks_path, params: { status: 'backlog' }, as: :json
      json = response.parsed_body
      expect(json['data'].length).to eq(1)
      expect(json['data'].first['status']).to eq('backlog')
    end

    it 'filters by priority' do
      get api_v1_tasks_path, params: { priority: 0 }, as: :json
      json = response.parsed_body
      expect(json['data'].length).to eq(1)
      expect(json['data'].first['priority']).to eq(0)
    end
  end

  describe 'GET /api/v1/tasks/:id' do
    let!(:task) { create(:task, agent: agent) }

    it 'returns task JSON with agent_name field' do
      get api_v1_task_path(task), as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['id']).to eq(task.id)
      expect(json['agent_name']).to eq(agent.name)
    end
  end

  describe 'POST /api/v1/tasks' do
    it 'creates a task and returns 201' do
      post api_v1_tasks_path, params: {
        task: {
          task_id: 'TASK-TEST-001',
          title: 'Test task creation',
          description: 'A test task',
          status: 'backlog',
          priority: 2,
          agent_id: agent.id
        }
      }, as: :json
      expect(response).to have_http_status(:created)
      json = response.parsed_body
      expect(json['task_id']).to eq('TASK-TEST-001')
      expect(json['title']).to eq('Test task creation')
      expect(json['priority']).to eq(2)
      expect(json['agent_name']).to eq(agent.name)
    end

    it 'returns 422 for missing required fields' do
      post api_v1_tasks_path, params: { task: { title: '' } }, as: :json
      expect(response).to have_http_status(:unprocessable_entity)
    end
  end

  describe 'PATCH /api/v1/tasks/:id' do
    let!(:task) { create(:task, status: 'backlog', agent: agent) }

    it 'updates task status and returns 200' do
      patch api_v1_task_path(task), params: { task: { status: 'in_progress' } }, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['status']).to eq('in_progress')
    end
  end
end
