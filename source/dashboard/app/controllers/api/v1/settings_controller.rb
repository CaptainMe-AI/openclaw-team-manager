# frozen_string_literal: true

module Api
  module V1
    class SettingsController < BaseController
      def index
        @settings = SettingsService.list
      end

      def show
        @setting = SettingsService.find_by(key: params[:key])
      end

      def update
        @setting = SettingsService.update(params[:key], setting_params[:value])
        render :show
      end

      private

      def setting_params
        params.expect(setting: [:value])
      end
    end
  end
end
