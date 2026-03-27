# frozen_string_literal: true

module Api
  module V1
    class AgentsController < BaseController
      def index
        scope = AgentService.list(
          filters: { status: params[:status], llm_model: params[:llm_model] },
          sort: sort_param,
          dir: dir_param
        )
        @pagy, @agents = pagy(scope)
        @agents = AgentService.enrich_with_token_data(@agents.to_a)
      end

      def show
        @agent = Agent.includes(:tasks).find(params[:id])
        AgentService.enrich_with_token_data([@agent])
      end

      def create
        @agent = AgentService.create(agent_params)
        render :show, status: :created
      end

      def update
        @agent = AgentService.update(params[:id], agent_params)
        render :show
      end

      private

      def agent_params
        params.expect(agent: %i[name agent_id status llm_model workspace uptime_since])
      end
    end
  end
end
