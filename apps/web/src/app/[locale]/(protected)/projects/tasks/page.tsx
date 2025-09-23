import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holobiont | Tasks",
  description: "Manage and track your project tasks",
};

export default function TasksPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      <p className="text-muted-foreground">
        Manage and track your project tasks here.
      </p>
    </div>
  );
}
