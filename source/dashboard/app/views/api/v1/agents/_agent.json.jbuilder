# frozen_string_literal: true

json.extract! agent, :id, :name, :agent_id, :status, :llm_model, :workspace
json.uptime_since agent.uptime_since&.iso8601
json.created_at agent.created_at.iso8601
json.updated_at agent.updated_at.iso8601
