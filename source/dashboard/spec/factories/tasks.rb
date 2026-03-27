# frozen_string_literal: true

# == Schema Information
#
# Table name: tasks
#
#  id          :uuid             not null, primary key
#  description :text
#  priority    :integer          default(2), not null
#  status      :string           default("backlog"), not null
#  title       :string           not null
#  created_at  :datetime         not null
#  updated_at  :datetime         not null
#  agent_id    :uuid
#  task_id     :string           not null
#
# Indexes
#
#  index_tasks_on_agent_id  (agent_id)
#  index_tasks_on_priority  (priority)
#  index_tasks_on_status    (status)
#  index_tasks_on_task_id   (task_id) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (agent_id => agents.id)
#
FactoryBot.define do
  factory :task do
    task_id { "TASK-#{SecureRandom.hex(3).upcase}" }
    title { Faker::Lorem.sentence(word_count: 4) }
    description { Faker::Lorem.paragraph }
    status { 'backlog' }
    priority { 2 }
    association :agent
  end
end
