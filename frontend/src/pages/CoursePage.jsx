import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorState, LoadingState } from "../components/States.jsx";
import { useToast } from "../context/ToastContext.jsx";

function money(value) {
  return value
    ? new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value)
    : "Miễn phí";
}

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { pushToast } = useToast();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const canManage = useMemo(
    () => user?.role === "admin" || user?.id === course?.teacher?._id,
    [user, course],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const courseResult = await api(`/courses/${courseId}`);
      setCourse(courseResult);

      let enrolled = false;
      if (user?.role === "student") {
        try {
          const enrollmentResult = await api(`/courses/${courseId}/enrollments/me`);
          setEnrollment(enrollmentResult);
          enrolled = true;
        } catch (requestError) {
          if (requestError.status !== 404) throw requestError;
        }
      }

      const owner = user?.role === "admin" || user?.id === courseResult.teacher?._id;
      if (owner || enrolled) {
        const lessonResult = await api(`/courses/${courseId}/lessons`);
        setLessons(lessonResult);
        if (enrolled) {
          setProgress(await api(`/courses/${courseId}/progress/me`));
        }
      }
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId, user?.id]);

  async function enroll() {
    if (!user) return navigate("/login", { state: { from: `/courses/${courseId}` } });
    setActionLoading(true);
    try {
      await api(`/courses/${courseId}/enrollments`, { method: "POST" });
      pushToast("Đăng ký thành công. Không gian học tập đã sẵn sàng!");
      await load();
    } catch (requestError) {
      pushToast(requestError.message, { type: "error" });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) return <LoadingState label="Đang mở khóa học..." />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <>
      <section className="course-hero">
        <div className="section-wrap course-hero-grid">
          <div>
            <div className="breadcrumbs"><Link to="/">Khóa học</Link><span>/</span><span>{course.category?.name}</span></div>
            <span className={`status-pill ${course.isPublished ? "published" : "draft"}`}>
              {course.isPublished ? "Đang mở đăng ký" : "Xem trước bản nháp"}
            </span>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <div className="teacher-line">
              <span className="avatar large">{course.teacher?.username?.[0]?.toUpperCase()}</span>
              <div><small>Được hướng dẫn bởi</small><strong>{course.teacher?.username}</strong></div>
            </div>
          </div>
          <aside className="enroll-card" aria-label="Thông tin đăng ký khóa học">
            <div className="course-preview"><span>{course.title.slice(0, 2).toUpperCase()}</span></div>
            <strong className="course-price">{money(course.price)}</strong>
            <ul>
              <li><span>✓</span>{lessons.length || "Nhiều"} bài học theo lộ trình</li>
              <li><span>✓</span>Trắc nghiệm và bài tập thực hành</li>
              <li><span>✓</span>Theo dõi tiến độ cá nhân</li>
            </ul>
            {user?.role === "student" && !enrollment && (
              <button type="button" className="button button-wide" onClick={enroll} disabled={actionLoading || !course.isPublished}>
                {actionLoading ? "Đang đăng ký..." : "Đăng ký khóa học"}
              </button>
            )}
            {!user && <button type="button" className="button button-wide" onClick={enroll}>Đăng nhập để học</button>}
            {enrollment && lessons[0] && (
              <Link className="button button-wide" to={`/learn/${courseId}/lessons/${lessons[0]._id}`}>
                {progress?.percentage ? "Tiếp tục học" : "Bắt đầu bài đầu tiên"}
              </Link>
            )}
            {canManage && <Link className="button button-wide button-secondary" to="/teacher">Mở không gian giảng dạy</Link>}
          </aside>
        </div>
      </section>

      <section className="section-wrap course-content-grid">
        <div>
          <span className="kicker">Lộ trình học tập</span>
          <h2>Nội dung khóa học</h2>
          {progress && (
            <div className="progress-summary">
              <div><strong>{progress.percentage}%</strong><span>Đã hoàn thành</span></div>
              <div className="progress-track" role="progressbar" aria-label="Tiến độ khóa học" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress.percentage}><i style={{ width: `${progress.percentage}%` }} /></div>
              <small>{progress.completedLessons}/{progress.totalLessons} bài học</small>
            </div>
          )}
          <div className="curriculum-list">
            {lessons.length ? lessons.map((lesson, index) => (
              <Link key={lesson._id} to={`/learn/${courseId}/lessons/${lesson._id}`} className="lesson-row">
                <span className="lesson-index">{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{lesson.title}</strong><small>{lesson.videoUrl ? "Video + tài liệu" : "Bài đọc"}</small></div>
                <span>→</span>
              </Link>
            )) : (
              <div className="locked-curriculum">
                <span>⌁</span>
                <p>{enrollment || canManage ? "Khóa học chưa có bài học." : "Đăng ký để mở nội dung bài học."}</p>
              </div>
            )}
          </div>
        </div>
        <aside className="outcome-card">
          <span className="kicker">Sau khóa học</span>
          <h3>Bạn sẽ làm được gì?</h3>
          <ul>
            <li>Hiểu các khái niệm nền tảng theo hệ thống.</li>
            <li>Áp dụng qua bài tập và tình huống thực tế.</li>
            <li>Tự đánh giá năng lực bằng trắc nghiệm và tiến độ.</li>
          </ul>
        </aside>
      </section>
    </>
  );
}
