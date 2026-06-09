import InviteAccept from "@/components/InviteAccept";

type Props = { params: Promise<{ token: string }> };

export default async function GroupInvitePage({ params }: Props) {
  const { token } = await params;
  return <InviteAccept token={token} label="เชิญเข้าห้องกลุ่ม" />;
}
