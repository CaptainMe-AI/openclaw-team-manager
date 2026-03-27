# frozen_string_literal: true

FactoryBot.define do
  factory :agent do
    name { Faker::Name.first_name + "-agent" }
    agent_id { "agt_#{SecureRandom.hex(4)}" }
    status { "active" }
    model_name { %w[opus sonnet].sample }
    workspace { "~/projects/#{Faker::Lorem.word}" }
    uptime_since { rand(1..7).days.ago }
  end
end
