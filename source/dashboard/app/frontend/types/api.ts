// Pagination metadata from Pagy
export interface PaginationMeta {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_count: number;
}

// Generic paginated response wrapper
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

// Agent (from GET /api/v1/agents)
export interface Agent {
  id: string;
  name: string;
  agent_id: string;
  status: "active" | "idle" | "error" | "disabled";
  llm_model: string | null;
  workspace: string | null;
  uptime_since: string | null;
  created_at: string;
  updated_at: string;
}

// Task (from GET /api/v1/tasks)
export interface Task {
  id: string;
  task_id: string;
  title: string;
  description: string | null;
  status:
    | "backlog"
    | "queued"
    | "in_progress"
    | "awaiting_approval"
    | "completed"
    | "failed";
  priority: 0 | 1 | 2 | 3;
  agent_id: string | null;
  agent_name: string | null;
  created_at: string;
  updated_at: string;
}

// Approval (from GET /api/v1/approvals)
export interface Approval {
  id: string;
  title: string;
  description: string | null;
  approval_type: "dangerous_command" | "sensitive_data" | "budget_override";
  status: "pending" | "approved" | "denied";
  risk_level: "low" | "medium" | "high" | "critical";
  context: Record<string, unknown>;
  agent_id: string | null;
  agent_name: string | null;
  resolved_by_id: string | null;
  requested_at: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

// UsageRecord (from GET /api/v1/usage)
export interface UsageRecord {
  id: string;
  agent_id: string;
  agent_name: string | null;
  input_tokens: number;
  output_tokens: number;
  api_calls: number;
  cost_cents: number;
  llm_model: string | null;
  recorded_at: string;
}

// Dashboard KPIs (from GET /api/v1/dashboard)
export interface DashboardData {
  active_agents: number;
  tasks_in_progress: number;
  pending_approvals: number;
  tokens_used_24h: number;
  cost_24h_cents: number;
  recent_tasks: Task[];
  pending_approval_items: Approval[];
}

// Setting (from GET /api/v1/settings)
export interface Setting {
  id: string;
  key: string;
  value: unknown;
}

// API error shape
export interface ApiErrorBody {
  error: string | string[];
}
