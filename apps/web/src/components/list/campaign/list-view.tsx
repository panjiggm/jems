"use client";

import { useQuery } from "convex-helpers/react/cache";
import { api } from "@packages/backend/convex/_generated/api";
import { Id } from "@packages/backend/convex/_generated/dataModel";
import { FilterState } from "@/app/[locale]/(protected)/projects/[year]/[projectId]/_components/search-filter-content";
import { CampaignContentCard } from "./content-card";
import { ContentCampaignStatus, Platform } from "@/types/status";
import { useTranslations } from "@/hooks/use-translations";
import { Package, Wrench, Send, DollarSign, CheckCircle } from "lucide-react";

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

  if (campaigns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-muted-foreground text-sm">
          {t("list.noContentInStatus").replace(
            "{type}",
            t("list.campaignPlural"),
          )}
        </p>
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

  // Define status order and config
  const statusOrder: ContentCampaignStatus[] = [
    "product_obtained",
    "production",
    "published",
    "payment",
    "done",
  ];

  const statusLabels: Record<ContentCampaignStatus, string> = {
    product_obtained: "Product Obtained",
    production: "Production",
    published: "Published",
    payment: "Payment",
    done: "Done",
  };

  const statusIcons: Record<ContentCampaignStatus, any> = {
    product_obtained: Package,
    production: Wrench,
    published: Send,
    payment: DollarSign,
    done: CheckCircle,
  };

  const statusColors: Record<ContentCampaignStatus, string> = {
    product_obtained: "text-blue-800",
    production: "text-orange-800",
    published: "text-green-800",
    payment: "text-yellow-800",
    done: "text-gray-800",
  };

  return (
    <div className="w-full space-y-6">
      {statusOrder.map((status) => {
        const items = campaignsByStatus[status] || [];
        if (items.length === 0) return null;

        const StatusIcon = statusIcons[status];
        const statusColor = statusColors[status];

        return (
          <div key={status} className="space-y-2">
            {/* Status Header */}
            <div className="flex items-center gap-2 px-2">
              <StatusIcon className={`h-3 w-3 ${statusColor}`} />
              <h3
                className={`text-xs font-medium tracking-wide ${statusColor}`}
              >
                {statusLabels[status]}
              </h3>
              <span className="text-xs text-muted-foreground">
                {items.length}
              </span>
            </div>

            {/* Items List */}
            <div className="border border-border rounded-lg overflow-hidden bg-card">
              {items.map((campaign, index) => (
                <div key={campaign._id}>
                  <CampaignContentCard content={campaign} />
                  {index < items.length - 1 && (
                    <div className="border-b border-border" />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
