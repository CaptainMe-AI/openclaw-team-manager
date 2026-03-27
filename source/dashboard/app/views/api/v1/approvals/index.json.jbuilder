# frozen_string_literal: true

json.data do
  json.array! @approvals, partial: "api/v1/approvals/approval", as: :approval
end
json.pagination pagination_meta(@pagy)
