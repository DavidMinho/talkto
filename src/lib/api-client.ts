export type ApiResponse<T> =
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string } };

function serverUnavailableMessage(status: number) {
  if (status === 503) {
    return "เซิร์ฟเวอร์ไม่พร้อมชั่วคราว (503) — รอสักครู่แล้วลองใหม่ หรือ redeploy บน Hostinger";
  }
  return `เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (${status})`;
}

async function parseApiResponse<T>(res: Response): Promise<ApiResponse<T>> {
  const contentType = res.headers.get("content-type") ?? "";
  const text = await res.text();

  if (
    !contentType.includes("application/json") ||
    text.trimStart().startsWith("<!")
  ) {
    throw new Error(serverUnavailableMessage(res.status));
  }

  try {
    return JSON.parse(text) as ApiResponse<T>;
  } catch {
    throw new Error(serverUnavailableMessage(res.status));
  }
}

export async function apiFetch<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  const json = await parseApiResponse<T>(res);
  if (!json.success) {
    throw new Error(json.error?.message ?? "Request failed");
  }
  return json.data;
}
