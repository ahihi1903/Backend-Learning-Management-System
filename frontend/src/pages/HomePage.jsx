import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { SearchIcon } from "../components/Icons.jsx";
import { EmptyState, ErrorState } from "../components/States.jsx";
import { CourseGridSkeleton } from "../components/ui/Skeletons.jsx";

const gradients = ["gradient-violet", "gradient-coral", "gradient-mint", "gradient-blue"];

function formatPrice(price) {
  if (!price) return "Miễn phí";
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
}

function CourseCard({ course, index }) {
  return (
    <Link to={`/courses/${course._id}`} className="course-card" aria-label={`Xem khóa học ${course.title}`}>
      <div className={`course-cover ${gradients[index % gradients.length]}`}>
        {course.thumbnail ? (
          <img src={course.thumbnail} alt="" loading="lazy" decoding="async" />
        ) : (
          <span>{course.title.slice(0, 2).toUpperCase()}</span>
        )}
        <small>{course.category?.name || "Khóa học"}</small>
      </div>
      <div className="course-card-body">
        <div className="course-meta">
          <span>{course.teacher?.username || "Northstar mentor"}</span>
          <span>•</span>
          <span>Trực tuyến</span>
        </div>
        <h3>{course.title}</h3>
        <p>{course.description}</p>
        <div className="course-card-footer">
          <strong>{formatPrice(course.price)}</strong>
          <span className="arrow-link">Khám phá →</span>
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
      const params = new URLSearchParams({ page: String(filters.page), limit: "8" });
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
      <section className="hero section-wrap">
        <div className="hero-copy">
          <span className="eyebrow">Nền tảng học tập dành cho người làm thật</span>
          <h1>
            Biến sự tò mò thành
            <em> năng lực.</em>
          </h1>
          <p>
            Học theo lộ trình rõ ràng, luyện tập có phản hồi và theo dõi từng bước tiến bộ của bạn.
          </p>
          <div className="hero-actions">
            <a className="button" href="#catalog">Khám phá khóa học</a>
            <Link className="button button-ghost" to="/register">Tạo tài khoản miễn phí</Link>
          </div>
          <div className="hero-proof">
            <div><strong>12k+</strong><span>Học viên</span></div>
            <div><strong>94%</strong><span>Hoàn thành mục tiêu</span></div>
            <div><strong>4.9</strong><span>Đánh giá trung bình</span></div>
          </div>
        </div>
        <div className="hero-visual" aria-hidden="true">
          <div className="visual-grid" />
          <div className="floating-card card-progress">
            <span>Tiến độ tuần này</span>
            <strong>78%</strong>
            <div className="mini-progress"><i style={{ width: "78%" }} /></div>
          </div>
          <div className="floating-card card-focus">
            <span>Chuỗi tập trung</span>
            <strong>12 ngày</strong>
          </div>
          <div className="visual-orb orb-one" />
          <div className="visual-orb orb-two" />
          <div className="hero-monogram">N</div>
        </div>
      </section>

      <section className="catalog-section section-wrap" id="catalog">
        <div className="section-heading split-heading">
          <div>
            <span className="kicker">Danh mục khóa học</span>
            <h2>Chọn điều bạn muốn giỏi hơn.</h2>
          </div>
          <div className="catalog-search">
            <SearchIcon size={17} />
            <label className="sr-only" htmlFor="course-search">Tìm kiếm khóa học</label>
            <input
              id="course-search"
              type="search"
              value={filters.search}
              onChange={(event) => setFilters({ ...filters, search: event.target.value, page: 1 })}
              placeholder="Tìm kiếm khóa học..."
            />
          </div>
        </div>

        <div className="category-tabs">
          <button
            type="button"
            aria-pressed={!filters.category}
            className={!filters.category ? "active" : ""}
            onClick={() => setFilters({ ...filters, category: "", page: 1 })}
          >
            Tất cả
          </button>
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              aria-pressed={filters.category === category._id}
              className={filters.category === category._id ? "active" : ""}
              onClick={() => setFilters({ ...filters, category: category._id, page: 1 })}
            >
              {category.name}
            </button>
          ))}
        </div>

        {!loading && !error && (
          <div className="catalog-summary" aria-live="polite">
            <span><strong>{pagination?.totalItems ?? courses.length}</strong> khóa học phù hợp</span>
            {(filters.search || filters.category) && <button type="button" onClick={() => setFilters({ search: "", category: "", page: 1 })}>Xóa bộ lọc</button>}
          </div>
        )}

        {loading && <CourseGridSkeleton />}
        {!loading && error && <ErrorState error={error} onRetry={load} />}
        {!loading && !error && !courses.length && (
          <EmptyState title="Chưa có khóa học phù hợp" description="Hãy thử từ khóa hoặc danh mục khác." />
        )}
        {!loading && !error && courses.length > 0 && (
          <div className="course-grid">
            {courses.map((course, index) => <CourseCard key={course._id} course={course} index={index} />)}
          </div>
        )}

        {pagination?.totalPages > 1 && (
          <div className="pagination">
            <button aria-label="Trang trước" disabled={filters.page === 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })}>←</button>
            <span>Trang {filters.page} / {pagination.totalPages}</span>
            <button aria-label="Trang tiếp theo" disabled={filters.page === pagination.totalPages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })}>→</button>
          </div>
        )}
      </section>

      <section className="manifesto">
        <div className="section-wrap manifesto-inner">
          <span className="kicker">Learning philosophy</span>
          <h2>Không học để biết thêm.<br />Học để làm được nhiều hơn.</h2>
          <p>Mỗi bài học đều hướng tới một đầu ra cụ thể: hiểu, thực hành, nhận phản hồi và tiến bộ.</p>
        </div>
      </section>
    </>
  );
}
