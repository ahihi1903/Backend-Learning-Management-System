import express from "express";
import { z } from "zod";
import auth from "../middlewares/auth.js";
import role from "../middlewares/role.js";
import validate from "../middlewares/validate.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import * as mediaController from "../controllers/mediaController.js";

const router = express.Router();

router.use(auth, role("teacher", "admin"));
router.get("/video-signature", asyncHandler(mediaController.videoSignature));
router.post(
  "/video-optimize",
  validate(z.object({ secureUrl: z.string().url() })),
  asyncHandler(mediaController.optimizeVideoUrl),
);

export default router;
