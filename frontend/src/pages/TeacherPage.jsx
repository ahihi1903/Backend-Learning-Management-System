import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { EmptyState, LoadingState, Notice } from "../components/States.jsx";
import { useToast } from "../context/ToastContext.jsx";

const emptyCourse = { title: "", description: "", category: "", price: 0 };
const emptyLesson = { title: "", content: "", videoUrl: "", order: 0 };

export default function TeacherPage() {
  const { pushToast } = useToast();
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [courseForm, setCourseForm] = useState(emptyCourse);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [quizForm, setQuizForm] = useState({ title: "", question: "", optionA: "", optionB: "", correctOption: 0, passingScore: 60 });
  const [assignmentForm, setAssignmentForm] = useState({ title: "", instructions: "", maxScore: 100 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadCourses() {
    setLoading(true);
    try {
      const [courseResult, categoryResult] = await Promise.all([
        api("/courses/my/courses"),
        api("/categories"),
      ]);
      setCourses(courseResult);
      setCategories(categoryResult);
      if (!selectedCourse && courseResult[0]) setSelectedCourse(courseResult[0]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadCourseWorkspace(course) {
    if (!course) return;
    try {
      const [lessonResult, enrollmentResult] = await Promise.all([
        api(`/courses/${course._id}/lessons`),
        api(`/courses/${course._id}/enrollments`),
      ]);
      setLessons(lessonResult);
      setEnrollments(enrollmentResult);
      setSelectedLesson(lessonResult[0] || null);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  useEffect(() => {
    loadCourses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadCourseWorkspace(selectedCourse);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCourse?._id]);

  async function createCourse(event) {
    event.preventDefault();
    setError("");
    try {
      const created = await api("/courses", {
        method: "POST",
        body: { ...courseForm, price: Number(courseForm.price) },
      });
      setCourseForm(emptyCourse);
      pushToast("Bản nháp khóa học đã được tạo.");
      await loadCourses();
      setSelectedCourse(created);
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function togglePublish() {
    try {
      const updated = await api(`/courses/${selectedCourse._id}`, {
        method: "PUT",
        body: { isPublished: !selectedCourse.isPublished },
      });
      setSelectedCourse(updated);
      setCourses(courses.map((course) => (course._id === updated._id ? updated : course)));
      pushToast(updated.isPublished ? "Khóa học đã được xuất bản." : "Khóa học đã trở về bản nháp.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function createLesson(event) {
    event.preventDefault();
    try {
      const created = await api(`/courses/${selectedCourse._id}/lessons`, {
        method: "POST",
        body: {
          ...lessonForm,
          order: Number(lessonForm.order),
          videoUrl: lessonForm.videoUrl || undefined,
        },
      });
      setLessons([...lessons, created].sort((a, b) => a.order - b.order));
      setSelectedLesson(created);
      setLessonForm({ ...emptyLesson, order: lessons.length + 1 });
      pushToast("Bài học mới đã được thêm.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function createQuiz(event) {
    event.preventDefault();
    try {
      await api(`/lessons/${selectedLesson._id}/quizzes`, {
        method: "POST",
        body: {
          title: quizForm.title,
          passingScore: Number(quizForm.passingScore),
          isPublished: true,
          questions: [{
            text: quizForm.question,
            options: [quizForm.optionA, quizForm.optionB],
            correctOption: Number(quizForm.correctOption),
            points: 1,
          }],
        },
      });
      setQuizForm({ title: "", question: "", optionA: "", optionB: "", correctOption: 0, passingScore: 60 });
      pushToast("Bài trắc nghiệm đã được xuất bản cho học viên.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function createAssignment(event) {
    event.preventDefault();
    try {
      await api(`/lessons/${selectedLesson._id}/assignments`, {
        method: "POST",
        body: { ...assignmentForm, maxScore: Number(assignmentForm.maxScore), isPublished: true },
      });
      setAssignmentForm({ title: "", instructions: "", maxScore: 100 });
      pushToast("Bài tập đã được xuất bản.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) return <LoadingState label="Đang mở không gian giảng dạy..." />;

  return (
    <section className="dashboard-page section-wrap">
      <div className="dashboard-heading">
        <div><span className="eyebrow">Không gian giảng dạy</span><h1>Thiết kế trải nghiệm học tập.</h1><p>Tạo nội dung, xuất bản khóa học và theo dõi lớp học ở một nơi.</p></div>
        {selectedCourse && <Link className="button button-ghost" to={`/courses/${selectedCourse._id}`}>Xem trang khóa học ↗</Link>}
      </div>
      <Notice type="error">{error}</Notice>

      <div className="studio-layout">
        <aside className="studio-sidebar">
          <div className="panel-heading"><h2>Khóa học</h2><span>{courses.length}</span></div>
          <div className="studio-course-list">
            {courses.map((course) => <button type="button" key={course._id} aria-pressed={selectedCourse?._id === course._id} className={selectedCourse?._id === course._id ? "active" : ""} onClick={() => setSelectedCourse(course)}><span className={course.isPublished ? "dot live" : "dot"} /><div><strong>{course.title}</strong><small>{course.isPublished ? "Đã xuất bản" : "Bản nháp"}</small></div></button>)}
          </div>
          <details className="create-drawer" open={!courses.length}>
            <summary>＋ Tạo khóa học mới</summary>
            <form onSubmit={createCourse} className="form-stack compact-form">
              <input placeholder="Tên khóa học" value={courseForm.title} onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })} required />
              <textarea rows="4" placeholder="Mô tả tối thiểu 10 ký tự" value={courseForm.description} onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })} required />
              <select value={courseForm.category} onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })} required><option value="">Chọn danh mục</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select>
              <input type="number" min="0" placeholder="Giá" value={courseForm.price} onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })} />
              <button className="button">Tạo bản nháp</button>
            </form>
          </details>
        </aside>

        <div className="studio-main">
          {!selectedCourse ? <EmptyState title="Chưa có khóa học" description="Tạo khóa học đầu tiên để bắt đầu xây lộ trình." /> : <>
            <div className="studio-course-header"><div><span className="kicker">{selectedCourse.category?.name || "Không gian khóa học"}</span><h2>{selectedCourse.title}</h2><p>{selectedCourse.description}</p></div><button type="button" className={`button ${selectedCourse.isPublished ? "button-secondary" : ""}`} onClick={togglePublish}>{selectedCourse.isPublished ? "Đưa về bản nháp" : "Xuất bản khóa học"}</button></div>
            <div className="studio-stats"><div><strong>{lessons.length}</strong><span>Bài học</span></div><div><strong>{enrollments.length}</strong><span>Học viên</span></div><div><strong>{selectedCourse.isPublished ? "Đang mở" : "Bản nháp"}</strong><span>Trạng thái</span></div></div>

            <div className="studio-columns">
              <section className="studio-panel">
                <div className="panel-heading"><h3>Lộ trình bài học</h3><span>{lessons.length}</span></div>
                <div className="studio-lesson-list">{lessons.map((lesson, index) => <button type="button" key={lesson._id} aria-pressed={selectedLesson?._id === lesson._id} className={selectedLesson?._id === lesson._id ? "active" : ""} onClick={() => setSelectedLesson(lesson)}><span>{index + 1}</span><div><strong>{lesson.title}</strong><small>Thứ tự {lesson.order}</small></div></button>)}</div>
                <details className="create-drawer"><summary>＋ Thêm bài học</summary><form onSubmit={createLesson} className="form-stack compact-form"><input placeholder="Tên bài học" value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} required /><textarea rows="5" placeholder="Nội dung bài học" value={lessonForm.content} onChange={(e) => setLessonForm({ ...lessonForm, content: e.target.value })} /><input type="url" placeholder="Đường dẫn video (không bắt buộc)" value={lessonForm.videoUrl} onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })} /><input type="number" min="0" value={lessonForm.order} onChange={(e) => setLessonForm({ ...lessonForm, order: e.target.value })} /><button className="button">Thêm bài học</button></form></details>
              </section>

              <section className="studio-panel activity-builder">
                <div className="panel-heading"><h3>Hoạt động học tập</h3><span>{selectedLesson ? "Sẵn sàng" : "Chọn bài học"}</span></div>
                {selectedLesson ? <div className="builder-tabs">
                  <details className="create-drawer"><summary>＋ Tạo bài trắc nghiệm cho “{selectedLesson.title}”</summary><form onSubmit={createQuiz} className="form-stack compact-form"><input placeholder="Tên bài trắc nghiệm" value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} required /><textarea rows="3" placeholder="Câu hỏi" value={quizForm.question} onChange={(e) => setQuizForm({ ...quizForm, question: e.target.value })} required /><input placeholder="Lựa chọn A" value={quizForm.optionA} onChange={(e) => setQuizForm({ ...quizForm, optionA: e.target.value })} required /><input placeholder="Lựa chọn B" value={quizForm.optionB} onChange={(e) => setQuizForm({ ...quizForm, optionB: e.target.value })} required /><label>Đáp án đúng<select value={quizForm.correctOption} onChange={(e) => setQuizForm({ ...quizForm, correctOption: e.target.value })}><option value="0">A</option><option value="1">B</option></select></label><button className="button">Xuất bản trắc nghiệm</button></form></details>
                  <details className="create-drawer"><summary>＋ Tạo bài tập</summary><form onSubmit={createAssignment} className="form-stack compact-form"><input placeholder="Tên bài tập" value={assignmentForm.title} onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })} required /><textarea rows="5" placeholder="Yêu cầu bài làm" value={assignmentForm.instructions} onChange={(e) => setAssignmentForm({ ...assignmentForm, instructions: e.target.value })} required /><input type="number" min="1" value={assignmentForm.maxScore} onChange={(e) => setAssignmentForm({ ...assignmentForm, maxScore: e.target.value })} /><button className="button">Xuất bản bài tập</button></form></details>
                </div> : <p className="muted">Chọn một bài học để thêm trắc nghiệm hoặc bài tập.</p>}
              </section>
            </div>

            <section className="studio-panel roster-panel"><div className="panel-heading"><h3>Danh sách học viên</h3><span>{enrollments.length}</span></div>{enrollments.length ? <div className="data-list">{enrollments.map((item) => <div key={item._id}><span className="avatar">{item.user?.username?.[0]?.toUpperCase()}</span><div><strong>{item.user?.username}</strong><small>{item.user?.email}</small></div><span className={`status-pill ${item.status}`}>{item.status}</span></div>)}</div> : <p className="muted">Chưa có học viên đăng ký.</p>}</section>
          </>}
        </div>
      </div>
    </section>
  );
}
