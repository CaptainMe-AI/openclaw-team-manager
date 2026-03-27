import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Modal } from "@/components/ui/Modal";
import { Input, Button } from "@/components/ui";
import { useCreateTask } from "@/hooks/useTasks";
import { useAgents } from "@/hooks/useAgents";

interface NewTaskModalProps {
  open: boolean;
  onClose: () => void;
}

interface NewTaskForm {
  title: string;
  agent_id: string;
  description: string;
  priority: number;
}

const initialForm: NewTaskForm = {
  title: "",
  agent_id: "",
  description: "",
  priority: 2,
};

export function NewTaskModal({ open, onClose }: NewTaskModalProps) {
  const [form, setForm] = useState<NewTaskForm>(initialForm);
  const [submitted, setSubmitted] = useState(false);

  const createTask = useCreateTask();
  const { data: agentsData } = useAgents({ per_page: 100 });
  const agents = agentsData?.data ?? [];

  const errors = {
    title: !form.title.trim() ? "Task name is required" : undefined,
    agent_id: !form.agent_id ? "Agent selection is required" : undefined,
    description: !form.description.trim()
      ? "Description is required"
      : undefined,
  };
  const hasErrors = Object.values(errors).some(Boolean);

  function handleSubmit() {
    setSubmitted(true);
    if (hasErrors) return;
    createTask.mutate(
      {
        task: {
          task_id: `TASK-${Date.now().toString(36).toUpperCase()}`,
          title: form.title.trim(),
          description: form.description.trim(),
          priority: form.priority,
          agent_id: form.agent_id,
        },
      },
      {
        onSuccess: () => {
          toast.success("Task created");
          handleClose();
        },
        onError: () => {
          toast.error("Failed to create task");
        },
      },
    );
  }

  function handleClose() {
    setForm(initialForm);
    setSubmitted(false);
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Create New Task"
      subtitle="Configure and assign a task to an agent."
    >
      <div className="space-y-4">
        {/* Task Name */}
        <Input
          label="Task Name *"
          placeholder="e.g., Scrape competitor pricing data"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          error={submitted ? errors.title : undefined}
          aria-invalid={submitted && !!errors.title}
          aria-describedby={
            submitted && errors.title ? "title-error" : undefined
          }
        />

        {/* Agent Dropdown */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Assign Agent *
          </label>
          <select
            className={cn(
              "w-full bg-background border border-border rounded-md py-2 px-3",
              "text-sm text-text-primary",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
              submitted && errors.agent_id && "border-danger",
            )}
            value={form.agent_id}
            onChange={(e) => setForm({ ...form, agent_id: e.target.value })}
            aria-invalid={submitted && !!errors.agent_id}
          >
            <option value="">Select an agent...</option>
            {agents.map((agent) => (
              <option key={agent.id} value={agent.id}>
                {agent.name}
              </option>
            ))}
          </select>
          {submitted && errors.agent_id && (
            <p className="mt-1 text-xs text-danger">{errors.agent_id}</p>
          )}
        </div>

        {/* Description Textarea */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Description *
          </label>
          <textarea
            className={cn(
              "w-full bg-background border border-border rounded-md py-2 px-3",
              "text-sm text-text-primary resize-none",
              "focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent",
              submitted && errors.description && "border-danger",
            )}
            rows={4}
            placeholder="Provide detailed instructions for the agent."
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            aria-invalid={submitted && !!errors.description}
          />
          {submitted && errors.description && (
            <p className="mt-1 text-xs text-danger">{errors.description}</p>
          )}
        </div>

        {/* Attachment Area -- visual placeholder */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Attachments
          </label>
          <div
            className="border-2 border-dashed border-border rounded-lg min-h-[80px] flex items-center justify-center cursor-pointer hover:border-text-secondary transition-colors"
            onClick={() => toast.info("File attachments coming soon")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ")
                toast.info("File attachments coming soon");
            }}
          >
            <p className="text-xs text-text-secondary">
              Drag files, context, requirements, or special instructions
            </p>
          </div>
        </div>

        {/* Priority Level */}
        <div>
          <label className="block text-sm font-semibold text-text-primary mb-1">
            Priority Level
          </label>
          <div
            className="flex gap-2"
            role="radiogroup"
            aria-label="Priority Level"
          >
            {(
              [
                { value: 3, label: "Low" },
                { value: 2, label: "Medium" },
                { value: 1, label: "High" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                role="radio"
                aria-checked={form.priority === opt.value}
                className={cn(
                  "px-4 py-2 text-sm rounded-md border transition-colors",
                  form.priority === opt.value
                    ? "border-accent text-accent bg-accent/10"
                    : "border-border text-text-secondary bg-background hover:border-text-secondary",
                )}
                onClick={() => setForm({ ...form, priority: opt.value })}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Action row */}
      <div className="flex justify-end gap-4 mt-6 pt-4 border-t border-border">
        <Button variant="secondary" onClick={handleClose}>
          Discard Task
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={createTask.isPending}
        >
          {createTask.isPending ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Creating...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlus} className="mr-2" />
              Create Task
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
}
