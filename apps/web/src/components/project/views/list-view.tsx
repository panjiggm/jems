interface ListViewProps {
  projectId?: string;
  userId?: string;
}

export default function ListView({ projectId, userId }: ListViewProps) {
  return (
    <div className="p-4">
      <h3 className="text-lg font-semibold mb-2">List View</h3>
      <p className="text-muted-foreground">
        Browse your items in a simple list format for quick scanning and
        selection.
      </p>
      {/* TODO: Implement list view with projectId and userId data */}
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
