import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import { toast } from "sonner";
import { Button } from "@/components/ui";
import { downloadCsv } from "@/lib/csvExport";
import type { UsageSummary, CostByAgentPoint } from "@/types/api";

interface ExportButtonProps {
  summary: UsageSummary | undefined;
  costByAgent: CostByAgentPoint[] | undefined;
  timeRange: string;
}

export function ExportButton({
  summary,
  costByAgent,
  timeRange,
}: ExportButtonProps) {
  function handleExport() {
    if (!summary || !costByAgent) {
      toast.error("Failed to generate export. Please try again.");
      return;
    }

    const today = new Date().toISOString().split("T")[0];
    const filename = `usage-report-${timeRange}-${today}.csv`;
    const headers = ["Agent", "Cost ($)"];
    const rows = costByAgent.map((agent) => [
      agent.name,
      (agent.value / 100).toFixed(2),
    ]);

    // Add summary row
    rows.push(["TOTAL", (summary.total_cost_cents / 100).toFixed(2)]);

    try {
      downloadCsv(filename, headers, rows);
      toast.success("Usage report downloaded");
    } catch {
      toast.error("Failed to generate export. Please try again.");
    }
  }

  return (
    <Button variant="secondary" onClick={handleExport} disabled={!summary}>
      <FontAwesomeIcon icon={faDownload} />
      Export Report
    </Button>
  );
}
