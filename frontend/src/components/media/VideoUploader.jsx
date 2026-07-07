import { useRef, useState } from "react";
import { api } from "../../api/client.js";
import { Button } from "../ui/Controls.jsx";

const MAX_VIDEO_BYTES = 2 * 1024 * 1024 * 1024;

function uploadToCloudinary(file, signature, onProgress) {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("api_key", signature.apiKey);
    form.append("timestamp", String(signature.timestamp));
    form.append("signature", signature.signature);
    form.append("folder", signature.folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", signature.uploadUrl);
    xhr.upload.addEventListener("progress", (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    });
    xhr.addEventListener("load", () => {
      let data;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(new Error("Cloudinary trả về dữ liệu không hợp lệ"));
        return;
      }
      if (xhr.status < 200 || xhr.status >= 300) {
        reject(new Error(data?.error?.message || "Upload video thất bại"));
        return;
      }
      resolve(data);
    });
    xhr.addEventListener("error", () =>
      reject(new Error("Mất kết nối trong khi upload video")),
    );
    xhr.send(form);
  });
}

export default function VideoUploader({ value, onChange, tone = "default" }) {
  const inputRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(file) {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      setError("Vui lòng chọn đúng định dạng video.");
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError("Video không được vượt quá 2 GB.");
      return;
    }

    setError("");
    setUploading(true);
    setProgress(1);
    try {
      const signature = await api("/media/video-signature");
      const uploaded = await uploadToCloudinary(file, signature, setProgress);
      const optimized = await api("/media/video-optimize", {
        method: "POST",
        body: { secureUrl: uploaded.secure_url },
      });
      onChange({
        videoUrl: optimized.playbackUrl,
        video: {
          publicId: uploaded.public_id,
          playbackUrl: optimized.playbackUrl,
          originalUrl: uploaded.secure_url,
          duration: uploaded.duration,
          bytes: uploaded.bytes,
          format: uploaded.format,
          width: uploaded.width,
          height: uploaded.height,
        },
      });
      setProgress(100);
    } catch (uploadError) {
      setError(uploadError.message);
      setProgress(0);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-900/70">
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="video/*"
        onChange={(event) => handleFile(event.target.files?.[0])}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <strong className="block text-sm text-zinc-900 dark:text-white">
            {value?.video?.publicId ? "Video đã sẵn sàng" : "Upload video bài học"}
          </strong>
          <p className="mt-1 text-xs leading-5 text-zinc-500 dark:text-zinc-400">
            Upload trực tiếp lên Cloudinary, không lưu file lớn trong MongoDB hoặc
            server Node.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          tone={tone}
          loading={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? `Đang tải ${progress}%` : "Chọn video"}
        </Button>
      </div>
      {(uploading || progress === 100) && (
        <div
          className="mt-4 h-2 overflow-hidden rounded-full bg-zinc-200 dark:bg-zinc-700"
          role="progressbar"
          aria-valuemin="0"
          aria-valuemax="100"
          aria-valuenow={progress}
        >
          <span
            className="block h-full rounded-full bg-emerald-500 transition-[width]"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {value?.video?.publicId && (
        <button
          type="button"
          className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700"
          onClick={() => {
            onChange({ videoUrl: "", video: null });
            setProgress(0);
          }}
        >
          Bỏ video đã chọn
        </button>
      )}
      {error && <p className="mt-3 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
}
