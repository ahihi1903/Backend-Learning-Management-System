import User from "../models/User.js";
import Category from "../models/Category.js";
import Course from "../models/Course.js";
import Lesson from "../models/Lesson.js";
import Quiz from "../models/Quiz.js";
import Assignment from "../models/Assignment.js";
import { hashPassword } from "../utils/hash.js";

const DEMO_EMAIL = "teacher.demo@northstar.local";

const demoCatalog = [
  {
    category: {
      name: "Lập trình Web",
      slug: "lap-trinh-web",
      description: "Frontend và kỹ năng xây dựng sản phẩm web.",
    },
    course: {
      title: "React thực chiến: Xây dựng sản phẩm SaaS",
      description:
        "Từ component, state, API đến trải nghiệm người dùng và triển khai production.",
      thumbnail:
        "https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&w=1200&q=80",
    },
    lessons: [
      {
        title: "Tư duy component và kiến trúc React",
        content:
          "Chia giao diện thành component nhỏ, xác định ranh giới state và thiết kế API component có thể tái sử dụng.",
        videoUrl:
          "https://res.cloudinary.com/demo/video/upload/q_auto:good,f_auto/dog.mp4",
      },
      {
        title: "Kết nối API và trạng thái bất đồng bộ",
        content:
          "Xử lý loading, empty, error và tránh race condition trong giao diện thực tế.",
      },
      {
        title: "Tối ưu trải nghiệm và triển khai",
        content:
          "Hoàn thiện responsive, accessibility, hiệu năng tải trang và checklist production.",
      },
    ],
  },
  {
    category: {
      name: "Backend Engineering",
      slug: "backend-engineering",
      description: "API, database, bảo mật và vận hành backend.",
    },
    course: {
      title: "Node.js API: Từ REST đến Production",
      description:
        "Thiết kế REST API sạch, xác thực JWT, validation, test và triển khai an toàn.",
      thumbnail:
        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1200&q=80",
    },
    lessons: [
      {
        title: "Thiết kế resource và HTTP contract",
        content:
          "Xây dựng URL, status code và response contract dễ hiểu, nhất quán.",
      },
      {
        title: "Auth, validation và bảo mật",
        content:
          "Áp dụng JWT, refresh token, phân quyền và validation cho request.",
      },
      {
        title: "Integration test và observability",
        content:
          "Kiểm thử luồng thật, logging có cấu trúc và health check cho production.",
      },
    ],
  },
  {
    category: {
      name: "Product Design",
      slug: "product-design",
      description: "UI/UX và tư duy thiết kế sản phẩm số.",
    },
    course: {
      title: "UI/UX cho Developer",
      description:
        "Thiết kế giao diện SaaS hiện đại với spacing, typography, states và accessibility.",
      thumbnail:
        "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1200&q=80",
    },
    lessons: [
      {
        title: "Hệ thống màu sắc và typography",
        content:
          "Tạo visual hierarchy rõ ràng và một bảng màu hoạt động tốt ở cả light/dark mode.",
      },
      {
        title: "Layout responsive và component states",
        content:
          "Thiết kế cho mobile-first cùng loading, empty, error và disabled state.",
      },
      {
        title: "Micro interaction có mục đích",
        content:
          "Dùng chuyển động để phản hồi thao tác mà không làm người dùng mất tập trung.",
      },
    ],
  },
];

export async function seedDemoData() {
  let teacher = await User.findOne({ email: DEMO_EMAIL });
  if (!teacher) {
    teacher = await User.create({
      username: "northstar_teacher",
      email: DEMO_EMAIL,
      password: await hashPassword(
        process.env.DEMO_TEACHER_PASSWORD || "DemoTeacher123",
      ),
      role: "teacher",
      isVerified: true,
    });
  }

  const seededCourses = [];
  for (const item of demoCatalog) {
    const category = await Category.findOneAndUpdate(
      { slug: item.category.slug },
      { $set: item.category },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    const course = await Course.findOneAndUpdate(
      { title: item.course.title, teacher: teacher._id },
      {
        $set: {
          ...item.course,
          teacher: teacher._id,
          category: category._id,
          price: 0,
          isPublished: true,
        },
      },
      { upsert: true, returnDocument: "after", runValidators: true },
    );

    const lessons = [];
    for (const [index, lesson] of item.lessons.entries()) {
      lessons.push(
        await Lesson.findOneAndUpdate(
          { course: course._id, order: index + 1 },
          {
            $set: {
              ...lesson,
              course: course._id,
              order: index + 1,
            },
          },
          { upsert: true, returnDocument: "after", runValidators: true },
        ),
      );
    }
    seededCourses.push({ course, lessons });
  }

  const [{ course, lessons }] = seededCourses;
  await Quiz.findOneAndUpdate(
    { lesson: lessons[0]._id, title: "Kiểm tra nhanh về component" },
    {
      $set: {
        title: "Kiểm tra nhanh về component",
        lesson: lessons[0]._id,
        course: course._id,
        createdBy: teacher._id,
        passingScore: 60,
        isPublished: true,
        questions: [
          {
            text: "Khi nào nên tách một React component?",
            options: [
              "Khi phần UI có trách nhiệm rõ ràng và có thể tái sử dụng",
              "Luôn tách mỗi thẻ HTML thành một component",
            ],
            correctOption: 0,
            points: 1,
          },
        ],
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  await Assignment.findOneAndUpdate(
    { lesson: lessons[1]._id, title: "Thiết kế trạng thái cho trang khóa học" },
    {
      $set: {
        title: "Thiết kế trạng thái cho trang khóa học",
        instructions:
          "Mô tả cách giao diện xử lý loading, dữ liệu rỗng, lỗi API và retry.",
        lesson: lessons[1]._id,
        course: course._id,
        createdBy: teacher._id,
        maxScore: 100,
        isPublished: true,
      },
    },
    { upsert: true, returnDocument: "after", runValidators: true },
  );

  return {
    teacherEmail: DEMO_EMAIL,
    courseIds: seededCourses.map((item) => item.course.id),
    courses: seededCourses.length,
    lessons: seededCourses.reduce((total, item) => total + item.lessons.length, 0),
  };
}
