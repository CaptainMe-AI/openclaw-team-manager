# frozen_string_literal: true

json.data do
  json.array! @tasks, partial: 'api/v1/tasks/task', as: :task
end
json.pagination pagination_meta(@pagy)
