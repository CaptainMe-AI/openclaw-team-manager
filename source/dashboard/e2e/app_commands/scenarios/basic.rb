# Basic scenario: creates a user, an active agent, and a task
user = User.create!(
  email: 'e2e@example.com',
  password: 'password123',
  password_confirmation: 'password123'
)

agent = Agent.create!(
  name: 'scout-agent',
  agent_id: "agt_#{SecureRandom.hex(4)}",
  status: 'active',
  llm_model: 'sonnet',
  workspace: '~/projects/demo',
  uptime_since: 2.hours.ago
)

Task.create!(
  task_id: "TASK-#{SecureRandom.hex(3).upcase}",
  title: 'Analyze test coverage',
  description: 'Review and improve unit test coverage across the codebase',
  status: 'in_progress',
  priority: 1,
  agent: agent
)
