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
class Agent < ApplicationRecord
  enum :status, { active: 'active', idle: 'idle', error: 'error', disabled: 'disabled' }

  has_many :tasks, dependent: :nullify
  has_many :approvals, dependent: :destroy
  has_many :usage_records, dependent: :destroy

  validates :name, presence: true
  validates :agent_id, presence: true, uniqueness: true
  validates :status, presence: true
end
