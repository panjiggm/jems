"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@packages/backend/convex/_generated/api";
import { ContentDetailPage } from "@/components/contents/content-detail-page";

export default function RoutineDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  // Query routine by slug
  const routineData = useQuery(api.queries.contentRoutines.getBySlug, {
    slug,
  });

  return <ContentDetailPage contentType="routine" data={routineData} />;
}
