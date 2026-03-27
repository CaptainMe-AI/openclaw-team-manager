# frozen_string_literal: true

json.data do
  json.array! @usage_data do |record|
    json.id record.id
    json.agent_id record.agent_id
    json.agent_name record.agent&.name
    json.input_tokens record.input_tokens
    json.output_tokens record.output_tokens
    json.api_calls record.api_calls
    json.cost_cents record.cost_cents
    json.llm_model record.llm_model
    json.recorded_at record.recorded_at.iso8601
  end
end
