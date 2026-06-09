"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ChatInviteCard from "@/components/ChatInviteCard";
import { CHAT_IMAGE_RADIUS } from "@/theme/chat/surfaces";

export default function ChatMessageContent({
  content,
  imageUrl,
  inviteToken,
  isOwn,
}: {
  content: string;
  imageUrl?: string | null;
  inviteToken?: string | null;
  isOwn: boolean;
}) {
  const text = content.trim();

  if (inviteToken) {
    return (
      <Box>
        {text && (
          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap", mb: 1 }}>
            {text}
          </Typography>
        )}
        <ChatInviteCard inviteToken={inviteToken} isOwn={isOwn} />
      </Box>
    );
  }

  return (
    <Box>
      {imageUrl && (
        <Box
          component="a"
          href={imageUrl}
          target="_blank"
          rel="noopener noreferrer"
          sx={{ display: "block", mb: text ? 1 : 0 }}
        >
          <Box
            component="img"
            src={imageUrl}
            alt="รูปภาพที่ส่ง"
            sx={{
              display: "block",
              maxWidth: "100%",
              maxHeight: 280,
              borderRadius: `${CHAT_IMAGE_RADIUS}px`,
              objectFit: "cover",
            }}
          />
        </Box>
      )}
      {text && (
        <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
          {text}
        </Typography>
      )}
    </Box>
  );
}
