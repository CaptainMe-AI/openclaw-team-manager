# frozen_string_literal: true

Rails.application.routes.draw do
  devise_for :users, skip: [:registrations]

  # Health check endpoint (Rails 8 default)
  get "up" => "rails/health#show", as: :rails_health_check

  # SPA root -- serves the React app for authenticated users
  root "pages#app"

  # Catch-all for client-side routing (MUST be last)
  get "*path", to: "pages#app", constraints: ->(req) {
    !req.path.start_with?("/rails/")
  }
end
