import ChatsComponent from "@/components/chats";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Holobiont | Chats",
  description: "Chats with AI at Holobiont",
};

export default function ChatsPage() {
  return <ChatsComponent />;
}
