# frozen_string_literal: true

# == Schema Information
#
# Table name: agents
#
#  id           :uuid             not null, primary key
#  llm_model    :string
#  name         :string           not null
#  status       :string           default("idle"), not null
#  uptime_since :datetime
#  workspace    :string
#  created_at   :datetime         not null
#  updated_at   :datetime         not null
#  agent_id     :string           not null
#
# Indexes
#
#  index_agents_on_agent_id  (agent_id) UNIQUE
#  index_agents_on_status    (status)
#
FactoryBot.define do
  factory :agent do
    name { "#{Faker::Name.first_name}-agent" }
    agent_id { "agt_#{SecureRandom.hex(4)}" }
    status { 'active' }
    llm_model { %w[opus sonnet].sample }
    workspace { "~/projects/#{Faker::Lorem.word}" }
    uptime_since { rand(1..7).days.ago }
  end
end
