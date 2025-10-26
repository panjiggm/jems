"use client";

import { useQuery } from "convex-helpers/react/cache";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "../../project/search-filter-content";
import { StatusSection } from "../status-section";
import { CampaignContentCard } from "./content-card";
import { ContentCampaignStatus, Platform } from "@/types/status";
import { useTranslations } from "@/hooks/use-translations";

// Campaign content type
interface CampaignContent {
  _id: Id<"contentCampaigns">;
  _creationTime: number;
  userId: string;
  projectId: Id<"projects">;
  title: string;
  slug?: string;
  sow?: string;
  platform: Platform;
  type: "barter" | "paid";
  status: ContentCampaignStatus;
  statusHistory: Array<{
    status: string;
    timestamp: number;
    publishedAt?: string;
    note?: string;
  }>;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

interface CampaignListViewProps {
  projectId?: Id<"projects">;
  userId?: string;
  filters: FilterState;
}

export default function CampaignListView({
  projectId,
  userId,
  filters,
}: CampaignListViewProps) {
  const { t } = useTranslations();

  // Fetch campaigns
  const campaigns = useQuery(
    api.queries.contentCampaigns.getByProject,
    projectId
      ? {
          projectId,
          search: filters.search || undefined,
          status: filters.status.length > 0 ? filters.status : undefined,
          types:
            filters.campaignTypes.length > 0
              ? filters.campaignTypes
              : undefined,
          platform: filters.platform.length > 0 ? filters.platform : undefined,
        }
      : "skip",
  );

  if (!projectId || !userId) {
    return (
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{t("list.campaignList")}</h3>
        <p className="text-muted-foreground">
          {t("list.selectProject")} {t("list.campaignPlural")}{" "}
          {t("list.inFormat")} {t("list.listFormat")}.
        </p>
      </div>
    );
  }

  if (!campaigns) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-muted-foreground">{t("list.loading")}</div>
      </div>
    );
  }

  // Group campaigns by status
  const campaignsByStatus = campaigns.reduce(
    (acc, campaign) => {
      if (!acc[campaign.status]) {
        acc[campaign.status] = [];
      }
      acc[campaign.status].push(campaign);
      return acc;
    },
    {} as Record<string, CampaignContent[]>,
  );

  // Campaign status config
  const campaignStatusConfig = [
    {
      key: "product_obtained",
      title: t("kanban.status.productObtained"),
      color: "bg-blue-200",
      count: campaignsByStatus.product_obtained?.length || 0,
    },
    {
      key: "production",
      title: t("kanban.status.production"),
      color: "bg-orange-200",
      count: campaignsByStatus.production?.length || 0,
    },
    {
      key: "published",
      title: t("kanban.status.published"),
      color: "bg-green-200",
      count: campaignsByStatus.published?.length || 0,
    },
    {
      key: "payment",
      title: t("kanban.status.payment"),
      color: "bg-yellow-200",
      count: campaignsByStatus.payment?.length || 0,
    },
    {
      key: "done",
      title: t("kanban.status.done"),
      color: "bg-gray-200",
      count: campaignsByStatus.done?.length || 0,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {campaignStatusConfig.map((status) => (
          <StatusSection
            key={status.key}
            title={status.title}
            color={status.color}
            count={status.count}
            contents={campaignsByStatus[status.key] || []}
            projectId={projectId}
            userId={userId}
            contentType="campaign"
            renderContent={(content) => (
              <CampaignContentCard
                key={content._id}
                content={content}
                projectId={projectId}
                userId={userId}
              />
            )}
          />
        ))}
      </div>
    </div>
  );
}
