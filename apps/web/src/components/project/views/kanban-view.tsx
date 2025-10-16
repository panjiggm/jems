import { KanbanCampaignBoard } from "@/components/kanban/campaign/kanban-board";
import { KanbanRoutineBoard } from "@/components/kanban/routine/kanban-board";
import { FilterState } from "../search-filter-content";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface KanbanViewProps {
  projectId?: Id<"projects">;
  userId?: string;
  filters: FilterState;
  contentType: "campaign" | "routine";
}

export default function KanbanView({
  projectId,
  userId,
  filters,
  contentType,
}: KanbanViewProps) {
  if (projectId && userId) {
    return (
      <>
        {contentType === "campaign" ? (
          <KanbanCampaignBoard
            projectId={projectId}
            userId={userId}
            filters={filters}
          />
        ) : (
          <KanbanRoutineBoard
            projectId={projectId}
            userId={userId}
            filters={filters}
          />
        )}
      </>
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
