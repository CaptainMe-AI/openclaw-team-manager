# frozen_string_literal: true

FactoryBot.define do
  factory :approval do
    title { Faker::Lorem.sentence(word_count: 3) }
    description { Faker::Lorem.paragraph }
    approval_type { "dangerous_command" }
    status { "pending" }
    risk_level { "medium" }
    context { { command: "rm -rf /tmp/cache" } }
    requested_at { Time.current }
    association :agent
    resolved_by { nil }
    resolved_at { nil }
  end
end
