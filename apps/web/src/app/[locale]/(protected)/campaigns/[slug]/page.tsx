import { ContentDetailPage } from "./_components/content-detail-page";

type PageProps = {
  params: Promise<{ slug: string; locale: string }>;
};

export default async function CampaignDetailPage({ params }: PageProps) {
  const { slug } = await params;

  return <ContentDetailPage contentType="campaign" identifier={slug} />;
}
