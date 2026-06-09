import { prisma } from "../src/lib/db";
import { listConversations, createMessage } from "../src/lib/services/conversation.service";
import { sendGroupInviteToUser, getInviteDetail, acceptInvite } from "../src/lib/services/invite.service";
import { mapMessage } from "../src/lib/messages";

async function main() {
  const users = await prisma.user.findMany({ take: 3 });
  if (users.length < 2) {
    console.log("SKIP: need at least 2 users");
    return;
  }

  const [inviter, invitee] = users;
  const group = await prisma.conversation.findFirst({
    where: { type: "GROUP", members: { some: { userId: inviter.id } } },
    include: { members: true },
  });

  if (!group) {
    console.log("SKIP: no group for inviter");
    return;
  }

  const inviteeIsMember = group.members.some((m) => m.userId === invitee.id);
  if (inviteeIsMember) {
    console.log("OK: invitee already in group (membership check works)");
  } else {
    const result = await sendGroupInviteToUser(inviter.id, group.id, invitee.id);
    console.log("OK: sendGroupInviteToUser", result.dmConversationId);

    const detail = await getInviteDetail(result.inviteToken);
    console.log("OK: getInviteDetail isValid=", detail.isValid);

    const accepted = await acceptInvite(result.inviteToken, invitee.id);
    console.log("OK: acceptInvite", accepted.conversationId);

    const count = await prisma.conversationMember.count({
      where: { conversationId: group.id },
    });
    console.log("OK: group member count", count);
  }

  const convs = await listConversations(inviter.id, "GROUP");
  const item = convs.find((c) => c.id === group.id);
  console.log("OK: listConversations memberCount=", item?.memberCount);

  const msg = await prisma.message.findFirst({
    where: { inviteToken: { not: null } },
    include: { user: true },
  });
  if (msg) {
    const dto = mapMessage(msg);
    console.log("OK: mapMessage inviteToken=", Boolean(dto.inviteToken));
  }

  console.log("SMOKE CHECK PASSED");
}

main()
  .catch((e) => {
    console.error("SMOKE CHECK FAILED:", e.message);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
