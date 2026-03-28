# frozen_string_literal: true

module Api
  module V1
    class UsageController < BaseController
      def index
        @usage_data = UsageService.list(
          filters: {
            agent_id: params[:agent_id],
            from: params[:from],
            to: params[:to]
          }
        )
      end

      def summary
        @summary = UsageService.summary_with_trends(from: time_from, to: time_to)
      end

      def charts
        @charts = {
          token_usage: UsageService.by_agent_over_time(from: time_from, to: time_to, granularity: granularity_param),
          cost_by_agent: UsageService.cost_by_agent(from: time_from, to: time_to),
          calls_by_endpoint: UsageService.calls_by_endpoint(from: time_from, to: time_to),
          latency_distribution: UsageService.latency_distribution(from: time_from, to: time_to)
        }
      end

      private

      def time_from
        params[:from].present? ? Time.zone.parse(params[:from]) : 24.hours.ago
      end

      def time_to
        params[:to].present? ? Time.zone.parse(params[:to]) : Time.current
      end

      def granularity_param
        params[:granularity] || 'hour'
      end
    end
  end
end
