type PresenceMap = Map<string, Set<string>>;

const userSockets: PresenceMap = new Map();

export function markOnline(userId: string, socketId: string) {
  const sockets = userSockets.get(userId) ?? new Set();
  sockets.add(socketId);
  userSockets.set(userId, sockets);
}

export function markOffline(userId: string, socketId: string) {
  const sockets = userSockets.get(userId);
  if (!sockets) return false;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    userSockets.delete(userId);
    return true;
  }
  return false;
}

export function isOnline(userId: string) {
  return userSockets.has(userId);
}

export function getOnlineUserIds(userIds: string[]) {
  return userIds.filter((id) => isOnline(id));
}
