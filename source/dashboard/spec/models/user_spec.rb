# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  subject(:user) { build(:user) }

  describe "factory" do
    it "is valid with default attributes" do
      expect(user).to be_valid
    end
  end

  describe "validations" do
    it "requires an email" do
      user.email = nil
      expect(user).not_to be_valid
      expect(user.errors[:email]).to include("can't be blank")
    end

    it "requires a unique email (case insensitive)" do
      create(:user, email: "test@example.com")
      duplicate = build(:user, email: "TEST@example.com")
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:email]).to include("has already been taken")
    end
  end

  describe "UUID primary key" do
    it "assigns a UUID format id on create" do
      created_user = create(:user)
      expect(created_user.id).to match(/\A[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\z/)
    end
  end
end
