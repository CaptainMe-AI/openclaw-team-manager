# frozen_string_literal: true

module Api
  module V1
    class DashboardController < BaseController
      def show
        @dashboard = DashboardService.summary
      end
    end
  end
end
