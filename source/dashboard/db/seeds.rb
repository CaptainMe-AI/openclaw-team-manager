# frozen_string_literal: true

User.find_or_create_by!(email: "admin@openclaw.local") do |user|
  user.password = "password123"
  user.password_confirmation = "password123"
end

puts "Seeded admin user: admin@openclaw.local / password123"
