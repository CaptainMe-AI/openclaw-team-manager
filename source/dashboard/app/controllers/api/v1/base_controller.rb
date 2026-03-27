# frozen_string_literal: true

module Api
  module V1
    class BaseController < ApplicationController
      include Pagy::Backend

      before_action :authenticate_user!
      skip_before_action :allow_browser, raise: false
      layout false

      rescue_from ActiveRecord::RecordNotFound, with: :not_found
      rescue_from ActiveRecord::RecordInvalid, with: :unprocessable

      private

      def not_found
        render json: { error: "Not found" }, status: :not_found
      end

      def unprocessable(exception)
        render json: { error: exception.record.errors.full_messages }, status: :unprocessable_entity
      end

      def sort_param
        params[:sort]
      end

      def dir_param
        params[:dir] || "desc"
      end

      # Exposed as helper so jbuilder views can call pagination_meta(@pagy)
      def pagination_meta(pagy_obj)
        {
          current_page: pagy_obj.page,
          per_page: pagy_obj.limit,
          total_pages: pagy_obj.pages,
          total_count: pagy_obj.count
        }
      end
      helper_method :pagination_meta
    end
  end
end
