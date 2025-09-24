import { KanbanBoard } from "@/components/kanban";

interface KanbanViewProps {
  projectId?: string;
  userId?: string;
}

export default function KanbanView({ projectId, userId }: KanbanViewProps) {
  if (projectId && userId) {
    return <KanbanBoard projectId={projectId} userId={userId} />;
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
