"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { ContentDetailPage } from "@/components/contents/content-detail-page";

export default function CampaignDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Query campaign by slug
  const campaignData = useQuery(api.queries.contentCampaigns.getBySlug, {
    slug,
  });

  return <ContentDetailPage contentType="campaign" data={campaignData} />;
}
