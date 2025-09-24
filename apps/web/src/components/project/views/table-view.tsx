import { EditableTable } from "@/components/table";
import { Id } from "@packages/backend/convex/_generated/dataModel";

interface TableViewProps {
  projectId?: Id<"projects">;
  userId?: string;
}

export default function TableView({ projectId, userId }: TableViewProps) {
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
      <EditableTable projectId={projectId} userId={userId} />
    </div>
  );
}
