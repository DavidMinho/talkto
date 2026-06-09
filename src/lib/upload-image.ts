import type { ApiResponse } from "@/lib/api-client";

type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

async function uploadFile(url: string, file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(url, {
    method: "POST",
    body: formData,
  });

  const json = (await res.json()) as ApiResponse<UploadResult>;
  if (!json.success) {
    throw new Error(json.error?.message ?? "Upload failed");
  }
  return json.data;
}

export async function uploadChatImageFile(file: File): Promise<UploadResult> {
  return uploadFile("/api/uploads/image", file);
}

export async function uploadAvatarFile(file: File): Promise<UploadResult> {
  return uploadFile("/api/uploads/avatar", file);
}
