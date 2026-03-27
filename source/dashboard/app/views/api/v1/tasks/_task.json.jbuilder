# frozen_string_literal: true

json.extract! task, :id, :task_id, :title, :description, :status, :priority, :agent_id
json.agent_name task.agent&.name
json.created_at task.created_at.iso8601
json.updated_at task.updated_at.iso8601
