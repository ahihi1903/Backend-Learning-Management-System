import { useEffect, useRef, useState } from "react";
import { api } from "../../api/client.js";

export default function VideoPlayer({
  lesson,
  courseId,
  canTrack,
  initialPosition = 0,
}) {
  const videoRef = useRef(null);
  const lastSavedRef = useRef(initialPosition);
  const [failed, setFailed] = useState(false);
  const source = lesson.video?.playbackUrl || lesson.videoUrl;

  useEffect(() => {
    lastSavedRef.current = initialPosition;
  }, [initialPosition, lesson._id]);

  async function persistPosition(seconds) {
    if (!canTrack || Math.abs(seconds - lastSavedRef.current) < 10) return;
    lastSavedRef.current = seconds;
    try {
      await api(`/courses/${courseId}/progress/lessons/${lesson._id}`, {
        method: "PUT",
        body: { lastPositionSeconds: Math.floor(seconds) },
      });
    } catch {
      // Không chặn việc học nếu cập nhật vị trí xem tạm thời thất bại.
    }
  }

  if (!source) return null;

  return (
    <div className="mb-8 overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-950 shadow-xl shadow-zinc-950/10 dark:border-zinc-800">
      {!failed ? (
        <video
          ref={videoRef}
          className="aspect-video w-full bg-black object-contain"
          controls
          controlsList="nodownload"
          playsInline
          preload="metadata"
          src={source}
          aria-label={`Video bài học ${lesson.title}`}
          onLoadedMetadata={(event) => {
            if (
              initialPosition > 0 &&
              initialPosition < event.currentTarget.duration - 5
            ) {
              event.currentTarget.currentTime = initialPosition;
            }
          }}
          onTimeUpdate={(event) => {
            const seconds = event.currentTarget.currentTime;
            if (seconds - lastSavedRef.current >= 15) persistPosition(seconds);
          }}
          onPause={(event) => persistPosition(event.currentTarget.currentTime)}
          onEnded={(event) => persistPosition(event.currentTarget.duration)}
          onError={() => setFailed(true)}
        >
          Trình duyệt của bạn không hỗ trợ phát video HTML5.
        </video>
      ) : (
        <div className="grid aspect-video place-items-center px-6 text-center text-white">
          <div>
            <p className="font-semibold">Không thể phát video trực tiếp.</p>
            <a
              className="mt-4 inline-flex rounded-xl bg-white px-4 py-2 text-sm font-semibold text-zinc-950"
              href={source}
              target="_blank"
              rel="noreferrer"
            >
              Mở video trong tab mới
            </a>
          </div>
        </div>
      )}
      <div className="flex items-center justify-between gap-4 border-t border-white/10 px-4 py-3 text-xs text-zinc-400">
        <span>Video tối ưu chất lượng tự động theo thiết bị và đường truyền.</span>
        {lesson.video?.duration && (
          <span className="shrink-0">
            {Math.ceil(lesson.video.duration / 60)} phút
          </span>
        )}
      </div>
    </div>
  );
}
