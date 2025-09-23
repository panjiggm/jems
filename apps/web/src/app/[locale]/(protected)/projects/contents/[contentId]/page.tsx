import { Metadata } from "next";

interface ContentPageProps {
  params: {
    contentId: string;
  };
}

export const metadata: Metadata = {
  title: "Holobiont | Content",
  description: "View and edit content",
};

export default function ContentPage({ params }: ContentPageProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Content {params.contentId}</h1>
      <p className="text-muted-foreground">
        View and edit content details here.
      </p>
    </div>
  );
}
