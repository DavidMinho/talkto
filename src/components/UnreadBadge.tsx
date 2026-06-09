import Badge from "@mui/material/Badge";

export default function UnreadBadge({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Badge
      color="secondary"
      badgeContent={count}
      invisible={count <= 0}
      max={99}
    >
      {children}
    </Badge>
  );
}
