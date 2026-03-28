# frozen_string_literal: true

require 'rails_helper'

RSpec.describe DashboardService do
  describe '.summary' do
    let(:agent) { create(:agent, status: 'active', name: 'test-agent') }

    context 'with default time range (no params)' do
      before do
        create(:task, status: 'in_progress', agent: agent)
        create(:approval, status: 'pending', agent: agent)
        create(:usage_record, agent: agent, input_tokens: 500, output_tokens: 300,
                              cost_cents: 100, recorded_at: 1.hour.ago)
      end

      it 'returns existing KPI fields' do
        result = described_class.summary
        expect(result).to include(:active_agents, :tasks_in_progress, :pending_approvals,
                                  :tokens_used_24h, :cost_24h_cents)
      end

      it 'returns correct counts' do
        result = described_class.summary
        expect(result[:active_agents]).to eq(1)
        expect(result[:tasks_in_progress]).to eq(1)
        expect(result[:pending_approvals]).to eq(1)
      end

      it 'returns tokens and cost for default 24h range' do
        result = described_class.summary
        expect(result[:tokens_used_24h]).to eq(800)
        expect(result[:cost_24h_cents]).to eq(100)
      end

      it 'returns trend fields' do
        result = described_class.summary
        expect(result).to include(:active_agents_trend, :tasks_in_progress_trend,
                                  :pending_approvals_trend, :tokens_trend)
      end

      it 'returns nil for count-based trends (point-in-time snapshots)' do
        result = described_class.summary
        expect(result[:active_agents_trend]).to be_nil
        expect(result[:tasks_in_progress_trend]).to be_nil
        expect(result[:pending_approvals_trend]).to be_nil
      end

      it 'returns recent_tasks as array' do
        result = described_class.summary
        expect(result[:recent_tasks]).to be_an(ActiveRecord::Relation)
      end

      it 'returns pending_approval_items' do
        result = described_class.summary
        expect(result[:pending_approval_items]).to be_an(ActiveRecord::Relation)
      end

      it 'returns activity_events as array' do
        result = described_class.summary
        expect(result[:activity_events]).to be_an(Array)
      end
    end

    context 'with custom time range' do
      let(:from) { 7.days.ago }
      let(:to) { Time.current }

      before do
        create(:usage_record, agent: agent, input_tokens: 1000, output_tokens: 500,
                              cost_cents: 200, recorded_at: 3.days.ago)
        create(:usage_record, agent: agent, input_tokens: 100, output_tokens: 50,
                              cost_cents: 20, recorded_at: 10.days.ago)
      end

      it 'scopes tokens to from..to range' do
        result = described_class.summary(from: from, to: to)
        expect(result[:tokens_used_24h]).to eq(1500)
      end

      it 'scopes cost to from..to range' do
        result = described_class.summary(from: from, to: to)
        expect(result[:cost_24h_cents]).to eq(200)
      end

      it 'keeps count KPIs as real-time snapshots regardless of from/to' do
        result = described_class.summary(from: from, to: to)
        expect(result[:active_agents]).to eq(1)
      end
    end

    context 'with trend computation' do
      let(:agent) { create(:agent, status: 'active') }

      before do
        # Current period (last 24 hours): 300 total tokens
        create(:usage_record, agent: agent, input_tokens: 200, output_tokens: 100,
                              cost_cents: 40, recorded_at: 12.hours.ago)

        # Previous period (24-48 hours ago): 150 total tokens
        create(:usage_record, agent: agent, input_tokens: 100, output_tokens: 50,
                              cost_cents: 20, recorded_at: 36.hours.ago)
      end

      it 'calculates tokens_trend as percent change vs previous period' do
        result = described_class.summary(from: 24.hours.ago, to: Time.current)
        # Current: 300 tokens, Previous: 150 tokens => +100.0%
        expect(result[:tokens_trend]).to eq(100.0)
      end

      it 'returns nil tokens_trend when previous period has zero tokens' do
        UsageRecord.where(recorded_at: ...24.hours.ago).destroy_all
        result = described_class.summary(from: 24.hours.ago, to: Time.current)
        expect(result[:tokens_trend]).to be_nil
      end
    end

    context 'with recent_tasks time scoping' do
      before do
        create(:task, agent: agent, title: 'Recent task', created_at: 2.days.ago)
        create(:task, agent: agent, title: 'Old task', created_at: 10.days.ago)
      end

      it 'scopes recent_tasks to from..to and limits to 5' do
        result = described_class.summary(from: 7.days.ago, to: Time.current)
        titles = result[:recent_tasks].map(&:title)
        expect(titles).to include('Recent task')
        expect(titles).not_to include('Old task')
      end

      it 'orders recent_tasks by created_at desc' do
        create(:task, agent: agent, title: 'Newest task', created_at: 1.day.ago)
        result = described_class.summary(from: 7.days.ago, to: Time.current)
        expect(result[:recent_tasks].first.title).to eq('Newest task')
      end

      it 'limits recent_tasks to 5' do
        6.times { |i| create(:task, agent: agent, title: "Task #{i}", created_at: (i + 1).hours.ago) }
        result = described_class.summary(from: 7.days.ago, to: Time.current)
        expect(result[:recent_tasks].length).to eq(5)
      end
    end

    context 'with pending_approval_items' do
      before do
        create(:approval, status: 'pending', agent: agent, requested_at: 1.hour.ago)
        create(:approval, status: 'approved', agent: agent, requested_at: 2.hours.ago, resolved_at: 1.hour.ago)
      end

      it 'returns only current pending approvals (not time-scoped)' do
        result = described_class.summary(from: 7.days.ago, to: Time.current)
        expect(result[:pending_approval_items].length).to eq(1)
        expect(result[:pending_approval_items].first.status).to eq('pending')
      end
    end

    context 'with activity_events' do
      let(:second_agent) { create(:agent, status: 'idle', name: 'idle-agent') }

      before do
        # Agent event: updated_at within range
        agent.update!(updated_at: 6.hours.ago)
        second_agent.update!(updated_at: 3.hours.ago)

        # Task event: updated_at within range
        create(:task, agent: agent, title: 'Build feature', status: 'in_progress', updated_at: 5.hours.ago)

        # Approval event: requested_at within range
        create(:approval, agent: agent, title: 'Deploy approval', status: 'pending',
                          requested_at: 4.hours.ago)

        # Resolved approval: resolved_at within range
        create(:approval, agent: second_agent, title: 'Budget override', status: 'approved',
                          requested_at: 2.days.ago, resolved_at: 2.hours.ago)
      end

      it 'returns activity_events with correct keys' do
        result = described_class.summary(from: 12.hours.ago, to: Time.current)
        events = result[:activity_events]
        expect(events).to all(include(:type, :label, :agent_name, :occurred_at))
      end

      it 'includes agent events' do
        result = described_class.summary(from: 12.hours.ago, to: Time.current)
        events = result[:activity_events]
        agent_events = events.select { |e| e[:agent_name] == 'test-agent' && e[:type] == 'active' }
        expect(agent_events).not_to be_empty
      end

      it 'includes task events' do
        result = described_class.summary(from: 12.hours.ago, to: Time.current)
        events = result[:activity_events]
        task_events = events.select { |e| e[:type] == 'task' }
        expect(task_events).not_to be_empty
      end

      it 'includes approval events' do
        result = described_class.summary(from: 12.hours.ago, to: Time.current)
        events = result[:activity_events]
        approval_events = events.select { |e| %w[pending approved denied].include?(e[:type]) }
        expect(approval_events).not_to be_empty
      end

      it 'sorts events by occurred_at ascending' do
        result = described_class.summary(from: 12.hours.ago, to: Time.current)
        events = result[:activity_events]
        timestamps = events.map { |e| e[:occurred_at] }
        expect(timestamps).to eq(timestamps.sort)
      end

      it 'limits events to 20' do
        # Create more than 20 events total
        15.times do |i|
          create(:task, agent: agent, title: "Extra task #{i}", status: 'backlog',
                        updated_at: (i + 1).minutes.ago)
        end
        result = described_class.summary(from: 12.hours.ago, to: Time.current)
        expect(result[:activity_events].length).to be <= 20
      end

      it 'only includes events within from..to range' do
        result = described_class.summary(from: 12.hours.ago, to: Time.current)
        events = result[:activity_events]
        events.each do |event|
          expect(event[:occurred_at]).to be >= 12.hours.ago
          expect(event[:occurred_at]).to be <= Time.current
        end
      end
    end
  end
end
