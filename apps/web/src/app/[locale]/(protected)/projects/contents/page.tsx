import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holobiont | Contents",
  description: "Manage and organize your project contents",
};

export default function ContentsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Contents</h1>
      <p className="text-muted-foreground">
        Manage and organize your project contents here.
      </p>
    </div>
  );
}
