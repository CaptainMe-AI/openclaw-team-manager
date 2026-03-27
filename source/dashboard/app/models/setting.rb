# frozen_string_literal: true

# == Schema Information
#
# Table name: settings
#
#  id         :uuid             not null, primary key
#  key        :string           not null
#  value      :jsonb
#  created_at :datetime         not null
#  updated_at :datetime         not null
#
# Indexes
#
#  index_settings_on_key  (key) UNIQUE
#
class Setting < ApplicationRecord
  validates :key, presence: true, uniqueness: true
end
