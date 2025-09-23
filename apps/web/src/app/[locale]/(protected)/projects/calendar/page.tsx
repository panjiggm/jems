import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holobiont | Calendar",
  description: "View your project calendar and schedule",
};

export default function CalendarPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Calendar</h1>
      <p className="text-muted-foreground">
        View your project calendar and schedule here.
      </p>
    </div>
  );
}
