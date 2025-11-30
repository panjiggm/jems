import { preloadQuery } from "convex/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { ContentDetailPage } from "./_components/content-detail-page";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Preload campaign data on server
  const preloadedCampaignData = await preloadQuery(
    api.queries.contentCampaigns.getBySlug,
    { slug },
  );

  return (
    <ContentDetailPage
      contentType="campaign"
      preloadedData={preloadedCampaignData}
    />
  );
}
