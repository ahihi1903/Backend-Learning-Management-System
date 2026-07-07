import {
  createVideoUploadSignature,
  optimizedVideoUrl,
} from "../services/mediaService.js";

export async function videoSignature(req, res) {
  res.json(createVideoUploadSignature(req.user.id));
}

export async function optimizeVideoUrl(req, res) {
  res.json({ playbackUrl: optimizedVideoUrl(req.body.secureUrl) });
}
