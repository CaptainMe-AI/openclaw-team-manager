# frozen_string_literal: true

class AddLatencyAndEndpointToUsageRecords < ActiveRecord::Migration[8.0]
  def change
    add_column :usage_records, :latency_ms, :integer
    add_column :usage_records, :endpoint, :string
    add_index :usage_records, :endpoint
  end
end
