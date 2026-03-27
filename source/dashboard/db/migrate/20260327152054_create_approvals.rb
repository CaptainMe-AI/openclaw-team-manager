# frozen_string_literal: true

class CreateApprovals < ActiveRecord::Migration[8.0]
  def change
    create_table :approvals, id: :uuid do |t|
      t.string :title, null: false
      t.text :description
      t.string :approval_type, null: false
      t.string :status, null: false, default: "pending"
      t.string :risk_level, null: false, default: "medium"
      t.jsonb :context, default: {}
      t.datetime :requested_at, null: false
      t.datetime :resolved_at
      t.references :agent, type: :uuid, foreign_key: true
      t.references :resolved_by, type: :uuid, foreign_key: { to_table: :users }
      t.timestamps
    end

    add_index :approvals, :approval_type
    add_index :approvals, :status
    add_index :approvals, :risk_level
  end
end
