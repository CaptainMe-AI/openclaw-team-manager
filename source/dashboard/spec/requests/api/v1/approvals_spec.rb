# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Approvals', type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe 'GET /api/v1/approvals' do
    before do
      create(:approval, status: 'pending', risk_level: 'high')
      create(:approval, status: 'approved', risk_level: 'low')
    end

    it 'returns 200 with data and pagination' do
      get api_v1_approvals_path, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['data']).to be_an(Array)
      expect(json['data'].length).to eq(2)
      expect(json['pagination']).to be_present
    end

    it 'filters by status' do
      get api_v1_approvals_path, params: { status: 'pending' }, as: :json
      json = response.parsed_body
      expect(json['data'].length).to eq(1)
      expect(json['data'].first['status']).to eq('pending')
    end

    it 'returns approvals with correct fields' do
      get api_v1_approvals_path, as: :json
      json = response.parsed_body
      approval_json = json['data'].first
      expect(approval_json).to include('id', 'title', 'description', 'approval_type', 'status',
                                       'risk_level', 'context', 'agent_id', 'agent_name',
                                       'resolved_by_id', 'requested_at', 'resolved_at')
    end

    it 'includes resolved_by_name for resolved approvals' do
      resolved = create(:approval, status: 'approved', resolved_by: user, resolved_at: Time.current)
      get api_v1_approvals_path, as: :json
      json = response.parsed_body
      resolved_json = json['data'].find { |a| a['id'] == resolved.id }
      expect(resolved_json['resolved_by_name']).to eq(user.email)
    end
  end

  describe 'PATCH /api/v1/approvals/:id/approve' do
    let!(:approval) { create(:approval, status: 'pending') }

    it 'changes status to approved and sets resolved_by and resolved_at' do
      patch approve_api_v1_approval_path(approval), as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['status']).to eq('approved')
      expect(json['resolved_by_id']).to eq(user.id)
      expect(json['resolved_at']).to be_present
    end
  end

  describe 'PATCH /api/v1/approvals/:id/deny' do
    let!(:approval) { create(:approval, status: 'pending') }

    it 'changes status to denied' do
      patch deny_api_v1_approval_path(approval), as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['status']).to eq('denied')
      expect(json['resolved_by_id']).to eq(user.id)
      expect(json['resolved_at']).to be_present
    end
  end

  describe 'POST /api/v1/approvals/batch_approve' do
    let!(:pending_first) { create(:approval, status: 'pending') }
    let!(:pending_second) { create(:approval, status: 'pending') }
    let!(:already_approved) { create(:approval, status: 'approved') }

    it 'returns 200 with approved count' do
      post batch_approve_api_v1_approvals_path,
           params: { ids: [pending_first.id, pending_second.id] }, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['approved']).to eq(2)
    end

    it 'changes pending approvals to approved with resolved_by' do
      post batch_approve_api_v1_approvals_path,
           params: { ids: [pending_first.id, pending_second.id] }, as: :json
      expect(pending_first.reload.status).to eq('approved')
      expect(pending_second.reload.status).to eq('approved')
      expect(pending_first.reload.resolved_by_id).to eq(user.id)
      expect(pending_second.reload.resolved_by_id).to eq(user.id)
    end

    it 'ignores non-pending approvals in the batch' do
      post batch_approve_api_v1_approvals_path,
           params: { ids: [pending_first.id, already_approved.id] }, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['approved']).to eq(1)
    end

    it 'returns 200 with zero approved for empty ids' do
      post batch_approve_api_v1_approvals_path, params: { ids: [] }, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['approved']).to eq(0)
    end
  end
end
