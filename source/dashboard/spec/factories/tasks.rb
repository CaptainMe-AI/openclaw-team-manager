# frozen_string_literal: true

FactoryBot.define do
  factory :task do
    task_id { "TASK-#{SecureRandom.hex(3).upcase}" }
    title { Faker::Lorem.sentence(word_count: 4) }
    description { Faker::Lorem.paragraph }
    status { "backlog" }
    priority { 2 }
    association :agent
  end
end
