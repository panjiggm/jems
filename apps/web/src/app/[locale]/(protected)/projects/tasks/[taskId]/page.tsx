import { Metadata } from "next";

interface TaskPageProps {
  params: {
    taskId: string;
  };
}

export const metadata: Metadata = {
  title: "Holobiont | Task",
  description: "View and edit task",
};

export default function TaskPage({ params }: TaskPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Task {params.taskId}</h1>
      <p className="text-muted-foreground">View and edit task details here.</p>
    </div>
  );
}
