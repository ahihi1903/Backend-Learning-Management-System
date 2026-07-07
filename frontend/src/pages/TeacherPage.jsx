import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { Notice } from "../components/States.jsx";
import { Button } from "../components/ui/Controls.jsx";
import { useToast } from "../context/ToastContext.jsx";
import VideoUploader from "../components/media/VideoUploader.jsx";
import {
  Avatar,
  Badge,
  Card,
  DashboardLoading,
  DashboardShell,
  EmptyPanel,
  FieldLabel,
  SectionHeader,
  SoftLinkButton,
  StatCard,
  inputClass,
  selectClass,
} from "../components/dashboard/DashboardPrimitives.jsx";

const emptyCourse = { title: "", description: "", category: "", price: 0 };
const emptyLesson = {
  title: "",
  content: "",
  videoUrl: "",
  video: null,
  order: 0,
};

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
  const [quizForm, setQuizForm] = useState({
    title: "",
    question: "",
    optionA: "",
    optionB: "",
    correctOption: 0,
    passingScore: 60,
  });
  const [assignmentForm, setAssignmentForm] = useState({
    title: "",
    instructions: "",
    maxScore: 100,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pendingAction, setPendingAction] = useState("");

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
    setPendingAction("course");
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
    } finally {
      setPendingAction("");
    }
  }

  async function togglePublish() {
    setError("");
    setPendingAction("publish");
    try {
      const updated = await api(`/courses/${selectedCourse._id}`, {
        method: "PUT",
        body: { isPublished: !selectedCourse.isPublished },
      });
      setSelectedCourse(updated);
      setCourses(
        courses.map((course) => (course._id === updated._id ? updated : course)),
      );
      pushToast(
        updated.isPublished
          ? "Khóa học đã được xuất bản."
          : "Khóa học đã trở về bản nháp.",
      );
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingAction("");
    }
  }

  async function createLesson(event) {
    event.preventDefault();
    setError("");
    setPendingAction("lesson");
    try {
      const created = await api(`/courses/${selectedCourse._id}/lessons`, {
        method: "POST",
        body: {
          ...lessonForm,
          order: Number(lessonForm.order),
          videoUrl:
            lessonForm.video?.playbackUrl || lessonForm.videoUrl || undefined,
          video: lessonForm.video || undefined,
        },
      });
      setLessons([...lessons, created].sort((a, b) => a.order - b.order));
      setSelectedLesson(created);
      setLessonForm({ ...emptyLesson, order: lessons.length + 1 });
      pushToast("Bài học mới đã được thêm.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingAction("");
    }
  }

  async function createQuiz(event) {
    event.preventDefault();
    setError("");
    setPendingAction("quiz");
    try {
      await api(`/lessons/${selectedLesson._id}/quizzes`, {
        method: "POST",
        body: {
          title: quizForm.title,
          passingScore: Number(quizForm.passingScore),
          isPublished: true,
          questions: [
            {
              text: quizForm.question,
              options: [quizForm.optionA, quizForm.optionB],
              correctOption: Number(quizForm.correctOption),
              points: 1,
            },
          ],
        },
      });
      setQuizForm({
        title: "",
        question: "",
        optionA: "",
        optionB: "",
        correctOption: 0,
        passingScore: 60,
      });
      pushToast("Bài trắc nghiệm đã được xuất bản cho học viên.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingAction("");
    }
  }

  async function createAssignment(event) {
    event.preventDefault();
    setError("");
    setPendingAction("assignment");
    try {
      await api(`/lessons/${selectedLesson._id}/assignments`, {
        method: "POST",
        body: {
          ...assignmentForm,
          maxScore: Number(assignmentForm.maxScore),
          isPublished: true,
        },
      });
      setAssignmentForm({ title: "", instructions: "", maxScore: 100 });
      pushToast("Bài tập đã được xuất bản.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setPendingAction("");
    }
  }

  if (loading) {
    return <DashboardLoading label="Đang mở không gian giảng dạy..." />;
  }

  return (
    <DashboardShell
      eyebrow="Không gian giảng dạy"
      title="Thiết kế trải nghiệm học tập."
      description="Tạo nội dung, xuất bản khóa học và theo dõi lớp học ở một nơi cân bằng, rõ ràng."
    >
      <Notice type="error" tone="dark">{error}</Notice>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <Card className="p-5">
          <SectionHeader title="Khóa học" meta={`${courses.length} khóa`} />
          <div className="grid gap-2">
            {courses.map((course) => (
              <button
                type="button"
                key={course._id}
                aria-pressed={selectedCourse?._id === course._id}
                className={`flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition ${
                  selectedCourse?._id === course._id
                    ? "border-emerald-400/40 bg-emerald-400/10"
                    : "border-white/10 bg-white/[.025] hover:border-white/15 hover:bg-white/[.05]"
                }`}
                onClick={() => setSelectedCourse(course)}
              >
                <span
                  className={`size-2.5 rounded-full ${
                    course.isPublished ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                  aria-hidden="true"
                />
                <span className="min-w-0">
                  <strong className="block truncate text-sm text-white">
                    {course.title}
                  </strong>
                  <small className="mt-1 block text-xs text-zinc-500">
                    {course.isPublished ? "Đã xuất bản" : "Bản nháp"}
                  </small>
                </span>
              </button>
            ))}
          </div>

          <details className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-4" open={!courses.length}>
            <summary className="cursor-pointer text-sm font-bold text-zinc-100">
              ＋ Tạo khóa học mới
            </summary>
            <form onSubmit={createCourse} className="mt-4 grid gap-3">
              <FieldLabel label="Tên khóa học">
                <input
                  className={inputClass}
                  placeholder="Ví dụ: React thực chiến"
                  value={courseForm.title}
                  onChange={(event) =>
                    setCourseForm({ ...courseForm, title: event.target.value })
                  }
                  required
                />
              </FieldLabel>
              <FieldLabel
                label="Mô tả"
                hint="Nêu rõ kết quả học viên đạt được sau khóa học."
              >
                <textarea
                  className={`${inputClass} min-h-28 py-3`}
                  placeholder="Mô tả tối thiểu 10 ký tự"
                  value={courseForm.description}
                  onChange={(event) =>
                    setCourseForm({
                      ...courseForm,
                      description: event.target.value,
                    })
                  }
                  required
                />
              </FieldLabel>
              <FieldLabel label="Danh mục">
                <select
                  className={selectClass}
                  value={courseForm.category}
                  onChange={(event) =>
                    setCourseForm({
                      ...courseForm,
                      category: event.target.value,
                    })
                  }
                  required
                >
                  <option value="">Chọn danh mục</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </FieldLabel>
              <FieldLabel label="Giá khóa học">
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="0"
                  value={courseForm.price}
                  onChange={(event) =>
                    setCourseForm({ ...courseForm, price: event.target.value })
                  }
                />
              </FieldLabel>
              <Button
                type="submit"
                tone="dark"
                loading={pendingAction === "course"}
              >
                {pendingAction === "course" ? "Đang tạo..." : "Tạo bản nháp"}
              </Button>
            </form>
          </details>
        </Card>

        <div className="grid min-w-0 gap-6">
          {!selectedCourse ? (
            <EmptyPanel
              title="Chưa có khóa học"
              description="Tạo khóa học đầu tiên để bắt đầu xây lộ trình."
            />
          ) : (
            <>
              <Card className="overflow-hidden p-6">
                <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-br from-emerald-400/20 via-blue-400/10 to-transparent" />
                <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone="info">
                        {selectedCourse.category?.name || "Khóa học"}
                      </Badge>
                      <Badge tone={selectedCourse.isPublished ? "success" : "warning"}>
                        {selectedCourse.isPublished ? "Đang mở" : "Bản nháp"}
                      </Badge>
                    </div>
                    <h2 className="mt-4 text-2xl font-black tracking-[-.04em] text-white sm:text-3xl">
                      {selectedCourse.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                      {selectedCourse.description}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3">
                    <SoftLinkButton to={`/courses/${selectedCourse._id}`}>
                      Xem trang khóa học ↗
                    </SoftLinkButton>
                    <Button
                      type="button"
                      tone="dark"
                      variant={selectedCourse.isPublished ? "secondary" : "primary"}
                      loading={pendingAction === "publish"}
                      onClick={togglePublish}
                    >
                      {pendingAction === "publish"
                        ? "Đang cập nhật..."
                        : selectedCourse.isPublished
                          ? "Đưa về bản nháp"
                          : "Xuất bản khóa học"}
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="grid gap-4 md:grid-cols-3">
                <StatCard
                  label="Bài học"
                  value={lessons.length}
                  helper="Trong lộ trình"
                  icon="▤"
                />
                <StatCard
                  label="Học viên"
                  value={enrollments.length}
                  helper="Đã đăng ký"
                  icon="◎"
                  tone="blue"
                />
                <StatCard
                  label="Trạng thái"
                  value={selectedCourse.isPublished ? "Live" : "Draft"}
                  helper={selectedCourse.isPublished ? "Đang nhận học viên" : "Chưa công khai"}
                  icon={selectedCourse.isPublished ? "●" : "○"}
                  tone={selectedCourse.isPublished ? "emerald" : "amber"}
                />
              </div>

              <div className="grid gap-6 2xl:grid-cols-[1fr_1fr]">
                <Card className="p-6">
                  <SectionHeader
                    eyebrow="Curriculum"
                    title="Lộ trình bài học"
                    description="Sắp xếp nội dung theo thứ tự học viên sẽ trải nghiệm."
                    meta={`${lessons.length} bài`}
                  />

                  {lessons.length ? (
                    <div className="grid gap-2">
                      {lessons.map((lesson, index) => (
                        <button
                          type="button"
                          key={lesson._id}
                          aria-pressed={selectedLesson?._id === lesson._id}
                          className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${
                            selectedLesson?._id === lesson._id
                              ? "border-emerald-400/40 bg-emerald-400/10"
                              : "border-white/10 bg-white/[.025] hover:border-white/15 hover:bg-white/[.05]"
                          }`}
                          onClick={() => setSelectedLesson(lesson)}
                        >
                          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/[.06] text-sm font-black text-zinc-300">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="min-w-0">
                            <strong className="block truncate text-sm text-white">
                              {lesson.title}
                            </strong>
                            <small className="mt-1 block text-xs text-zinc-500">
                              Thứ tự {lesson.order}
                              {lesson.videoUrl ? " · Có video" : " · Bài đọc"}
                            </small>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <EmptyPanel
                      title="Chưa có bài học"
                      description="Thêm bài học đầu tiên để học viên có thể bắt đầu."
                    />
                  )}

                  <details className="mt-5 rounded-2xl border border-white/10 bg-white/[.03] p-4">
                    <summary className="cursor-pointer text-sm font-bold text-zinc-100">
                      ＋ Thêm bài học
                    </summary>
                    <form onSubmit={createLesson} className="mt-4 grid gap-3">
                      <FieldLabel label="Tên bài học">
                        <input
                          className={inputClass}
                          placeholder="Ví dụ: Component và props"
                          value={lessonForm.title}
                          onChange={(event) =>
                            setLessonForm({
                              ...lessonForm,
                              title: event.target.value,
                            })
                          }
                          required
                        />
                      </FieldLabel>
                      <FieldLabel label="Nội dung bài học">
                        <textarea
                          className={`${inputClass} min-h-32 py-3`}
                          placeholder="Mô tả nội dung, tài liệu và hướng dẫn..."
                          value={lessonForm.content}
                          onChange={(event) =>
                            setLessonForm({
                              ...lessonForm,
                              content: event.target.value,
                            })
                          }
                        />
                      </FieldLabel>
                      <VideoUploader
                        value={lessonForm}
                        tone="dark"
                        onChange={(videoData) =>
                          setLessonForm((current) => ({ ...current, ...videoData }))
                        }
                      />
                      <FieldLabel label="URL video thay thế">
                        <input
                          className={inputClass}
                          type="url"
                          placeholder="Hoặc dán đường dẫn video có sẵn"
                          value={lessonForm.videoUrl}
                          onChange={(event) =>
                            setLessonForm({
                              ...lessonForm,
                              videoUrl: event.target.value,
                              video: null,
                            })
                          }
                        />
                      </FieldLabel>
                      <FieldLabel label="Thứ tự bài học">
                        <input
                          className={inputClass}
                          type="number"
                          min="0"
                          value={lessonForm.order}
                          onChange={(event) =>
                            setLessonForm({
                              ...lessonForm,
                              order: event.target.value,
                            })
                          }
                        />
                      </FieldLabel>
                      <Button
                        type="submit"
                        tone="dark"
                        loading={pendingAction === "lesson"}
                      >
                        {pendingAction === "lesson"
                          ? "Đang thêm..."
                          : "Thêm bài học"}
                      </Button>
                    </form>
                  </details>
                </Card>

                <Card className="p-6">
                  <SectionHeader
                    eyebrow="Activities"
                    title="Hoạt động học tập"
                    description="Tạo quiz và assignment gắn với bài học đang chọn."
                    meta={selectedLesson ? "Sẵn sàng" : "Chọn bài học"}
                  />

                  {selectedLesson ? (
                    <div className="grid gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                        <h3 className="font-bold text-white">
                          Tạo bài trắc nghiệm cho “{selectedLesson.title}”
                        </h3>
                        <form onSubmit={createQuiz} className="mt-4 grid gap-3">
                          <FieldLabel label="Tên bài trắc nghiệm">
                            <input
                              className={inputClass}
                              placeholder="Kiểm tra nhanh cuối bài"
                              value={quizForm.title}
                              onChange={(event) =>
                                setQuizForm({
                                  ...quizForm,
                                  title: event.target.value,
                                })
                              }
                              required
                            />
                          </FieldLabel>
                          <FieldLabel label="Câu hỏi">
                            <textarea
                              className={`${inputClass} min-h-24 py-3`}
                              placeholder="Nhập nội dung câu hỏi"
                              value={quizForm.question}
                              onChange={(event) =>
                                setQuizForm({
                                  ...quizForm,
                                  question: event.target.value,
                                })
                              }
                              required
                            />
                          </FieldLabel>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <FieldLabel label="Lựa chọn A">
                              <input
                                className={inputClass}
                                placeholder="Nội dung đáp án A"
                                value={quizForm.optionA}
                                onChange={(event) =>
                                  setQuizForm({
                                    ...quizForm,
                                    optionA: event.target.value,
                                  })
                                }
                                required
                              />
                            </FieldLabel>
                            <FieldLabel label="Lựa chọn B">
                              <input
                                className={inputClass}
                                placeholder="Nội dung đáp án B"
                                value={quizForm.optionB}
                                onChange={(event) =>
                                  setQuizForm({
                                    ...quizForm,
                                    optionB: event.target.value,
                                  })
                                }
                                required
                              />
                            </FieldLabel>
                          </div>
                          <FieldLabel label="Đáp án đúng">
                            <select
                              className={selectClass}
                              value={quizForm.correctOption}
                              onChange={(event) =>
                                setQuizForm({
                                  ...quizForm,
                                  correctOption: event.target.value,
                                })
                              }
                            >
                              <option value="0">A</option>
                              <option value="1">B</option>
                            </select>
                          </FieldLabel>
                          <Button
                            type="submit"
                            tone="dark"
                            loading={pendingAction === "quiz"}
                          >
                            {pendingAction === "quiz"
                              ? "Đang xuất bản..."
                              : "Xuất bản trắc nghiệm"}
                          </Button>
                        </form>
                      </div>

                      <div className="rounded-2xl border border-white/10 bg-white/[.03] p-4">
                        <h3 className="font-bold text-white">Tạo bài tập</h3>
                        <form onSubmit={createAssignment} className="mt-4 grid gap-3">
                          <FieldLabel label="Tên bài tập">
                            <input
                              className={inputClass}
                              placeholder="Ví dụ: Xây dựng component CourseCard"
                              value={assignmentForm.title}
                              onChange={(event) =>
                                setAssignmentForm({
                                  ...assignmentForm,
                                  title: event.target.value,
                                })
                              }
                              required
                            />
                          </FieldLabel>
                          <FieldLabel label="Yêu cầu bài làm">
                            <textarea
                              className={`${inputClass} min-h-32 py-3`}
                              placeholder="Mô tả đầu ra, tiêu chí và cách nộp bài"
                              value={assignmentForm.instructions}
                              onChange={(event) =>
                                setAssignmentForm({
                                  ...assignmentForm,
                                  instructions: event.target.value,
                                })
                              }
                              required
                            />
                          </FieldLabel>
                          <FieldLabel label="Điểm tối đa">
                            <input
                              className={inputClass}
                              type="number"
                              min="1"
                              value={assignmentForm.maxScore}
                              onChange={(event) =>
                                setAssignmentForm({
                                  ...assignmentForm,
                                  maxScore: event.target.value,
                                })
                              }
                            />
                          </FieldLabel>
                          <Button
                            type="submit"
                            tone="dark"
                            variant="secondary"
                            loading={pendingAction === "assignment"}
                          >
                            {pendingAction === "assignment"
                              ? "Đang xuất bản..."
                              : "Xuất bản bài tập"}
                          </Button>
                        </form>
                      </div>
                    </div>
                  ) : (
                    <EmptyPanel
                      title="Chọn một bài học"
                      description="Sau khi chọn bài học, bạn có thể thêm trắc nghiệm hoặc bài tập."
                    />
                  )}
                </Card>
              </div>

              <Card className="p-6">
                <SectionHeader
                  eyebrow="Roster"
                  title="Danh sách học viên"
                  description="Theo dõi những học viên đã đăng ký khóa học này."
                  meta={`${enrollments.length} học viên`}
                />
                {enrollments.length ? (
                  <div className="grid gap-2">
                    {enrollments.map((item) => (
                      <div
                        key={item._id}
                        className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[.03] p-4 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 items-center gap-3">
                          <Avatar name={item.user?.username} src={item.user?.avatar} />
                          <div className="min-w-0">
                            <strong className="block truncate text-sm text-white">
                              {item.user?.username}
                            </strong>
                            <small className="block truncate text-xs text-zinc-500">
                              {item.user?.email}
                            </small>
                          </div>
                        </div>
                        <Badge tone={item.status === "completed" ? "success" : "info"}>
                          {item.status === "completed" ? "Hoàn thành" : "Đang học"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <EmptyPanel
                    title="Chưa có học viên"
                    description="Khi học viên đăng ký, danh sách sẽ hiển thị tại đây."
                  />
                )}
              </Card>
            </>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
