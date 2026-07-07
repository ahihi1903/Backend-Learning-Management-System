import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { SearchIcon } from "../components/Icons.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { CourseGridSkeleton } from "../components/ui/Skeletons.jsx";

const gradients = [
  "from-violet-500 to-fuchsia-400",
  "from-orange-400 to-rose-500",
  "from-emerald-400 to-cyan-500",
  "from-blue-500 to-indigo-500",
];

function formatPrice(price) {
  if (!price) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function CourseCard({ course, index }) {
  return (
    <Link
      to={`/courses/${course._id}`}
      className="group overflow-hidden rounded-3xl border border-zinc-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-950/[.08] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-emerald-500/20 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
      aria-label={`Xem khóa học ${course.title}`}
    >
      <div
        className={`relative aspect-[16/10] overflow-hidden bg-gradient-to-br ${gradients[index % gradients.length]}`}
      >
        {course.thumbnail ? (
          <img
            className="size-full object-cover transition duration-500 group-hover:scale-[1.04]"
            src={course.thumbnail}
            alt=""
            loading="lazy"
            decoding="async"
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center text-5xl font-black text-white/90">
            {course.title.slice(0, 2).toUpperCase()}
          </span>
        )}
        <span className="absolute left-4 top-4 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
          {course.category?.name || "Khóa học"}
        </span>
      </div>
      <div className="p-5">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          {course.teacher?.username || "Northstar mentor"} · Trực tuyến
        </p>
        <h3 className="mt-3 line-clamp-2 text-lg font-bold leading-6 tracking-[-.02em] text-zinc-950 transition group-hover:text-brand-700 dark:text-white dark:group-hover:text-emerald-400">
          {course.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-500 dark:text-zinc-400">
          {course.description}
        </p>
        <div className="mt-5 flex items-center justify-between border-t border-zinc-100 pt-4 dark:border-zinc-800">
          <strong className="text-sm text-zinc-950 dark:text-white">
            {formatPrice(course.price)}
          </strong>
          <span className="text-sm font-semibold text-brand-600 transition group-hover:translate-x-1 dark:text-emerald-400">
            Khám phá →
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [filters, setFilters] = useState({ search: "", category: "", page: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(filters.page),
        limit: "8",
      });
      if (filters.search) params.set("search", filters.search);
      if (filters.category) params.set("category", filters.category);
      const [courseResult, categoryResult] = await Promise.all([
        api(`/courses?${params}`),
        categories.length ? Promise.resolve(categories) : api("/categories"),
      ]);
      setCourses(courseResult.courses);
      setPagination(courseResult.pagination);
      setCategories(categoryResult);
    } catch (requestError) {
      setError(requestError);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, filters.search ? 300 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  return (
    <>
      <section className="relative overflow-hidden border-b border-zinc-200/70 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(16,185,129,.14),transparent_30%),radial-gradient(circle_at_85%_60%,rgba(59,130,246,.10),transparent_28%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-24 lg:grid-cols-[1.05fr_.95fr] lg:px-10 lg:py-28">
          <div className="animate-fade-up">
            <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[.16em] text-brand-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
              Nền tảng học tập cho người làm thật
            </span>
            <h1 className="mt-7 max-w-3xl text-balance text-5xl font-black leading-[.98] tracking-[-.055em] text-zinc-950 dark:text-white sm:text-6xl lg:text-7xl">
              Biến sự tò mò thành{" "}
              <span className="text-brand-600 dark:text-emerald-400">năng lực.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
              Học theo lộ trình rõ ràng, luyện tập có phản hồi và theo dõi từng
              bước tiến bộ của bạn trong một không gian tập trung.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:-translate-y-0.5 hover:bg-brand-700"
                href="#catalog"
              >
                Khám phá khóa học
              </a>
              <Link
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-zinc-200 bg-white px-6 text-sm font-bold text-zinc-800 transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
                to="/register"
              >
                Tạo tài khoản miễn phí
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-5 border-t border-zinc-200 pt-7 dark:border-zinc-800">
              {[["12k+", "Học viên"], ["94%", "Đạt mục tiêu"], ["4.9", "Đánh giá"]].map(
                ([value, label]) => (
                  <div key={label}>
                    <strong className="block text-2xl font-black text-zinc-950 dark:text-white">
                      {value}
                    </strong>
                    <span className="mt-1 block text-xs font-medium text-zinc-500">
                      {label}
                    </span>
                  </div>
                ),
              )}
            </div>
          </div>

          <div className="relative mx-auto hidden aspect-square w-full max-w-lg lg:block">
            <div className="absolute inset-[8%] rotate-3 rounded-[3rem] border border-zinc-200 bg-white shadow-2xl shadow-zinc-950/10 dark:border-zinc-800 dark:bg-zinc-900" />
            <div className="absolute inset-[16%] -rotate-3 rounded-[2.5rem] bg-zinc-950 dark:bg-emerald-950">
              <div className="grid size-full place-items-center text-[9rem] font-black text-emerald-400">
                N
              </div>
            </div>
            <div className="absolute left-0 top-[18%] w-52 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-300">
                Tiến độ tuần này
              </span>
              <strong className="mt-1 block text-2xl font-black text-zinc-950 dark:text-white">
                78%
              </strong>
              <div className="mt-3 h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-700">
                <i className="block h-full w-[78%] rounded-full bg-emerald-500" />
              </div>
            </div>
            <div className="absolute bottom-[15%] right-0 rounded-2xl border border-zinc-200 bg-white p-4 shadow-xl dark:border-zinc-700 dark:bg-zinc-800">
              <span className="text-xs font-medium text-zinc-500 dark:text-zinc-300">
                Chuỗi tập trung
              </span>
              <strong className="mt-1 block text-2xl font-black text-zinc-950 dark:text-white">
                12 ngày
              </strong>
            </div>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24 lg:px-10"
        id="catalog"
      >
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-brand-600">
              Danh mục khóa học
            </p>
            <h2 className="mt-3 text-3xl font-black tracking-[-.04em] text-zinc-950 dark:text-white sm:text-4xl">
              Chọn điều bạn muốn giỏi hơn.
            </h2>
          </div>
          <label className="relative block w-full lg:max-w-sm" htmlFor="course-search">
            <span className="sr-only">Tìm kiếm khóa học</span>
            <SearchIcon
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400"
              size={18}
            />
            <input
              id="course-search"
              className="min-h-12 w-full rounded-xl border border-zinc-200 bg-white pl-11 pr-4 text-sm outline-none transition focus:border-brand-500 focus:ring-4 focus:ring-emerald-500/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
              type="search"
              value={filters.search}
              onChange={(event) =>
                setFilters({ ...filters, search: event.target.value, page: 1 })
              }
              placeholder="Tìm kiếm khóa học..."
            />
          </label>
        </div>

        <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
          <button
            type="button"
            aria-pressed={!filters.category}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
              !filters.category
                ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
            }`}
            onClick={() => setFilters({ ...filters, category: "", page: 1 })}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              aria-pressed={filters.category === category._id}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-semibold transition ${
                filters.category === category._id
                  ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950"
                  : "border border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300"
              }`}
              onClick={() =>
                setFilters({ ...filters, category: category._id, page: 1 })
              }
            >
              {category.name}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <div className="my-7 flex items-center justify-between text-sm text-zinc-500">
            <span>
              <strong className="text-zinc-950 dark:text-white">
                {pagination?.total ?? courses.length}
              </strong>{" "}
              khóa học phù hợp
            </span>
            {(filters.search || filters.category) && (
              <button
                className="font-semibold text-brand-600 hover:text-brand-700"
                type="button"
                onClick={() => setFilters({ search: "", category: "", page: 1 })}
              >
                Xóa bộ lọc
              </button>
            )}
          </div>
        )}

        {loading && <div className="mt-8"><CourseGridSkeleton /></div>}
        {!loading && error && <ErrorState error={error} onRetry={load} />}
        {!loading && !error && !courses.length && (
          <div className="mt-8">
            <EmptyState
              title="Chưa có khóa học phù hợp"
              description="Hãy thử từ khóa hoặc danh mục khác."
            />
          </div>
        )}
        {!loading && !error && courses.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {courses.map((course, index) => (
              <CourseCard key={course._id} course={course} index={index} />
            ))}
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
              aria-label="Trang trước"
              disabled={filters.page === 1}
              onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            >
              ←
            </button>
            <span className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              Trang {filters.page} / {pagination.totalPages}
            </span>
            <button
              className="grid size-10 place-items-center rounded-xl border border-zinc-200 bg-white transition hover:border-zinc-300 disabled:opacity-40 dark:border-zinc-700 dark:bg-zinc-900"
              aria-label="Trang tiếp theo"
              disabled={filters.page === pagination.totalPages}
              onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            >
              →
            </button>
          </div>
        )}
      </section>

      <section className="bg-zinc-950 px-5 py-20 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-emerald-400">
            Learning philosophy
          </p>
          <h2 className="mt-5 max-w-4xl text-balance text-4xl font-black leading-tight tracking-[-.04em] sm:text-5xl">
            Không học để biết thêm. Học để làm được nhiều hơn.
          </h2>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-400">
            Mỗi bài học hướng tới một đầu ra cụ thể: hiểu, thực hành, nhận phản
            hồi và tiến bộ.
          </p>
        </div>
      </section>
    </>
  );
}
