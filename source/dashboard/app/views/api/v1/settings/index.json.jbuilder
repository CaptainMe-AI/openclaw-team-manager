# frozen_string_literal: true

json.data do
  json.array! @settings do |setting|
    json.extract! setting, :id, :key, :value
  end
end
