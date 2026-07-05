import { useEffect, useState } from "react";
import { api } from "../api/client.js";
import { LoadingState, Notice } from "../components/States.jsx";
import ConfirmDialog from "../components/ui/ConfirmDialog.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function AdminPage() {
  const { pushToast } = useToast();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [categoryForm, setCategoryForm] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
    try {
      await api("/categories", { method: "POST", body: categoryForm });
      setCategoryForm({ name: "", description: "" });
      pushToast("Danh mục mới đã được tạo.");
      await load();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateRole(userId, role) {
    try {
      const updated = await api(`/users/${userId}/role`, {
        method: "PATCH",
        body: { role },
      });
      setUsers(users.map((user) => (user._id === userId ? updated : user)));
      pushToast("Vai trò người dùng đã được cập nhật.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function deleteCategory() {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await api(`/categories/${categoryToDelete._id}`, { method: "DELETE" });
      setCategories(categories.filter((category) => category._id !== categoryToDelete._id));
      pushToast("Danh mục đã được xóa.");
      setCategoryToDelete(null);
    } catch (requestError) {
      setError(requestError.message);
      pushToast(requestError.message, { type: "error" });
    } finally {
      setDeleting(false);
    }
  }

  if (loading && !users.length) return <LoadingState label="Đang tải bảng điều khiển quản trị..." />;

  const roleCounts = users.reduce((result, user) => ({ ...result, [user.role]: (result[user.role] || 0) + 1 }), {});

  return (
    <section className="dashboard-page section-wrap">
      <div className="dashboard-heading"><div><span className="eyebrow">Bảng điều khiển quản trị</span><h1>Giữ hệ thống rõ ràng và khỏe mạnh.</h1><p>Quản lý danh mục, tài khoản và phân quyền toàn hệ thống.</p></div></div>
      <Notice type="error">{error}</Notice>
      <div className="admin-stats"><div><span>Tổng người dùng</span><strong>{users.length}</strong></div><div><span>Học viên</span><strong>{roleCounts.student || 0}</strong></div><div><span>Giảng viên</span><strong>{roleCounts.teacher || 0}</strong></div><div><span>Danh mục</span><strong>{categories.length}</strong></div></div>

      <div className="admin-grid">
        <section className="admin-panel">
          <div className="panel-heading"><div><span className="kicker">Phân loại nội dung</span><h2>Danh mục</h2></div><span>{categories.length}</span></div>
          <form onSubmit={createCategory} className="inline-create"><input placeholder="Tên danh mục" value={categoryForm.name} onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })} required /><input placeholder="Mô tả" value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} /><button className="button">Thêm</button></form>
          <div className="category-admin-list">{categories.map((category) => <div key={category._id}><div><strong>{category.name}</strong><small>/{category.slug}</small></div><button type="button" className="icon-button danger" aria-label={`Xóa danh mục ${category.name}`} onClick={() => setCategoryToDelete(category)}>×</button></div>)}</div>
        </section>

        <section className="admin-panel users-panel">
          <div className="panel-heading"><div><span className="kicker">Kiểm soát truy cập</span><h2>Người dùng</h2></div><div className="small-search"><label className="sr-only" htmlFor="admin-user-search">Tìm người dùng</label><span aria-hidden="true">⌕</span><input id="admin-user-search" type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm người dùng..." /></div></div>
          <div className="user-table"><div className="table-head"><span>Người dùng</span><span>Trạng thái</span><span>Vai trò</span></div>{users.map((user) => <div className="table-row" key={user._id}><div className="user-cell"><span className="avatar">{user.username?.[0]?.toUpperCase()}</span><div><strong>{user.username}</strong><small>{user.email}</small></div></div><span className={`verification ${user.isVerified ? "verified" : ""}`}>{user.isVerified ? "Đã xác minh" : "Chờ xác minh"}</span><select value={user.role} onChange={(e) => updateRole(user._id, e.target.value)}><option value="student">Học viên</option><option value="teacher">Giảng viên</option><option value="admin">Quản trị viên</option></select></div>)}</div>
        </section>
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
    </section>
  );
}
