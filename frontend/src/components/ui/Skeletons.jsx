export function CourseGridSkeleton({ count = 4 }) {
  return (
    <div className="course-grid" aria-label="Đang tải danh sách khóa học" aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="course-card skeleton-card" aria-hidden="true" key={index}>
          <div className="skeleton skeleton-cover" />
          <div className="skeleton-card-body">
            <span className="skeleton skeleton-line short" />
            <span className="skeleton skeleton-line title" />
            <span className="skeleton skeleton-line" />
            <span className="skeleton skeleton-line medium" />
          </div>
        </div>
      ))}
    </div>
  );
}
