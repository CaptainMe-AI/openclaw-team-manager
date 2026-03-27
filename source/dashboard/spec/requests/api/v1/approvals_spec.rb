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
end
