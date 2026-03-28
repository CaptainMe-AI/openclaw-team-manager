# frozen_string_literal: true

json.total_tokens @summary[:total_tokens]
json.total_api_calls @summary[:total_api_calls]
json.total_cost_cents @summary[:total_cost_cents]
json.avg_latency_ms @summary[:avg_latency_ms]
json.token_trend @summary[:token_trend]
json.api_calls_trend @summary[:api_calls_trend]
json.cost_trend @summary[:cost_trend]
json.latency_trend @summary[:latency_trend]
