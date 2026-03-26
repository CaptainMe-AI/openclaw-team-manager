# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Devise Sessions', type: :request do
  describe 'GET /users/sign_in' do
    it 'renders the login page' do
      get new_user_session_path
      expect(response).to have_http_status(:ok)
      expect(response.body).to include('OpenClaw Command Center')
    end
  end

  describe 'POST /users/sign_in' do
    before { create(:user, email: 'test@example.com', password: 'password123') }

    context 'with valid credentials' do
      it 'redirects to root path' do
        post user_session_path, params: {
          user: { email: 'test@example.com', password: 'password123' }
        }
        expect(response).to redirect_to(root_path)
      end
    end

    context 'with invalid credentials' do
      it 're-renders the login form with error status' do
        post user_session_path, params: {
          user: { email: 'test@example.com', password: 'wrongpassword' }
        }
        expect(response).to have_http_status(:unprocessable_entity)
      end
    end
  end
end
