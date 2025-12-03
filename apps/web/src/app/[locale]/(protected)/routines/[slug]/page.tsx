import { ContentDetailPage } from "./_components/content-detail-page";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function RoutineDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return <ContentDetailPage contentType="routine" identifier={slug} />;
}
