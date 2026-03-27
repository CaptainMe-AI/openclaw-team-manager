# frozen_string_literal: true

module Api
  module V1
    class ApprovalsController < BaseController
      def index
        scope = ApprovalService.list(filters: approval_filters, sort: sort_param, dir: dir_param)
        @pagy, @approvals = pagy(scope)
      end

      def show
        @approval = ApprovalService.find(params[:id])
      end

      def approve
        @approval = ApprovalService.approve(params[:id], current_user)
        render :show
      end

      def deny
        @approval = ApprovalService.deny(params[:id], current_user)
        render :show
      end

      private

      def approval_filters
        params.slice(:status, :risk_level, :approval_type, :agent_id).to_unsafe_h.symbolize_keys
      end
    end
  end
end
