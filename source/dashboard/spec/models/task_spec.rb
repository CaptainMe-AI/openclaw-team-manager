# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Task, type: :model do
  subject(:task) { build(:task) }

  describe 'factory' do
    it 'is valid with default attributes' do
      expect(task).to be_valid
    end
  end

  describe 'validations' do
    it 'requires task_id' do
      task.task_id = ''
      expect(task).not_to be_valid
      expect(task.errors[:task_id]).to include("can't be blank")
    end

    it 'requires task_id to be unique' do
      create(:task, task_id: 'TASK-DUPLICATE')
      duplicate = build(:task, task_id: 'TASK-DUPLICATE')
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:task_id]).to include('has already been taken')
    end

    it 'requires title' do
      task.title = ''
      expect(task).not_to be_valid
      expect(task.errors[:title]).to include("can't be blank")
    end

    it 'requires status' do
      task.status = nil
      expect(task).not_to be_valid
    end

    it 'requires priority' do
      task.priority = nil
      expect(task).not_to be_valid
    end

    it 'rejects priority of 4 (out of range)' do
      task.priority = 4
      expect(task).not_to be_valid
      expect(task.errors[:priority]).to be_present
    end

    it 'rejects priority of -1 (out of range)' do
      task.priority = -1
      expect(task).not_to be_valid
      expect(task.errors[:priority]).to be_present
    end
  end

  describe 'enums' do
    it 'defines status enum with all 6 Kanban columns' do
      expect(described_class.statuses).to include(
        "backlog" => "backlog",
        "queued" => "queued",
        "in_progress" => "in_progress",
        "awaiting_approval" => "awaiting_approval",
        "completed" => "completed",
        "failed" => "failed"
      )
    end
  end

  describe 'scopes' do
    before do
      agent = create(:agent)
      create(:task, agent: agent, status: 'backlog')
      create(:task, agent: agent, status: 'queued')
      create(:task, agent: agent, status: 'in_progress')
      create(:task, agent: agent, status: 'awaiting_approval')
      create(:task, agent: agent, status: 'completed')
      create(:task, agent: agent, status: 'failed')
    end

    it 'returns backlog tasks' do
      expect(described_class.backlog.count).to eq(1)
    end

    it 'returns queued tasks' do
      expect(described_class.queued.count).to eq(1)
    end

    it 'returns in_progress tasks' do
      expect(described_class.in_progress.count).to eq(1)
    end

    it 'returns awaiting_approval tasks' do
      expect(described_class.awaiting_approval.count).to eq(1)
    end

    it 'returns completed tasks' do
      expect(described_class.completed.count).to eq(1)
    end

    it 'returns failed tasks' do
      expect(described_class.failed.count).to eq(1)
    end
  end

  describe 'associations' do
    it 'belongs to agent (optional)' do
      assoc = described_class.reflect_on_association(:agent)
      expect(assoc.macro).to eq(:belongs_to)
      expect(assoc.options[:optional]).to be true
    end
  end
end
