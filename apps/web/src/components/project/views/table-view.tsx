interface TableViewProps {
  projectId?: string;
  userId?: string;
}

export default function TableView({ projectId, userId }: TableViewProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">Table View</h3>
      <p className="text-muted-foreground">
        View your data in a structured table format with sorting and filtering
        options.
      </p>
      {/* TODO: Implement table view with projectId and userId data */}
      {projectId && userId && (
        <div className="mt-4 p-2 bg-muted rounded">
          <p className="text-sm">
            Project ID: {projectId} | User ID: {userId}
          </p>
        </div>
      )}
    </div>
  );
}
