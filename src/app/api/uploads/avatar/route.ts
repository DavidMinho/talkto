import { requireUserId } from "@/lib/auth";
import { ApiError, ApiErrorCodes } from "@/lib/api/errors";
import { getClientIp, rateLimit } from "@/lib/api/rate-limit";
import { handleApiError, apiSuccess } from "@/lib/api/response";
import { isCloudinaryConfigured, uploadAvatar } from "@/lib/cloudinary";

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export async function POST(request: Request) {
  try {
    const userId = await requireUserId();

    if (!isCloudinaryConfigured()) {
      throw new ApiError(
        ApiErrorCodes.INTERNAL_ERROR,
        "Image upload is not configured",
        500,
      );
    }

    const ip = getClientIp(request);
    const limit = rateLimit(`avatar:${userId}:${ip}`, 5, 15 * 60 * 1000);
    if (!limit.allowed) {
      throw new ApiError(
        ApiErrorCodes.RATE_LIMITED,
        "Too many uploads",
        429,
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "Image file is required",
        400,
      );
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "Use JPEG, PNG, or WebP",
        400,
      );
    }

    if (file.size > MAX_BYTES) {
      throw new ApiError(
        ApiErrorCodes.VALIDATION_ERROR,
        "Avatar must be 2MB or smaller",
        400,
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadAvatar(buffer, file.type, userId);

    return apiSuccess(uploaded, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
