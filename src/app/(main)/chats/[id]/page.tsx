import AppLayout from "@/components/AppLayout";
import ChatWindow from "@/components/ChatWindow";

type Props = { params: Promise<{ id: string }> };

export default async function ChatDetailPage({ params }: Props) {
  const { id } = await params;

  return (
    <AppLayout activeConversationId={id}>
      <ChatWindow conversationId={id} />
    </AppLayout>
  );
}
