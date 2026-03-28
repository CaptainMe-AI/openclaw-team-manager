# frozen_string_literal: true

json.token_usage_over_time do
  json.array! @charts[:token_usage] do |point|
    json.bucket point[:bucket].iso8601
    json.agent_name point[:agent_name]
    json.total_tokens point[:total_tokens]
  end
end

json.cost_by_agent do
  json.array! @charts[:cost_by_agent] do |point|
    json.name point[:agent_name]
    json.value point[:cost_cents]
  end
end

json.calls_by_endpoint do
  json.array! @charts[:calls_by_endpoint] do |point|
    json.endpoint point[:endpoint]
    json.calls point[:total_calls]
  end
end

json.latency_distribution do
  json.array! @charts[:latency_distribution] do |bucket|
    json.range bucket[:range]
    json.count bucket[:count]
  end
end
