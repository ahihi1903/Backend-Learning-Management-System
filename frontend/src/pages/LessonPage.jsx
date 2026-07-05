import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { ErrorState, LoadingState, Notice } from "../components/States.jsx";
import { CloseIcon, MenuIcon } from "../components/Icons.jsx";

export default function LessonPage() {
  const { courseId, lessonId } = useParams();
  const { user } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [progress, setProgress] = useState(null);
  const [comments, setComments] = useState([]);
  const [quizzes, setQuizzes] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submissions, setSubmissions] = useState({});
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("lesson");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [outlineOpen, setOutlineOpen] = useState(false);

  const currentIndex = lessons.findIndex((item) => item._id === lessonId);
  const currentProgress = useMemo(
    () => progress?.lessons?.find((item) => item.lesson?._id === lessonId),
    [progress, lessonId],
  );

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [lessonResult, lessonList, commentsResult, quizResult, assignmentResult] = await Promise.all([
        api(`/courses/${courseId}/lessons/${lessonId}`),
        api(`/courses/${courseId}/lessons`),
        api(`/lessons/${lessonId}/comments`),
        api(`/lessons/${lessonId}/quizzes`),
        api(`/lessons/${lessonId}/assignments`),
      ]);
      setLesson(lessonResult);
      setLessons(lessonList);
      setComments(commentsResult);
      setQuizzes(quizResult);
      setAssignments(assignmentResult);
      if (user.role === "student") {
        setProgress(await api(`/courses/${courseId}/progress/me`));
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
  }, [courseId, lessonId]);

  useEffect(() => {
    if (!outlineOpen) return undefined;
    function handleKeyDown(event) {
      if (event.key === "Escape") setOutlineOpen(false);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [outlineOpen]);

  async function updateProgress(completed) {
    try {
      const result = await api(`/courses/${courseId}/progress/lessons/${lessonId}`, {
        method: "PUT",
        body: { completed },
      });
      setProgress(result);
      setNotice(completed ? "Đã đánh dấu hoàn thành bài học." : "Đã mở lại bài học.");
    } catch (requestError) {
      setNotice(requestError.message);
    }
  }

  async function submitComment(event) {
    event.preventDefault();
    if (!comment.trim()) return;
    try {
      const result = await api(`/lessons/${lessonId}/comments`, {
        method: "POST",
        body: { content: comment },
      });
      setComments([result, ...comments]);
      setComment("");
    } catch (requestError) {
      setNotice(requestError.message);
    }
  }

  async function submitQuiz(quiz) {
    const quizAnswers = quiz.questions.map((_, index) => answers[`${quiz._id}-${index}`]);
    if (quizAnswers.some((answer) => answer === undefined)) {
      setNotice("Hãy trả lời tất cả câu hỏi trước khi nộp.");
      return;
    }
    try {
      const attempt = await api(`/lessons/${lessonId}/quizzes/${quiz._id}/submit`, {
        method: "POST",
        body: { answers: quizAnswers },
      });
      setNotice(`Kết quả: ${attempt.score}% — ${attempt.passed ? "Đạt" : "Chưa đạt"}`);
    } catch (requestError) {
      setNotice(requestError.message);
    }
  }

  async function submitAssignment(assignment) {
    const content = submissions[assignment._id]?.trim();
    if (!content) return setNotice("Hãy nhập nội dung bài làm.");
    try {
      await api(`/lessons/${lessonId}/assignments/${assignment._id}/submissions`, {
        method: "POST",
        body: { content },
      });
      setNotice("Bài làm đã được gửi tới giảng viên.");
    } catch (requestError) {
      setNotice(requestError.message);
    }
  }

  if (loading) return <LoadingState label="Đang chuẩn bị không gian học..." />;
  if (error) return <ErrorState error={error} onRetry={load} />;

  return (
    <section className={`learning-shell ${outlineOpen ? "outline-open" : ""}`}>
      <button className="lesson-outline-backdrop" type="button" aria-label="Đóng danh sách bài học" onClick={() => setOutlineOpen(false)} />
      <aside className="lesson-sidebar" aria-label="Danh sách bài học">
        <div className="lesson-sidebar-top">
          <Link to={`/courses/${courseId}`} className="back-link">← Tổng quan khóa học</Link>
          <button className="lesson-sidebar-close" type="button" aria-label="Đóng danh sách bài học" onClick={() => setOutlineOpen(false)}><CloseIcon size={18} /></button>
        </div>
        <div className="sidebar-progress">
          <span>Tiến độ</span><strong>{progress?.percentage || 0}%</strong>
          <div className="progress-track" role="progressbar" aria-label="Tiến độ khóa học" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progress?.percentage || 0}><i style={{ width: `${progress?.percentage || 0}%` }} /></div>
        </div>
        <div className="lesson-nav-list">
          {lessons.map((item, index) => {
            const done = progress?.lessons?.some((entry) => entry.lesson?._id === item._id && entry.completed);
            return (
              <Link key={item._id} className={item._id === lessonId ? "active" : ""} to={`/learn/${courseId}/lessons/${item._id}`} onClick={() => setOutlineOpen(false)}>
                <span className={done ? "done" : ""}>{done ? "✓" : index + 1}</span>
                <strong>{item.title}</strong>
              </Link>
            );
          })}
        </div>
      </aside>

      <div className="lesson-workspace">
        <button className="lesson-outline-trigger" type="button" aria-expanded={outlineOpen} onClick={() => setOutlineOpen(true)}><MenuIcon size={18} /> Nội dung khóa học</button>
        <div className="lesson-header">
          <div><span className="kicker">Bài {currentIndex + 1}</span><h1>{lesson.title}</h1></div>
          {user.role === "student" && (
            <button className={`button ${currentProgress?.completed ? "button-secondary" : ""}`} onClick={() => updateProgress(!currentProgress?.completed)}>
              {currentProgress?.completed ? "✓ Đã hoàn thành" : "Đánh dấu hoàn thành"}
            </button>
          )}
        </div>

        <div className="workspace-tabs" role="tablist" aria-label="Nội dung bài học">
          {[ ["lesson", "Bài học"], ["quiz", `Trắc nghiệm (${quizzes.length})`], ["assignment", `Bài tập (${assignments.length})`], ["discussion", `Thảo luận (${comments.length})`] ].map(([id, label]) => (
            <button key={id} type="button" role="tab" aria-selected={activeTab === id} aria-controls={`lesson-panel-${id}`} className={activeTab === id ? "active" : ""} onClick={() => setActiveTab(id)}>{label}</button>
          ))}
        </div>
        <Notice>{notice}</Notice>

        {activeTab === "lesson" && (
          <article className="lesson-article" id="lesson-panel-lesson" role="tabpanel">
            {lesson.videoUrl && <a className="video-card" href={lesson.videoUrl} target="_blank" rel="noreferrer"><span>▶</span><div><strong>Mở video bài học</strong><small>{lesson.videoUrl}</small></div></a>}
            <div className="lesson-copy">{lesson.content || "Nội dung bài học đang được giảng viên cập nhật."}</div>
            <div className="lesson-pager">
              {lessons[currentIndex - 1] ? <Link to={`/learn/${courseId}/lessons/${lessons[currentIndex - 1]._id}`}>← Bài trước</Link> : <span />}
              {lessons[currentIndex + 1] && <Link to={`/learn/${courseId}/lessons/${lessons[currentIndex + 1]._id}`}>Bài tiếp theo →</Link>}
            </div>
          </article>
        )}

        {activeTab === "quiz" && (
          <div className="activity-stack" id="lesson-panel-quiz" role="tabpanel">
            {!quizzes.length && <p className="muted">Bài học chưa có bài trắc nghiệm.</p>}
            {quizzes.map((quiz) => (
              <section className="activity-card" key={quiz._id}>
                <div className="activity-heading"><div><span className="kicker">Kiểm tra kiến thức</span><h2>{quiz.title}</h2></div><span className="score-pill">Đạt {quiz.passingScore}%</span></div>
                {quiz.questions.map((question, questionIndex) => (
                  <fieldset key={question._id || questionIndex}>
                    <legend>{questionIndex + 1}. {question.text}</legend>
                    {question.options.map((option, optionIndex) => (
                      <label className="option-row" key={optionIndex}>
                        <input type="radio" name={`${quiz._id}-${questionIndex}`} checked={answers[`${quiz._id}-${questionIndex}`] === optionIndex} onChange={() => setAnswers({ ...answers, [`${quiz._id}-${questionIndex}`]: optionIndex })} />
                        <span>{option}</span>
                      </label>
                    ))}
                  </fieldset>
                ))}
                {user.role === "student" && <button className="button" onClick={() => submitQuiz(quiz)}>Nộp bài trắc nghiệm</button>}
              </section>
            ))}
          </div>
        )}

        {activeTab === "assignment" && (
          <div className="activity-stack" id="lesson-panel-assignment" role="tabpanel">
            {!assignments.length && <p className="muted">Bài học chưa có bài tập.</p>}
            {assignments.map((assignment) => (
              <section className="activity-card" key={assignment._id}>
                <div className="activity-heading"><div><span className="kicker">Bài tập thực hành</span><h2>{assignment.title}</h2></div><span className="score-pill">{assignment.maxScore} điểm</span></div>
                <p>{assignment.instructions}</p>
                {assignment.dueDate && <small>Hạn nộp: {new Date(assignment.dueDate).toLocaleString("vi-VN")}</small>}
                {user.role === "student" && <><textarea rows="7" value={submissions[assignment._id] || ""} onChange={(event) => setSubmissions({ ...submissions, [assignment._id]: event.target.value })} placeholder="Viết nội dung bài làm..." /><button className="button" onClick={() => submitAssignment(assignment)}>Nộp bài</button></>}
              </section>
            ))}
          </div>
        )}

        {activeTab === "discussion" && (
          <div className="discussion-panel" id="lesson-panel-discussion" role="tabpanel">
            <form onSubmit={submitComment} className="comment-form"><textarea rows="3" value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Đặt câu hỏi hoặc chia sẻ điều bạn vừa hiểu..." /><button className="button">Gửi bình luận</button></form>
            <div className="comment-list">{comments.map((item) => <article key={item._id}><span className="avatar">{item.user?.username?.[0]?.toUpperCase()}</span><div><strong>{item.user?.username}</strong><small>{new Date(item.createdAt).toLocaleString("vi-VN")}</small><p>{item.content}</p></div></article>)}</div>
          </div>
        )}
      </div>
    </section>
  );
}
