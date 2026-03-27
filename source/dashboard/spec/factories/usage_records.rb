# frozen_string_literal: true

FactoryBot.define do
  factory :usage_record do
    association :agent
    input_tokens { rand(1000..50000) }
    output_tokens { rand(500..25000) }
    api_calls { rand(10..200) }
    cost_cents { rand(5..500) }
    model_name { %w[opus sonnet].sample }
    recorded_at { Time.current }
  end
end
