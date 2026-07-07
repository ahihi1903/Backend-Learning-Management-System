import crypto from "crypto";
import createError from "../middlewares/createError.js";

function requireCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  if (!cloudName || !apiKey || !apiSecret) {
    throw createError(503, "Cloudinary chưa được cấu hình trên backend");
  }
  return { cloudName, apiKey, apiSecret };
}

export function createVideoUploadSignature(userId) {
  const { cloudName, apiKey, apiSecret } = requireCloudinaryConfig();
  const timestamp = Math.floor(Date.now() / 1000);
  const folder = `northstar/videos/${userId}`;
  const params = { folder, timestamp };
  const payload = Object.entries(params)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(`${payload}${apiSecret}`)
    .digest("hex");

  return {
    cloudName,
    apiKey,
    signature,
    timestamp,
    folder,
    uploadUrl: `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
  };
}

export function optimizedVideoUrl(secureUrl) {
  if (!secureUrl?.includes("/video/upload/")) return secureUrl;
  return secureUrl.replace(
    "/video/upload/",
    "/video/upload/q_auto:good,f_auto/",
  );
}
