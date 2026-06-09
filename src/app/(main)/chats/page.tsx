import AppLayout from "@/components/AppLayout";
import ChatEmptyState from "@/components/chat/ChatEmptyState";

export default function ChatsPage() {
  return (
    <AppLayout>
      <ChatEmptyState />
    </AppLayout>
  );
}
