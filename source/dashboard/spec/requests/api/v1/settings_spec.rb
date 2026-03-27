# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Settings', type: :request do
  let(:user) { create(:user) }

  before { sign_in user }

  describe 'GET /api/v1/settings' do
    before do
      create(:setting, key: 'general.timezone', value: 'UTC')
      create(:setting, key: 'notifications.email', value: true)
    end

    it 'returns 200 with data array' do
      get api_v1_settings_path, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['data']).to be_an(Array)
      expect(json['data'].length).to eq(2)
    end

    it 'returns settings with correct fields' do
      get api_v1_settings_path, as: :json
      json = response.parsed_body
      setting = json['data'].first
      expect(setting).to include('id', 'key', 'value')
    end
  end

  describe 'GET /api/v1/settings/:key' do
    let!(:setting) { create(:setting, key: 'general.timezone', value: 'UTC') }

    it 'returns the setting by key' do
      get api_v1_setting_path(key: 'general.timezone'), as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['key']).to eq('general.timezone')
      expect(json['value']).to eq('UTC')
    end

    it 'returns 404 for unknown key' do
      get api_v1_setting_path(key: 'nonexistent.key'), as: :json
      expect(response).to have_http_status(:not_found)
    end
  end

  describe 'PATCH /api/v1/settings/:key' do
    let!(:setting) { create(:setting, key: 'general.timezone', value: 'UTC') }

    it 'updates the setting value' do
      patch api_v1_setting_path(key: 'general.timezone'), params: { setting: { value: 'America/New_York' } }, as: :json
      expect(response).to have_http_status(:ok)
      json = response.parsed_body
      expect(json['value']).to eq('America/New_York')
    end
  end
end
