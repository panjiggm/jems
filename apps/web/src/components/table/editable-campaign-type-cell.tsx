"use client";

import { Id } from "@packages/backend/convex/_generated/dataModel";
import { ContentCampaignType } from "@/types/status";
import { EditableCampaignTypeBadge } from "../contents/editable-campaign-type-badge";

interface EditableCampaignTypeCellProps {
  value: ContentCampaignType;
  campaignId: Id<"contentCampaigns">;
}

export function EditableCampaignTypeCell({
  value,
  campaignId,
}: EditableCampaignTypeCellProps) {
  return (
    <div className="min-w-[100px]">
      <EditableCampaignTypeBadge value={value} campaignId={campaignId} />
    </div>
  );
}
