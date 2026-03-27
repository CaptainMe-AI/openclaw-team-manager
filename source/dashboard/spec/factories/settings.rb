# frozen_string_literal: true

FactoryBot.define do
  factory :setting do
    key { "general.#{Faker::Lorem.unique.word}" }
    value { { enabled: true } }
  end
end
