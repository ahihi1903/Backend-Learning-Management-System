import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { Notice } from "../components/States.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { Button } from "../components/ui/Controls.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  Avatar,
  Badge,
  Card,
  DataTable,
  DataTableRow,
  DashboardLoading,
  DashboardShell,
  EmptyPanel,
  IconButton,
  SectionHeader,
  StatCard,
  inputClass,
  selectClass,
} from "../components/dashboard/DashboardPrimitives.jsx";

const roleLabel = {
  student: "Học viên",
  teacher: "Giảng viên",
  admin: "Quản trị viên",
};

const roleTone = {
  student: "info",
  teacher: "success",
  admin: "warning",
};

export default function AdminPage() {
  const { pushToast } = useToast();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({
    name: "",
    description: "",
  });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [savingCategory, setSavingCategory] = useState(false);
  const [updatingRole, setUpdatingRole] = useState("");

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: "1", limit: "100" });
      if (search) params.set("search", search);
      const [userResult, categoryResult] = await Promise.all([
        api(`/users?${params}`),
        api("/categories"),
      ]);
      setUsers(userResult.users);
      setCategories(categoryResult);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = setTimeout(load, search ? 250 : 0);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  async function createCategory(event) {
    event.preventDefault();
    setError("");
    setSavingCategory(true);
    try {
      await api("/categories", { method: "POST", body: categoryForm });
      setCategoryForm({ name: "", description: "" });
      pushToast("Danh mục mới đã được tạo.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingCategory(false);
    }
  }

  async function updateRole(userId, role) {
    setError("");
    setUpdatingRole(userId);
    try {
      const updated = await api(`/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
      setUsers(users.map((user) => (user._id === userId ? updated : user)));
      pushToast("Vai trò người dùng đã được cập nhật.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingRole("");
    }
  }

  async function deleteCategory() {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await api(`/categories/${categoryToDelete._id}`, { method: "DELETE" });
      setCategories(
        categories.filter((category) => category._id !== categoryToDelete._id),
      );
      pushToast("Danh mục đã được xóa.");
      setCategoryToDelete(null);
    } catch (requestError) {
      setError(requestError.message);
      pushToast(requestError.message, { type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !users.length) {
    return <DashboardLoading label="Đang tải bảng điều khiển quản trị..." />;
  }

  const roleCounts = users.reduce(
    (result, user) => ({ ...result, [user.role]: (result[user.role] || 0) + 1 }),
    {},
  );

  return (
    <DashboardShell
      eyebrow="Bảng điều khiển quản trị"
      title="Giữ hệ thống rõ ràng và khỏe mạnh."
      description="Quản lý danh mục, tài khoản và phân quyền toàn hệ thống trong một không gian gọn gàng."
    >
      <Notice type="error" tone="dark">{error}</Notice>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Tổng người dùng" value={users.length} icon="◎" />
        <StatCard
          label="Học viên"
          value={roleCounts.student || 0}
          icon="◇"
          tone="blue"
        />
        <StatCard
          label="Giảng viên"
          value={roleCounts.teacher || 0}
          icon="✦"
          tone="emerald"
        />
        <StatCard
          label="Danh mục"
          value={categories.length}
          icon="▦"
          tone="violet"
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card className="p-6">
          <SectionHeader
            eyebrow="Phân loại nội dung"
            title="Danh mục"
            description="Tạo và quản lý các nhóm nội dung dùng cho khóa học."
            meta={`${categories.length} mục`}
          />

          <form onSubmit={createCategory} className="grid gap-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-200">
                Tên danh mục
              </span>
              <input
                className={inputClass}
                placeholder="Ví dụ: Lập trình Web"
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm({ ...categoryForm, name: event.target.value })
                }
                required
              />
            </label>
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-zinc-200">Mô tả</span>
              <input
                className={inputClass}
                placeholder="Mô tả ngắn cho danh mục"
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm({
                    ...categoryForm,
                    description: event.target.value,
                  })
                }
              />
            </label>
            <Button
              type="submit"
              tone="dark"
              className="mt-1"
              loading={savingCategory}
            >
              {savingCategory ? "Đang thêm..." : "Thêm danh mục"}
            </Button>
          </form>

          <div className="mt-6 grid gap-3">
            {categories.length ? (
              categories.map((category) => (
                <div
                  key={category._id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[.035] p-4 transition hover:border-white/15 hover:bg-white/[.055]"
                >
                  <div className="min-w-0">
                    <strong className="block truncate text-sm text-white">
                      {category.name}
                    </strong>
                    <small className="mt-1 block truncate text-xs text-zinc-500">
                      /{category.slug}
                    </small>
                  </div>
                  <IconButton
                    tone="danger"
                    label={`Xóa danh mục ${category.name}`}
                    onClick={() => setCategoryToDelete(category)}
                  >
                    ×
                  </IconButton>
                </div>
              ))
            ) : (
              <EmptyPanel
                title="Chưa có danh mục"
                description="Tạo danh mục đầu tiên để giáo viên có thể gắn khóa học."
              />
            )}
          </div>
        </Card>

        <Card className="overflow-hidden p-0">
          <div className="border-b border-white/10 p-6">
            <SectionHeader
              eyebrow="Kiểm soát truy cập"
              title="Người dùng"
              description="Tìm kiếm, xem trạng thái xác minh và cập nhật vai trò."
              meta={`${users.length} tài khoản`}
            />
            <label className="relative block" htmlFor="admin-user-search">
              <span className="sr-only">Tìm người dùng</span>
              <span
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500"
                aria-hidden="true"
              >
                ⌕
              </span>
              <input
                id="admin-user-search"
                className={`${inputClass} pl-10`}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tìm theo tên hoặc email..."
              />
            </label>
          </div>

          {users.length ? (
            <>
              <div className="grid gap-3 p-4 md:hidden">
                {users.map((item) => (
                  <div
                    className="rounded-2xl border border-white/10 bg-white/[.03] p-4"
                    key={item._id}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={item.username} src={item.avatar} size="sm" />
                        <div className="min-w-0">
                          <strong className="block truncate text-sm text-white">
                            {item.username}
                          </strong>
                          <small className="mt-1 block truncate text-xs text-zinc-500">
                            {item.email}
                          </small>
                        </div>
                      </div>
                      <Badge tone={item.isVerified ? "success" : "warning"}>
                        {item.isVerified ? "Đã xác minh" : "Chờ xác minh"}
                      </Badge>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3 border-t border-white/10 pt-4">
                      <Badge tone={roleTone[item.role]}>
                        {roleLabel[item.role] || item.role}
                      </Badge>
                      <select
                        className={selectClass}
                        value={item.role}
                        disabled={updatingRole === item._id}
                        aria-label={`Đổi vai trò cho ${item.username}`}
                        onChange={(event) => updateRole(item._id, event.target.value)}
                      >
                        <option value="student">Học viên</option>
                        <option value="teacher">Giảng viên</option>
                        <option value="admin">Quản trị viên</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div className="hidden md:block">
                <DataTable
                  columns={[
                    { key: "user", label: "Người dùng", width: "1.35fr" },
                    { key: "status", label: "Trạng thái", width: ".7fr" },
                    { key: "role", label: "Vai trò", width: ".9fr" },
                  ]}
                >
                  {users.map((item) => (
                    <DataTableRow
                      key={item._id}
                      columns={[
                        { key: "user", width: "1.35fr" },
                        { key: "status", width: ".7fr" },
                        { key: "role", width: ".9fr" },
                      ]}
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <Avatar name={item.username} src={item.avatar} size="sm" />
                        <div className="min-w-0">
                          <strong className="block truncate text-sm text-white">
                            {item.username}
                          </strong>
                          <small className="mt-1 block truncate text-xs text-zinc-500">
                            {item.email}
                          </small>
                        </div>
                      </div>
                      <Badge tone={item.isVerified ? "success" : "warning"}>
                        {item.isVerified ? "Đã xác minh" : "Chờ xác minh"}
                      </Badge>
                      <div className="flex items-center gap-2">
                        <Badge tone={roleTone[item.role]}>
                          {roleLabel[item.role] || item.role}
                        </Badge>
                        <select
                          className={selectClass}
                          value={item.role}
                          disabled={updatingRole === item._id}
                          aria-label={`Đổi vai trò cho ${item.username}`}
                          onChange={(event) =>
                            updateRole(item._id, event.target.value)
                          }
                        >
                          <option value="student">Học viên</option>
                          <option value="teacher">Giảng viên</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>
                    </DataTableRow>
                  ))}
                </DataTable>
              </div>
            </>
          ) : (
            <div className="p-6">
              <EmptyPanel
                title="Không tìm thấy người dùng"
                description="Thử đổi từ khóa tìm kiếm hoặc kiểm tra lại dữ liệu tài khoản."
              />
            </div>
          )}
        </Card>
      </div>

      <ConfirmDialog
        open={Boolean(categoryToDelete)}
        title="Xóa danh mục?"
        description={`Danh mục “${categoryToDelete?.name || ""}” sẽ bị xóa vĩnh viễn. Nếu đang chứa khóa học, hệ thống sẽ từ chối thao tác này.`}
        confirmLabel="Xóa danh mục"
        danger
        loading={deleting}
        onCancel={() => setCategoryToDelete(null)}
        onConfirm={deleteCategory}
      />
    </DashboardShell>
  );
}
