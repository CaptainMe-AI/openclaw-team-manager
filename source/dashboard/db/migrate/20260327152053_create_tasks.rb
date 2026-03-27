# frozen_string_literal: true

class CreateTasks < ActiveRecord::Migration[8.0]
  def change
    create_table :tasks, id: :uuid do |t|
      t.string :task_id, null: false
      t.string :title, null: false
      t.text :description
      t.string :status, null: false, default: "backlog"
      t.integer :priority, null: false, default: 2
      t.references :agent, type: :uuid, foreign_key: true
      t.timestamps
    end

    add_index :tasks, :task_id, unique: true
    add_index :tasks, :status
    add_index :tasks, :priority
  end
end
