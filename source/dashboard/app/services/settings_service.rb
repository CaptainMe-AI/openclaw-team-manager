# frozen_string_literal: true

class SettingsService
  def self.list
    Setting.order(:key)
  end

  def self.find_by_key(key)
    Setting.find_by!(key: key)
  end

  def self.update(key, value)
    setting = find_by_key(key)
    setting.update!(value: value)
    setting
  end
end
