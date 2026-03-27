# frozen_string_literal: true

require 'rails_helper'

RSpec.describe TaskService do
  describe '.list' do
    let(:agent) { create(:agent) }
    let!(:backlog_task) { create(:task, status: 'backlog', priority: 0, agent: agent) }
    let!(:in_progress_task) { create(:task, status: 'in_progress', priority: 2, agent: nil) }

    it 'returns all tasks' do
      result = described_class.list
      expect(result).to include(backlog_task, in_progress_task)
    end

    it 'filters by status' do
      result = described_class.list(filters: { status: 'backlog' })
      expect(result).to include(backlog_task)
      expect(result).not_to include(in_progress_task)
    end

    it 'filters by priority' do
      result = described_class.list(filters: { priority: 0 })
      expect(result).to include(backlog_task)
      expect(result).not_to include(in_progress_task)
    end

    it 'filters by agent_id' do
      result = described_class.list(filters: { agent_id: agent.id })
      expect(result).to include(backlog_task)
      expect(result).not_to include(in_progress_task)
    end

    it 'sorts by priority ascending' do
      result = described_class.list(sort: 'priority', dir: 'asc')
      priorities = result.map(&:priority)
      expect(priorities).to eq(priorities.sort)
    end
  end

  describe '.find' do
    let!(:task) { create(:task) }

    it 'returns the task by id' do
      expect(described_class.find(task.id)).to eq(task)
    end

    it 'raises RecordNotFound for invalid id' do
      expect { described_class.find(SecureRandom.uuid) }.to raise_error(ActiveRecord::RecordNotFound)
    end
  end

  describe '.create' do
    it 'creates a new task' do
      params = { task_id: 'TASK-TEST01', title: 'Test task', priority: 1 }
      task = described_class.create(params)
      expect(task).to be_persisted
      expect(task.title).to eq('Test task')
    end
  end

  describe '.update' do
    let!(:task) { create(:task, title: 'Old title') }

    it 'updates the task' do
      result = described_class.update(task.id, title: 'New title')
      expect(result.title).to eq('New title')
    end
  end
end
