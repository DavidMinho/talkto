import Avatar from "@mui/material/Avatar";

export default function UserAvatar({
  name,
  avatarUrl,
  size = 36,
  sx,
}: {
  name?: string | null;
  avatarUrl?: string | null;
  size?: number;
  sx?: object;
}) {
  const initial = name?.[0]?.toUpperCase() ?? "?";

  return (
    <Avatar
      src={avatarUrl ?? undefined}
      alt={name ?? "User"}
      sx={{
        width: size,
        height: size,
        bgcolor: "primary.main",
        fontWeight: 700,
        ...sx,
      }}
    >
      {initial}
    </Avatar>
  );
}
