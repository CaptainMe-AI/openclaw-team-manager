# frozen_string_literal: true

json.extract! agent, :id, :name, :agent_id, :status, :llm_model, :workspace
json.uptime_since agent.uptime_since&.iso8601
json.created_at agent.created_at.iso8601
json.updated_at agent.updated_at.iso8601

# Enriched fields (Phase 5)
json.current_task agent.tasks.find { |t| t.status == 'in_progress' }&.title
json.tokens_7d agent.respond_to?(:tokens_7d) ? agent.tokens_7d : 0
json.tokens_7d_series agent.respond_to?(:tokens_7d_series) ? agent.tokens_7d_series : Array.new(7, 0)
