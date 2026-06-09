export type MessageDto = {
  id: string;
  content: string;
  imageUrl: string | null;
  inviteToken: string | null;
  createdAt: string;
  user: { id: string; name: string; avatarUrl: string | null };
};

export function mapMessage(message: {
  id: string;
  content: string;
  imageUrl: string | null;
  inviteToken?: string | null;
  createdAt: Date;
  user: { id: string; name: string; avatarUrl?: string | null };
}): MessageDto {
  return {
    id: message.id,
    content: message.content,
    imageUrl: message.imageUrl,
    inviteToken: message.inviteToken ?? null,
    createdAt: message.createdAt.toISOString(),
    user: {
      id: message.user.id,
      name: message.user.name,
      avatarUrl: message.user.avatarUrl ?? null,
    },
  };
}

export function formatLastMessagePreview(
  content: string,
  imageUrl: string | null,
  inviteToken?: string | null,
) {
  if (inviteToken) return "📩 คำเชิญเข้ากลุ่ม";
  if (imageUrl) {
    const text = content.trim();
    return text ? `📷 ${text}` : "📷 รูปภาพ";
  }
  return content;
}
