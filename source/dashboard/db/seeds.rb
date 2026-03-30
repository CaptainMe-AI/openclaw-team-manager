# frozen_string_literal: true

# Idempotency guard: skip if data already seeded
return if Agent.exists?

Rails.logger.debug 'Seeding OpenClaw Team Manager data...'

# --- Seed user (needed for resolved_by on approvals) ---
user = User.find_or_create_by!(email: 'admin@openclaw.local') do |u|
  u.password = 'password123'
  u.password_confirmation = 'password123'
end

# --- 6 Agents (3 active, 1 idle, 1 error, 1 disabled) ---
agents_data = [
  { name: 'docs-writer',    agent_id: 'agt_docs01', status: 'active',   llm_model: 'opus',
    workspace: '~/projects/docs',      uptime_since: 2.days.ago },
  { name: 'code-reviewer',  agent_id: 'agt_code01', status: 'active',   llm_model: 'sonnet',
    workspace: '~/projects/api',       uptime_since: 5.days.ago },
  { name: 'test-runner',    agent_id: 'agt_test01', status: 'active',   llm_model: 'sonnet',
    workspace: '~/projects/tests',     uptime_since: 1.day.ago },
  { name: 'deploy-bot',     agent_id: 'agt_depl01', status: 'idle',     llm_model: 'opus',
    workspace: '~/projects/infra',     uptime_since: 3.days.ago },
  { name: 'data-analyzer',  agent_id: 'agt_data01', status: 'error',    llm_model: 'opus',
    workspace: '~/projects/analytics', uptime_since: 6.days.ago },
  { name: 'legacy-migrator', agent_id: 'agt_legc01', status: 'disabled', llm_model: 'sonnet',
    workspace: '~/projects/legacy', uptime_since: nil }
]
agents = agents_data.map { |data| Agent.create!(data) }

# --- ~35 Tasks across all Kanban columns ---
task_titles = {
  backlog: [
    'Set up CI/CD pipeline for staging environment',
    'Write unit tests for notification service',
    'Create database backup automation script',
    'Design error handling strategy for API v3',
    'Audit third-party dependency licenses'
  ],
  queued: [
    'Refactor auth middleware to use JWT',
    'Optimize database query for user search',
    'Add rate limiting to public API endpoints',
    'Implement webhook retry mechanism',
    'Update Swagger docs for billing endpoints',
    'Add health check endpoint for monitoring'
  ],
  in_progress: [
    'Write API documentation for v2 endpoints',
    'Migrate user sessions to Redis-backed store',
    'Build CSV export for usage reports',
    'Implement role-based access control',
    'Add pagination to task history endpoint',
    'Create agent heartbeat monitoring',
    'Refactor file upload to use streaming',
    'Add WebSocket reconnection logic'
  ],
  awaiting_approval: [
    'Deploy staging environment with new config',
    'Run database migration for schema v4',
    'Enable feature flag for beta users',
    'Update production SSL certificates'
  ],
  completed: [
    'Set up PostgreSQL connection pooling',
    'Implement token refresh rotation',
    'Create admin dashboard layout',
    'Add structured logging with correlation IDs',
    'Write integration tests for payment flow',
    'Migrate legacy user table to new schema',
    'Configure CORS for mobile API clients',
    'Add Sentry error tracking integration',
    'Build agent status notification system'
  ],
  failed: [
    'Analyze query performance on user dashboard',
    'Run regression test suite for payment module',
    'Deploy canary release to production cluster'
  ]
}

task_counter = 0
task_titles.each do |status, titles|
  titles.each_with_index do |title, _i|
    task_counter += 1
    Task.create!(
      task_id: format('TASK-%03d', task_counter),
      title: title,
      description: Faker::Lorem.paragraph(sentence_count: 2),
      status: status.to_s,
      priority: [0, 1, 2, 2, 2, 3].sample,
      agent: agents[task_counter % agents.size]
    )
  end
end

# --- 12 Approvals (5 pending, 4 approved, 3 denied) ---
approval_data = [
  # 5 Pending
  { title: 'rm -rf /tmp/build-cache', description: 'Agent wants to clear the build cache directory',
    approval_type: 'dangerous_command', status: 'pending', risk_level: 'high',
    context: { command: 'rm -rf /tmp/build-cache', working_directory: '~/projects/api' },
    agent: agents[0] },
  { title: 'Execute DROP TABLE on staging', description: 'Agent needs to drop deprecated staging table',
    approval_type: 'dangerous_command', status: 'pending', risk_level: 'critical',
    context: { command: 'DROP TABLE deprecated_sessions;', working_directory: '~/projects/api' },
    agent: agents[1] },
  { title: 'Override monthly budget limit to $500', description: 'Agent requesting increased budget for large batch job',
    approval_type: 'budget_override', status: 'pending', risk_level: 'medium',
    context: { current_limit_cents: 10_000, requested_limit_cents: 50_000 },
    agent: agents[2] },
  { title: 'Increase daily API spend to $200', description: 'Agent needs higher daily limit for data processing',
    approval_type: 'budget_override', status: 'pending', risk_level: 'medium',
    context: { current_limit_cents: 5000, requested_limit_cents: 20_000 },
    agent: agents[3] },
  { title: 'Access production database credentials', description: 'Agent requires read access to production DB for analytics',
    approval_type: 'sensitive_data', status: 'pending', risk_level: 'high',
    context: { file_path: '/etc/openclaw/prod-credentials.yml', classification: 'restricted' },
    agent: agents[4] },

  # 4 Approved
  { title: 'chmod 755 /var/log/openclaw', description: 'Agent needed to fix log directory permissions',
    approval_type: 'dangerous_command', status: 'approved', risk_level: 'low',
    context: { command: 'chmod 755 /var/log/openclaw', working_directory: '/' },
    agent: agents[0], resolved_by: user, resolved_at: 2.hours.ago },
  { title: 'Read .env.production for deployment', description: 'Agent accessed env file for deployment configuration',
    approval_type: 'sensitive_data', status: 'approved', risk_level: 'medium',
    context: { file_path: '~/projects/api/.env.production', classification: 'internal' },
    agent: agents[1], resolved_by: user, resolved_at: 1.day.ago },
  { title: 'Increase batch processing budget to $100', description: 'Agent needed extra budget for overnight batch run',
    approval_type: 'budget_override', status: 'approved', risk_level: 'low',
    context: { current_limit_cents: 5000, requested_limit_cents: 10_000 },
    agent: agents[2], resolved_by: user, resolved_at: 3.days.ago },
  { title: 'Run kill -9 on stuck process', description: 'Agent needed to force-kill unresponsive worker',
    approval_type: 'dangerous_command', status: 'approved', risk_level: 'medium',
    context: { command: 'kill -9 28451', working_directory: '~/projects/infra' },
    agent: agents[3], resolved_by: user, resolved_at: 5.hours.ago },

  # 3 Denied
  { title: 'Delete /var/lib/postgresql/data', description: 'Agent attempted to delete production database files',
    approval_type: 'dangerous_command', status: 'denied', risk_level: 'critical',
    context: { command: 'rm -rf /var/lib/postgresql/data', working_directory: '/' },
    agent: agents[4], resolved_by: user, resolved_at: 6.hours.ago },
  { title: 'Access SSH private keys', description: 'Agent tried to read SSH keys for remote deployment',
    approval_type: 'sensitive_data', status: 'denied', risk_level: 'critical',
    context: { file_path: '~/.ssh/id_rsa', classification: 'secret' },
    agent: agents[0], resolved_by: user, resolved_at: 2.days.ago },
  { title: 'Override budget to $2000/month', description: 'Agent requested unreasonably high budget override',
    approval_type: 'budget_override', status: 'denied', risk_level: 'high',
    context: { current_limit_cents: 10_000, requested_limit_cents: 200_000 },
    agent: agents[1], resolved_by: user, resolved_at: 4.days.ago }
]

approval_data.each do |data|
  Approval.create!(
    title: data[:title],
    description: data[:description],
    approval_type: data[:approval_type],
    status: data[:status],
    risk_level: data[:risk_level],
    context: data[:context],
    requested_at: data.fetch(:resolved_at, Time.current) - rand(1..6).hours,
    resolved_at: data[:resolved_at],
    agent: data[:agent],
    resolved_by: data[:resolved_by]
  )
end

# --- 7 days of hourly usage records (~1,008 records) ---
active_agents = agents[0..2] # docs-writer, code-reviewer, test-runner
idle_agent = agents[3]         # deploy-bot
error_agent = agents[4]        # data-analyzer
disabled_agent = agents[5]     # legacy-migrator

now = Time.current
usage_records = []

168.times do |hour_offset|
  recorded_at = now - (167 - hour_offset).hours
  day_offset = hour_offset / 24 # 0-6 (day 0 = oldest, day 6 = most recent)

  # Active agents: high usage
  active_agents.each do |agent|
    usage_records << {
      agent_id: agent.id,
      input_tokens: rand(5000..50_000),
      output_tokens: rand(2000..25_000),
      api_calls: rand(20..200),
      cost_cents: rand(50..500),
      llm_model: agent.llm_model,
      latency_ms: rand(80..350),
      endpoint: ['/v1/chat/completions', '/v1/embeddings', '/v1/completions'].sample,
      recorded_at: recorded_at,
      created_at: recorded_at,
      updated_at: recorded_at
    }
  end

  # Idle agent: moderate usage
  usage_records << {
    agent_id: idle_agent.id,
    input_tokens: rand(1000..10_000),
    output_tokens: rand(500..5000),
    api_calls: rand(5..50),
    cost_cents: rand(10..100),
    llm_model: idle_agent.llm_model,
    latency_ms: rand(50..200),
    endpoint: ['/v1/models', '/v1/chat/completions'].sample,
    recorded_at: recorded_at,
    created_at: recorded_at,
    updated_at: recorded_at
  }

  # Error agent: usage drops off after day 5
  if day_offset < 5
    usage_records << {
      agent_id: error_agent.id,
      input_tokens: rand(3000..30_000),
      output_tokens: rand(1500..15_000),
      api_calls: rand(15..150),
      cost_cents: rand(30..300),
      llm_model: error_agent.llm_model,
      latency_ms: rand(100..500),
      endpoint: ['/v1/chat/completions', '/v1/embeddings', '/v1/completions', '/v1/audio/transcriptions'].sample,
      recorded_at: recorded_at,
      created_at: recorded_at,
      updated_at: recorded_at
    }
  else
    usage_records << {
      agent_id: error_agent.id,
      input_tokens: rand(0..100),
      output_tokens: rand(0..50),
      api_calls: rand(0..2),
      cost_cents: rand(0..5),
      llm_model: error_agent.llm_model,
      latency_ms: rand(300..1200),
      endpoint: '/v1/chat/completions',
      recorded_at: recorded_at,
      created_at: recorded_at,
      updated_at: recorded_at
    }
  end

  # Disabled agent: zero usage
  usage_records << {
    agent_id: disabled_agent.id,
    input_tokens: 0,
    output_tokens: 0,
    api_calls: 0,
    cost_cents: 0,
    llm_model: disabled_agent.llm_model,
    latency_ms: nil,
    endpoint: nil,
    recorded_at: recorded_at,
    created_at: recorded_at,
    updated_at: recorded_at
  }
end

# Bulk insert for performance
UsageRecord.insert_all!(usage_records)

# --- 15 Default Settings ---
settings = [
  { key: 'general.display_name', value: { name: 'OpenClaw Dashboard' } },
  { key: 'general.timezone', value: { timezone: 'UTC' } },
  { key: 'general.refresh_interval', value: { seconds: 30 } },
  { key: 'agents.default_budget_cents', value: { amount: 10_000 } },
  { key: 'agents.auto_restart', value: { enabled: true } },
  { key: 'agents.allowed_tools', value: { tools: %w[file_read file_write shell_exec web_search] } },
  { key: 'notifications.budget_threshold', value: { percent: 80 } },
  { key: 'notifications.failure_alert', value: { enabled: true, consecutive: 3 } },
  { key: 'notifications.approval_timeout_minutes', value: { minutes: 30 } },
  { key: 'notifications.agent_offline_minutes', value: { minutes: 5 } },
  { key: 'datasource.gateway_url', value: { url: 'ws://localhost:4080' } },
  { key: 'datasource.openclaw_home', value: { path: '~/.openclaw' } },
  { key: 'datasource.auth_token', value: { token: '' } },
  { key: 'datasource.session_path', value: { path: '~/.openclaw/agents/' } },
  { key: 'datasource.refresh_interval', value: { seconds: 5 } }
]

settings.each { |s| Setting.create!(s) }

Rails.logger.debug do
  "Seeded: #{Agent.count} agents, #{Task.count} tasks, #{Approval.count} approvals, " \
    "#{UsageRecord.count} usage records, #{Setting.count} settings"
end
