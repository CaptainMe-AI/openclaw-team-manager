# frozen_string_literal: true

require 'rails_helper'

RSpec.describe Setting, type: :model do
  subject(:setting) { build(:setting) }

  describe 'factory' do
    it 'is valid with default attributes' do
      expect(setting).to be_valid
    end
  end

  describe 'validations' do
    it 'requires key' do
      setting.key = ''
      expect(setting).not_to be_valid
      expect(setting.errors[:key]).to include("can't be blank")
    end

    it 'requires key to be unique' do
      create(:setting, key: 'general.duplicate')
      duplicate = build(:setting, key: 'general.duplicate')
      expect(duplicate).not_to be_valid
      expect(duplicate.errors[:key]).to include('has already been taken')
    end
  end
end
