# frozen_string_literal: true

module Api
  module V1
    class TasksController < BaseController
      def index
        scope = TaskService.list(
          filters: { status: params[:status], priority: params[:priority], agent_id: params[:agent_id] },
          sort: sort_param,
          dir: dir_param
        )
        @pagy, @tasks = pagy(scope)
      end

      def show
        @task = TaskService.find(params[:id])
      end

      def create
        @task = TaskService.create(task_params)
        render :show, status: :created
      end

      def update
        @task = TaskService.update(params[:id], task_params)
        render :show
      end

      private

      def task_params
        params.require(:task).permit(:task_id, :title, :description, :status, :priority, :agent_id)
      end
    end
  end
end
