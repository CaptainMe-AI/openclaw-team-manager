# frozen_string_literal: true

require 'rails_helper'

RSpec.describe ApprovalService do
  describe '.list' do
    let!(:pending_approval) do
      create(:approval, status: 'pending', risk_level: 'high', approval_type: 'dangerous_command')
    end
    let!(:approved_approval) do
      create(:approval, status: 'approved', risk_level: 'low', approval_type: 'sensitive_data')
    end

    it 'returns all approvals' do
      result = described_class.list
      expect(result).to include(pending_approval, approved_approval)
    end

    it 'filters by status' do
      result = described_class.list(filters: { status: 'pending' })
      expect(result).to include(pending_approval)
      expect(result).not_to include(approved_approval)
    end

    it 'filters by risk_level' do
      result = described_class.list(filters: { risk_level: 'high' })
      expect(result).to include(pending_approval)
      expect(result).not_to include(approved_approval)
    end

    it 'filters by approval_type' do
      result = described_class.list(filters: { approval_type: 'dangerous_command' })
      expect(result).to include(pending_approval)
      expect(result).not_to include(approved_approval)
    end

    it 'filters by agent_id' do
      result = described_class.list(filters: { agent_id: pending_approval.agent_id })
      expect(result).to include(pending_approval)
      expect(result).not_to include(approved_approval)
    end
  end

  describe '.find' do
    let!(:approval) { create(:approval) }

    it 'returns the approval by id' do
      expect(described_class.find(approval.id)).to eq(approval)
    end
  end

  describe '.approve' do
    let(:user) { create(:user) }
    let!(:approval) { create(:approval, status: 'pending') }

    it 'changes status to approved' do
      result = described_class.approve(approval.id, user)
      expect(result.status).to eq('approved')
    end

    it 'sets resolved_at' do
      result = described_class.approve(approval.id, user)
      expect(result.resolved_at).to be_present
    end

    it 'sets resolved_by to the user' do
      result = described_class.approve(approval.id, user)
      expect(result.resolved_by).to eq(user)
    end
  end

  describe '.deny' do
    let(:user) { create(:user) }
    let!(:approval) { create(:approval, status: 'pending') }

    it 'changes status to denied' do
      result = described_class.deny(approval.id, user)
      expect(result.status).to eq('denied')
    end

    it 'sets resolved_at' do
      result = described_class.deny(approval.id, user)
      expect(result.resolved_at).to be_present
    end

    it 'sets resolved_by to the user' do
      result = described_class.deny(approval.id, user)
      expect(result.resolved_by).to eq(user)
    end
  end
end
