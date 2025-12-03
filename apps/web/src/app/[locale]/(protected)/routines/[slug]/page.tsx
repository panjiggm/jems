import { preloadQuery } from "convex/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { ContentDetailPage } from "./_components/content-detail-page";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function RoutineDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Preload routine data - tries slug first, then falls back to ID
  const preloadedRoutineData = await preloadQuery(
    api.queries.contentRoutines.getBySlugOrId,
    { identifier: slug },
  );

  return (
    <ContentDetailPage
      contentType="routine"
      preloadedData={preloadedRoutineData}
    />
  );
}
