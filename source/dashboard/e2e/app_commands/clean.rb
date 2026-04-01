if defined?(DatabaseCleaner)
  # cleaning the database using database_cleaner
  DatabaseCleaner.strategy = :truncation
  DatabaseCleaner.clean
else
  logger.warn "add database_cleaner or update e2e/app_commands/clean.rb"
  # Delete in FK-safe order
  UsageRecord.delete_all if defined?(UsageRecord)
  Task.delete_all if defined?(Task)
  Approval.delete_all if defined?(Approval)
  Agent.delete_all if defined?(Agent)
  Setting.delete_all if defined?(Setting)
  User.delete_all if defined?(User)
end

CypressOnRails::SmartFactoryWrapper.reload

if defined?(VCR)
  VCR.eject_cassette # make sure we no cassette inserted before the next test starts
  VCR.turn_off!
  WebMock.disable! if defined?(WebMock)
end

Rails.logger.info "APPCLEANED" # used by log_fail.rb
