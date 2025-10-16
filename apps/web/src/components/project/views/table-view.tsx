import { EditableCampaignTable } from "@/components/table/campaign/editable-table";
import { EditableRoutineTable } from "@/components/table/routine/editable-table";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../search-filter-content";

interface TableViewProps {
  projectId?: Id<"projects">;
  userId?: string;
  filters: FilterState;
  contentType: "campaign" | "routine";
}

export default function TableView({
  projectId,
  userId,
  filters,
  contentType,
}: TableViewProps) {
  if (!projectId || !userId) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">Table View</h3>
        <p className="text-muted-foreground">
          Please select a project to view contents in table format.
        </p>
      </div>
    );
  }

  return (
    <div>
      {contentType === "campaign" ? (
        <EditableCampaignTable
          projectId={projectId}
          userId={userId}
          filters={filters}
        />
      ) : (
        <EditableRoutineTable
          projectId={projectId}
          userId={userId}
          filters={filters}
        />
      )}
    </div>
  );
}
