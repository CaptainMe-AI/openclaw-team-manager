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
    end
  end
end
