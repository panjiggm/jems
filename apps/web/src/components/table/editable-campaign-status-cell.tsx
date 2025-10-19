"use client";

import { Id } from "@packages/backend/convex/_generated/dataModel";
import { ContentCampaignStatus } from "@/types/status";
import { EditableCampaignStatusBadge } from "../contents/editable-campaign-status-badge";

interface EditableCampaignStatusCellProps {
  value: ContentCampaignStatus;
  campaignId: Id<"contentCampaigns">;
}

export function EditableCampaignStatusCell({
  value,
  campaignId,
}: EditableCampaignStatusCellProps) {
  return (
    <div>
      <EditableCampaignStatusBadge value={value} campaignId={campaignId} />
    </div>
  );
}
