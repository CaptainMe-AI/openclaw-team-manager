# frozen_string_literal: true

class User < ApplicationRecord
  devise :database_authenticatable, :rememberable, :validatable
  # Removed :registerable -- users created via console only (per D-24)
end
