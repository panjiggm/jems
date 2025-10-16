"use client";

import { Id } from "@packages/backend/convex/_generated/dataModel";
import { ContentRoutineStatus } from "@/types/status";
import { EditableRoutineStatusBadge } from "../contents/editable-routine-status-badge";

interface EditableRoutineStatusCellProps {
  value: ContentRoutineStatus;
  routineId: Id<"contentRoutines">;
}

export function EditableRoutineStatusCell({
  value,
  routineId,
}: EditableRoutineStatusCellProps) {
  return (
    <div className="min-w-[140px]">
      <EditableRoutineStatusBadge value={value} routineId={routineId} />
    </div>
  );
}
