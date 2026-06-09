import { v2 as cloudinary } from "cloudinary";

function getCloudName() {
  return process.env.CLOUDINARY_CLOUD_NAME ?? "";
}

export function isCloudinaryConfigured() {
  return Boolean(
    getCloudName() &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET,
  );
}

export function isAllowedCloudinaryUrl(url: string) {
  const cloudName = getCloudName();
  if (!cloudName) return false;
  return url.startsWith(`https://res.cloudinary.com/${cloudName}/`);
}

type UploadResult = {
  url: string;
  publicId: string;
  width: number;
  height: number;
};

async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  options: {
    folder: string;
    publicId: string;
    transformation?: Record<string, unknown>[];
  },
): Promise<UploadResult> {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }

  cloudinary.config({
    cloud_name: getCloudName(),
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  const result = await new Promise<{
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
  }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder,
        public_id: options.publicId,
        resource_type: "image",
        format: mimeType.split("/")[1] || undefined,
        overwrite: true,
        ...(options.transformation
          ? { transformation: options.transformation }
          : {}),
      },
      (error, uploadResult) => {
        if (error || !uploadResult) {
          reject(error ?? new Error("Upload failed"));
          return;
        }
        resolve(uploadResult as typeof uploadResult & { secure_url: string });
      },
    );
    stream.end(buffer);
  });

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  };
}

export async function uploadChatImage(
  buffer: Buffer,
  mimeType: string,
  userId: string,
) {
  return uploadImage(buffer, mimeType, {
    folder: "talkto/messages",
    publicId: `${userId}-${Date.now()}`,
  });
}

export async function uploadAvatar(
  buffer: Buffer,
  mimeType: string,
  userId: string,
) {
  return uploadImage(buffer, mimeType, {
    folder: "talkto/avatars",
    publicId: userId,
    transformation: [
      { width: 256, height: 256, crop: "fill", gravity: "face" },
    ],
  });
}
