import TabsContents from "./tabs-contents";

interface ProjectComponentProps {
  projectId?: string;
  userId?: string;
}

export default function ProjectComponent({
  projectId,
  userId,
}: ProjectComponentProps) {
  return (
    <div className="w-full">
      <TabsContents projectId={projectId} userId={userId} />
    </div>
  );
}
