# frozen_string_literal: true

# == Schema Information
#
# Table name: approvals
#
#  id             :uuid             not null, primary key
#  approval_type  :string           not null
#  context        :jsonb
#  description    :text
#  requested_at   :datetime         not null
#  resolved_at    :datetime
#  risk_level     :string           default("medium"), not null
#  status         :string           default("pending"), not null
#  title          :string           not null
#  created_at     :datetime         not null
#  updated_at     :datetime         not null
#  agent_id       :uuid
#  resolved_by_id :uuid
#
# Indexes
#
#  index_approvals_on_agent_id        (agent_id)
#  index_approvals_on_approval_type   (approval_type)
#  index_approvals_on_resolved_by_id  (resolved_by_id)
#  index_approvals_on_risk_level      (risk_level)
#  index_approvals_on_status          (status)
#
# Foreign Keys
#
#  fk_rails_...  (agent_id => agents.id)
#  fk_rails_...  (resolved_by_id => users.id)
#
require 'rails_helper'

RSpec.describe Approval, type: :model do
  subject(:approval) { build(:approval) }

  describe 'factory' do
    it 'is valid with default attributes' do
      expect(approval).to be_valid
    end
  end

  describe 'validations' do
    it 'requires title' do
      approval.title = ''
      expect(approval).not_to be_valid
      expect(approval.errors[:title]).to include("can't be blank")
    end

    it 'requires approval_type' do
      approval.approval_type = nil
      expect(approval).not_to be_valid
    end

    it 'requires status' do
      approval.status = nil
      expect(approval).not_to be_valid
    end

    it 'requires risk_level' do
      approval.risk_level = nil
      expect(approval).not_to be_valid
    end

    it 'requires requested_at' do
      approval.requested_at = nil
      expect(approval).not_to be_valid
      expect(approval.errors[:requested_at]).to include("can't be blank")
    end
  end

  describe 'enums' do
    it 'defines approval_type enum' do
      expect(described_class.approval_types).to include(
        'dangerous_command' => 'dangerous_command',
        'sensitive_data' => 'sensitive_data',
        'budget_override' => 'budget_override'
      )
    end

    it 'defines status enum' do
      expect(described_class.statuses).to include(
        'pending' => 'pending',
        'approved' => 'approved',
        'denied' => 'denied'
      )
    end

    it 'defines risk_level enum' do
      expect(described_class.risk_levels).to include(
        'low' => 'low',
        'medium' => 'medium',
        'high' => 'high',
        'critical' => 'critical'
      )
    end
  end

  describe 'scopes' do
    before do
      agent = create(:agent)
      create(:approval, agent: agent, status: 'pending')
      create(:approval, agent: agent, status: 'approved')
      create(:approval, agent: agent, status: 'denied')
    end

    it 'returns pending approvals' do
      expect(described_class.pending.count).to eq(1)
    end

    it 'returns approved approvals' do
      expect(described_class.approved.count).to eq(1)
    end

    it 'returns denied approvals' do
      expect(described_class.denied.count).to eq(1)
    end
  end

  describe 'approval_type scopes' do
    before do
      agent = create(:agent)
      create(:approval, agent: agent, approval_type: 'dangerous_command')
      create(:approval, agent: agent, approval_type: 'sensitive_data')
      create(:approval, agent: agent, approval_type: 'budget_override')
    end

    it 'returns dangerous_command approvals' do
      expect(described_class.dangerous_command.count).to eq(1)
    end

    it 'returns sensitive_data approvals' do
      expect(described_class.sensitive_data.count).to eq(1)
    end

    it 'returns budget_override approvals' do
      expect(described_class.budget_override.count).to eq(1)
    end
  end

  describe 'risk_level scopes' do
    before do
      agent = create(:agent)
      create(:approval, agent: agent, risk_level: 'low')
      create(:approval, agent: agent, risk_level: 'medium')
      create(:approval, agent: agent, risk_level: 'high')
      create(:approval, agent: agent, risk_level: 'critical')
    end

    it 'returns low risk approvals' do
      expect(described_class.low.count).to eq(1)
    end

    it 'returns medium risk approvals' do
      expect(described_class.medium.count).to eq(1)
    end

    it 'returns high risk approvals' do
      expect(described_class.high.count).to eq(1)
    end

    it 'returns critical risk approvals' do
      expect(described_class.critical.count).to eq(1)
    end
  end

  describe 'associations' do
    it 'belongs to agent (optional)' do
      assoc = described_class.reflect_on_association(:agent)
      expect(assoc.macro).to eq(:belongs_to)
      expect(assoc.options[:optional]).to be true
    end

    it 'belongs to resolved_by (optional, User class)' do
      assoc = described_class.reflect_on_association(:resolved_by)
      expect(assoc.macro).to eq(:belongs_to)
      expect(assoc.options[:optional]).to be true
      expect(assoc.options[:class_name]).to eq('User')
    end
  end
end
