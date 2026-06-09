import { RegisterRequestSchema } from "@/lib/api/schemas/auth";
import { ApiError, ApiErrorCodes } from "@/lib/api/errors";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { apiSuccess, handleApiError } from "@/lib/api/response";
import { registerUser } from "@/lib/services/user.service";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const limit = rateLimit(`register:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      throw new ApiError(
        ApiErrorCodes.RATE_LIMITED,
        "Too many registration attempts",
        429,
      );
    }

    const body = RegisterRequestSchema.parse(await request.json());
    const user = await registerUser(body.name, body.email, body.password);
    return apiSuccess(user, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
