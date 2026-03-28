# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users, skip: [:registrations]

  # Health check endpoint (Rails 8 default)
  get 'up' => 'rails/health#show', as: :rails_health_check

  # API endpoints (must be before SPA catch-all)
  namespace :api do
    namespace :v1 do
      resources :agents, only: %i[index show create update]
      resources :tasks, only: %i[index show create update]
      resources :approvals, only: %i[index show] do
        member do
          patch :approve
          patch :deny
        end
        collection do
          post :batch_approve
        end
      end
      resources :usage, only: [:index] do
        collection do
          get :summary
          get :charts
        end
      end
      resource :dashboard, only: [:show], controller: 'dashboard'
      resources :settings, only: %i[index show update], param: :key, constraints: { key: %r{[^/]+} }
    end
  end

  # SPA root -- serves the React app for authenticated users
  root 'pages#app'

  # Catch-all for client-side routing (MUST be last)
  get '*path', to: 'pages#app', constraints: lambda { |req|
    !req.path.start_with?('/rails/', '/api/')
  }
end
