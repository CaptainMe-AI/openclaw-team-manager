# frozen_string_literal: true

class CreateUsageRecords < ActiveRecord::Migration[8.0]
  def change
    create_table :usage_records, id: :uuid do |t|
      t.references :agent, type: :uuid, null: false, foreign_key: true
      t.integer :input_tokens, null: false, default: 0
      t.integer :output_tokens, null: false, default: 0
      t.integer :api_calls, null: false, default: 0
      t.integer :cost_cents, null: false, default: 0
      t.string :llm_model
      t.datetime :recorded_at, null: false
      t.timestamps
    end

    add_index :usage_records, [:agent_id, :recorded_at]
    add_index :usage_records, :recorded_at
  end
end
