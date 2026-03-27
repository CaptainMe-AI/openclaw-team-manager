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
class Task < ApplicationRecord
  enum :status, { backlog: "backlog", queued: "queued", in_progress: "in_progress",
                  awaiting_approval: "awaiting_approval", completed: "completed", failed: "failed" }

  belongs_to :agent, optional: true

  validates :task_id, presence: true, uniqueness: true
  validates :title, presence: true
  validates :status, presence: true
  validates :priority, presence: true, numericality: { only_integer: true, in: 0..3 }
end
