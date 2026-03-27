# frozen_string_literal: true

class CreateAgents < ActiveRecord::Migration[8.0]
  def change
    create_table :agents, id: :uuid do |t|
      t.string :name, null: false
      t.string :agent_id, null: false
      t.string :status, null: false, default: "idle"
      t.string :llm_model
      t.string :workspace
      t.datetime :uptime_since
      t.timestamps
    end

    add_index :agents, :agent_id, unique: true
    add_index :agents, :status
  end
end
