import {
  extendZodWithOpenApi,
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from "@asteasolutions/zod-to-openapi";
import { z } from "zod";

extendZodWithOpenApi(z);
import { RegisterRequestSchema, RegisterResponseSchema } from "./schemas/auth";
import {
  ConversationDetailSchema,
  ConversationListSchema,
  CreateDmRequestSchema,
  CreateGroupRequestSchema,
  MarkReadResponseSchema,
  MessagesResponseSchema,
  SendMessageRequestSchema,
} from "./schemas/conversation";
import {
  AcceptInviteResponseSchema,
  CreateInviteRequestSchema,
  CreateInviteResponseSchema,
  InviteDetailSchema,
} from "./schemas/invite";
import { UserSummarySchema } from "./schemas/common";

const registry = new OpenAPIRegistry();

const cookieAuth = registry.registerComponent("securitySchemes", "cookieAuth", {
  type: "apiKey",
  in: "cookie",
  name: "next-auth.session-token",
  description: "NextAuth session cookie (set after login)",
});

const ErrorSchema = registry.register(
  "ErrorResponse",
  z.object({
    success: z.literal(false),
    error: z.object({
      code: z.string(),
      message: z.string(),
      details: z.array(z.unknown()),
    }),
  }),
);

function successSchema<T extends z.ZodType>(schema: T) {
  return z.object({ success: z.literal(true), data: schema });
}

registry.registerPath({
  method: "get",
  path: "/api/health",
  tags: ["System"],
  summary: "Health check",
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(
            z.object({
              status: z.string(),
              db: z.string(),
              uptime: z.number(),
              timestamp: z.string(),
            }),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: { "application/json": { schema: RegisterRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: successSchema(RegisterResponseSchema),
        },
      },
    },
    400: { description: "Validation error", content: { "application/json": { schema: ErrorSchema } } },
    409: { description: "Conflict", content: { "application/json": { schema: ErrorSchema } } },
    429: { description: "Rate limited", content: { "application/json": { schema: ErrorSchema } } },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/users/search",
  tags: ["Users"],
  summary: "Search users",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    query: z.object({
      q: z.string(),
      limit: z.coerce.number().optional(),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(z.array(UserSummarySchema)),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/conversations",
  tags: ["Conversations"],
  summary: "List conversations",
  security: [{ [cookieAuth.name]: [] }],
  request: {
    query: z.object({ type: z.enum(["GROUP", "DM"]).optional() }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(ConversationListSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/conversations",
  tags: ["Conversations"],
  summary: "Create group conversation",
  request: {
    body: {
      content: { "application/json": { schema: CreateGroupRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: successSchema(
            z.object({
              id: z.string(),
              type: z.literal("GROUP"),
              name: z.string(),
            }),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/dm",
  tags: ["Conversations"],
  summary: "Find or create DM",
  request: {
    body: {
      content: { "application/json": { schema: CreateDmRequestSchema } },
    },
  },
  responses: {
    200: {
      description: "Existing DM",
      content: {
        "application/json": {
          schema: successSchema(
            z.object({
              id: z.string(),
              type: z.literal("DM"),
              peer: UserSummarySchema,
            }),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/conversations/{id}",
  tags: ["Conversations"],
  summary: "Get conversation detail",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(ConversationDetailSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/conversations/{id}/read",
  tags: ["Conversations"],
  summary: "Mark conversation as read",
  request: { params: z.object({ id: z.string() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(MarkReadResponseSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/conversations/{id}/messages",
  tags: ["Messages"],
  summary: "List messages",
  request: {
    params: z.object({ id: z.string() }),
    query: z.object({
      cursor: z.string().optional(),
      limit: z.coerce.number().optional(),
    }),
  },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(MessagesResponseSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/conversations/{id}/messages",
  tags: ["Messages"],
  summary: "Send message",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: SendMessageRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: successSchema(
            z.object({
              id: z.string(),
              content: z.string(),
              createdAt: z.string(),
              user: z.object({ id: z.string(), name: z.string() }),
            }),
          ),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/conversations/{id}/invites",
  tags: ["Invites"],
  summary: "Create invite",
  request: {
    params: z.object({ id: z.string() }),
    body: {
      content: { "application/json": { schema: CreateInviteRequestSchema } },
    },
  },
  responses: {
    201: {
      description: "Created",
      content: {
        "application/json": {
          schema: successSchema(CreateInviteResponseSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "get",
  path: "/api/invites/{token}",
  tags: ["Invites"],
  summary: "Get invite details",
  request: { params: z.object({ token: z.string() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(InviteDetailSchema),
        },
      },
    },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/invites/{token}/accept",
  tags: ["Invites"],
  summary: "Accept invite",
  request: { params: z.object({ token: z.string() }) },
  responses: {
    200: {
      description: "OK",
      content: {
        "application/json": {
          schema: successSchema(AcceptInviteResponseSchema),
        },
      },
    },
  },
});

export function generateOpenApiDocument() {
  const generator = new OpenApiGeneratorV3(registry.definitions);
  return generator.generateDocument({
    openapi: "3.1.0",
    info: {
      title: "Talkto API",
      version: "1.0.0",
      description:
        "REST API for Talkto chat application. Socket.io events are documented separately.",
    },
    servers: [{ url: process.env.NEXTAUTH_URL ?? "http://localhost:3010" }],
    tags: [
      { name: "System" },
      { name: "Auth" },
      { name: "Users" },
      { name: "Conversations" },
      { name: "Messages" },
      { name: "Invites" },
    ],
  });
}
