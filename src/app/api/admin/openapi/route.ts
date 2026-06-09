import { requireAdmin } from "@/lib/auth";
import { handleApiError } from "@/lib/api/response";
import { generateOpenApiDocument } from "@/lib/api/openapi";

export async function GET() {
  try {
    await requireAdmin();
    const doc = generateOpenApiDocument();
    return Response.json(doc);
  } catch (error) {
    return handleApiError(error);
  }
}
