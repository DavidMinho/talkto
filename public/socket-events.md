# Talkto Socket.io Events

Base URL: same origin as the web app (e.g. `http://localhost:3000`)

Authentication uses the NextAuth session cookie automatically when connecting from the browser.

## Client → Server

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:join` | `{ conversationId: string }` | Join a conversation room |
| `conversation:leave` | `{ conversationId: string }` | Leave a conversation room |
| `message:send` | `{ conversationId: string, content: string }` | Send a message |
| `typing:start` | `{ conversationId: string }` | User started typing |
| `typing:stop` | `{ conversationId: string }` | User stopped typing |
| `presence:subscribe` | `{ userIds: string[] }` | Subscribe to presence updates |

## Server → Client

| Event | Payload | Description |
|-------|---------|-------------|
| `conversation:joined` | `{ conversationId: string }` | Join confirmed |
| `message:new` | `{ conversationId, message: MessageDto }` | New message push to each member |
| `message:sent` | `{ conversationId, message: MessageDto }` | Send acknowledgement |
| `conversation:updated` | `{ conversationId, lastMessage, senderId }` | Sidebar preview update |
| `typing:update` | `{ conversationId, userId, userName, isTyping }` | Typing indicator |
| `presence:update` | `{ userId, status: "online" \| "offline" }` | User online status changed |
| `presence:sync` | `{ onlineUserIds: string[] }` | Initial online users |
| `error` | `{ message: string }` | Error from server |

## MessageDto

```json
{
  "id": "string",
  "content": "string",
  "imageUrl": "string | null",
  "createdAt": "ISO-8601",
  "user": { "id": "string", "name": "string" }
}
```

## Reconnection

The client enables auto-reconnect (`reconnectionAttempts: 10`). After reconnect, re-emit `conversation:join` for the active conversation and fetch missed messages via REST.
