# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      TIME_PERIODS = {
        '1h' => 1.hour,
        '6h' => 6.hours,
        '24h' => 24.hours,
        '7d' => 7.days,
        '30d' => 30.days
      }.freeze

      def show
        duration = TIME_PERIODS.fetch(params[:time_period], 24.hours)
        @dashboard = DashboardService.summary(from: duration.ago, to: Time.current)
      end
    end
  end
end
