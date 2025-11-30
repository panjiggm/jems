import { preloadQuery } from "convex/nextjs";
import { api } from "@packages/backend/convex/_generated/api";
import { DriveClient } from "./_components";

interface DrivePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ search?: string }>;
}

export default async function DrivePage({
  params,
  searchParams,
}: DrivePageProps) {
  const { locale } = await params;
  const { search } = await searchParams;

  // Preload queries on server
  const preloadedMediaGrouped = await preloadQuery(
    api.queries.media.getAllMediaGrouped,
    {
      search: search || undefined,
    },
  );

  return (
    <DriveClient
      locale={locale}
      preloadedMediaGrouped={preloadedMediaGrouped}
    />
  );
}
