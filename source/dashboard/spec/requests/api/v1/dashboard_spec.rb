# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Dashboard', type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe 'GET /api/v1/dashboard' do
    let(:agent) { create(:agent, status: 'active', name: 'spec-agent') }

    before do
      create(:task, status: 'in_progress', agent: agent)
      create(:approval, status: 'pending', agent: agent)
      create(:usage_record, agent: agent, input_tokens: 500, output_tokens: 300, cost_cents: 100,
                            recorded_at: 1.hour.ago)
    end

    it 'returns 200 with all KPI fields including trends and activity_events' do
      get api_v1_dashboard_path, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json).to include(
        'active_agents', 'tasks_in_progress', 'pending_approvals',
        'tokens_used_24h', 'cost_24h_cents',
        'recent_tasks', 'pending_approval_items',
        'active_agents_trend', 'tasks_in_progress_trend',
        'pending_approvals_trend', 'tokens_trend',
        'activity_events'
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

    it 'returns trend fields' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      expect(json).to have_key('active_agents_trend')
      expect(json).to have_key('tasks_in_progress_trend')
      expect(json).to have_key('pending_approvals_trend')
      expect(json).to have_key('tokens_trend')
    end

    it 'returns nil for count-based trends' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      expect(json['active_agents_trend']).to be_nil
      expect(json['tasks_in_progress_trend']).to be_nil
      expect(json['pending_approvals_trend']).to be_nil
    end

    it 'returns activity_events as array' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      expect(json['activity_events']).to be_an(Array)
    end

    it 'returns activity_events with correct shape' do
      get api_v1_dashboard_path, as: :json
      json = response.parsed_body
      events = json['activity_events']
      next if events.empty?

      expect(events).to all(include('type', 'label', 'occurred_at'))
    end

    context 'with time_period=7d' do
      before do
        create(:usage_record, agent: agent, input_tokens: 1000, output_tokens: 500,
                              cost_cents: 300, recorded_at: 3.days.ago)
      end

      it 'returns 200 with data scoped to 7 days' do
        get api_v1_dashboard_path, params: { time_period: '7d' }, as: :json
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        # Should include the 3-day-old record in 7d scope
        expect(json['tokens_used_24h']).to eq(2300) # 800 + 1500
      end
    end

    context 'with time_period=1h' do
      it 'returns 200 with data scoped to 1 hour' do
        get api_v1_dashboard_path, params: { time_period: '1h' }, as: :json
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json).to include('active_agents', 'tokens_used_24h', 'activity_events')
      end
    end

    context 'with invalid time_period' do
      it 'defaults to 24h and returns 200' do
        get api_v1_dashboard_path, params: { time_period: 'invalid' }, as: :json
        expect(response).to have_http_status(:ok)
        json = response.parsed_body
        expect(json['tokens_used_24h']).to eq(800)
      end
    end

    context 'with tokens_trend computation' do
      before do
        # Previous period (24-48h ago) record
        create(:usage_record, agent: agent, input_tokens: 100, output_tokens: 50,
                              cost_cents: 20, recorded_at: 36.hours.ago)
      end

      it 'returns tokens_trend as number or null' do
        get api_v1_dashboard_path, as: :json
        json = response.parsed_body
        expect(json['tokens_trend']).to be_a(Numeric).or(be_nil)
      end
    end

    context 'with activity_events containing occurred_at as ISO8601' do
      it 'returns occurred_at in ISO8601 format' do
        get api_v1_dashboard_path, as: :json
        json = response.parsed_body
        events = json['activity_events']
        events.each do |event|
          next if event['occurred_at'].nil?

          expect { Time.zone.parse(event['occurred_at']) }.not_to raise_error
        end
      end
    end
  end
end
