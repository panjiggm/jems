import { KanbanBoard } from "@/components/kanban";
import { FilterState } from "../search-filter-content";

interface KanbanViewProps {
  projectId?: string;
  userId?: string;
  filters: FilterState;
}

export default function KanbanView({
  projectId,
  userId,
  filters,
}: KanbanViewProps) {
  if (projectId && userId) {
    return (
      <KanbanBoard projectId={projectId} userId={userId} filters={filters} />
    );
  }

  return (
    <div className="">
      <h3 className="text-lg font-semibold mb-2">Kanban View</h3>
      <p className="text-muted-foreground">
        Drag and drop your content across different columns to manage your
        workflow.
      </p>
    </div>
  );
}
