import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisVertical } from "@fortawesome/free-solid-svg-icons";
import { Card } from "@/components/ui";

interface ChartCardProps {
  title: string;
  children: React.ReactNode;
}

export function ChartCard({ title, children }: ChartCardProps) {
  return (
    <Card>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
        <FontAwesomeIcon
          icon={faEllipsisVertical}
          className="text-text-secondary cursor-pointer"
        />
      </div>
      <div className="h-[300px]">{children}</div>
    </Card>
  );
}
