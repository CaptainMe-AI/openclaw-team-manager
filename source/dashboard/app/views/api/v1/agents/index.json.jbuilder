# frozen_string_literal: true

json.data do
  json.array! @agents, partial: 'api/v1/agents/agent', as: :agent
end
json.pagination pagination_meta(@pagy)
