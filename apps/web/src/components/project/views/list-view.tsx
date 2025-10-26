import CampaignListView from "@/components/list/campaign/list-view";
import RoutineListView from "@/components/list/routine/list-view";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../search-filter-content";
import { useTranslations } from "@/hooks/use-translations";

interface ListViewProps {
  projectId?: Id<"projects">;
  userId?: string;
  filters: FilterState;
  contentType: "campaign" | "routine";
}

export default function ListView({
  projectId,
  userId,
  filters,
  contentType,
}: ListViewProps) {
  const { t } = useTranslations();

  if (!projectId || !userId) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">
          {t("project.viewMessages.list.title")}
        </h3>
        <p className="text-muted-foreground">
          {t("project.viewMessages.list.description")}
        </p>
      </div>
    );
  }

  return (
    <>
      {contentType === "campaign" ? (
        <CampaignListView
          projectId={projectId}
          userId={userId}
          filters={filters}
        />
      ) : (
        <RoutineListView
          projectId={projectId}
          userId={userId}
          filters={filters}
        />
      )}
    </>
  );
}
