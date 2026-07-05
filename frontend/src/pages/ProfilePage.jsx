import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { LoadingState, Notice } from "../components/States.jsx";
import { Button, FormField, PasswordField } from "../components/ui/Controls.jsx";
import { useToast } from "../context/ToastContext.jsx";

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { pushToast } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [profile, setProfile] = useState({ username: user.username, email: user.email });
  const [passwords, setPasswords] = useState({ currentPassword: "", newPassword: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(user.role === "student");

  useEffect(() => {
    if (user.role !== "student") return;
    api("/users/me/enrollments")
      .then(setEnrollments)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [user.role]);

  async function updateProfile(event) {
    event.preventDefault();
    try {
      const updated = await api(`/users/${user.id}`, { method: "PUT", body: profile });
      setUser({ ...updated, id: updated._id });
      pushToast("Thông tin cá nhân đã được cập nhật.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    try {
      await api("/users/me/change-password", { method: "PUT", body: passwords });
      setPasswords({ currentPassword: "", newPassword: "" });
      pushToast("Mật khẩu đã được đổi và các phiên cũ đã bị thu hồi.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  if (loading) return <LoadingState label="Đang tổng hợp hành trình học tập..." />;

  return (
    <section className="profile-page section-wrap">
      <div className="profile-hero"><span className="avatar profile-avatar">{user.username?.[0]?.toUpperCase()}</span><div><span className="eyebrow">Không gian của tôi</span><h1>{user.username}</h1><p>{user.email} · {user.role}</p></div></div>
      <Notice type="error">{error}</Notice>
      {user.role === "student" && <section className="profile-section"><div className="section-heading"><span className="kicker">Hành trình học tập</span><h2>Khóa học đang tham gia</h2></div>{enrollments.length ? <div className="enrollment-grid">{enrollments.map((item) => item.course && <Link key={item._id} to={`/courses/${item.course._id}`}><span className={`status-pill ${item.status}`}>{item.status}</span><h3>{item.course.title}</h3><p>{item.course.description}</p><small>Giảng viên: {item.course.teacher?.username}</small></Link>)}</div> : <div className="empty-state"><span>◇</span><h3>Chưa có khóa học</h3><p>Chọn một khóa học để bắt đầu hành trình.</p><Link className="button" to="/">Khám phá khóa học</Link></div>}</section>}
      <div className="settings-grid">
        <section className="settings-card"><span className="kicker">Hồ sơ</span><h2>Thông tin cá nhân</h2><form onSubmit={updateProfile} className="form-stack"><FormField label="Tên hiển thị" value={profile.username} onChange={(e) => setProfile({ ...profile, username: e.target.value })} /><FormField label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /><Button type="submit">Lưu thay đổi</Button></form></section>
        <section className="settings-card"><span className="kicker">Bảo mật</span><h2>Đổi mật khẩu</h2><form onSubmit={changePassword} className="form-stack"><PasswordField label="Mật khẩu hiện tại" autoComplete="current-password" value={passwords.currentPassword} onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })} /><PasswordField label="Mật khẩu mới" autoComplete="new-password" value={passwords.newPassword} onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })} placeholder="8+ ký tự, chữ hoa và số" hint="Ít nhất 8 ký tự, gồm chữ hoa và số" /><Button type="submit" variant="secondary">Đổi mật khẩu</Button></form></section>
      </div>
    </section>
  );
}
