import InviteAccept from "@/components/InviteAccept";

type Props = { params: Promise<{ token: string }> };

export default async function DmInvitePage({ params }: Props) {
  const { token } = await params;
  return <InviteAccept token={token} label="เชิญแชทส่วนตัว" />;
}
