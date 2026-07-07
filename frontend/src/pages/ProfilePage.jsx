import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Notice } from "../components/States.jsx";
import { Button, FormField, PasswordField } from "../components/ui/Controls.jsx";
import { useToast } from "../context/ToastContext.jsx";
import {
  Avatar,
  Badge,
  Card,
  DashboardLoading,
  DashboardShell,
  EmptyPanel,
  SectionHeader,
  StatCard,
} from "../components/dashboard/DashboardPrimitives.jsx";

const roleLabel = {
  admin: "Quản trị viên",
  teacher: "Giảng viên",
  student: "Học viên",
};

export default function ProfilePage() {
  const { user, setUser } = useAuth();
  const { pushToast } = useToast();
  const [enrollments, setEnrollments] = useState([]);
  const [profile, setProfile] = useState({
    username: user.username,
    email: user.email,
  });
  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(user.role === "student");
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    if (user.role !== "student") return;
    api("/users/me/enrollments")
      .then(setEnrollments)
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, [user.role]);

  async function updateProfile(event) {
    event.preventDefault();
    setError("");
    setSavingProfile(true);
    try {
      const updated = await api(`/users/${user.id}`, {
        method: "PUT",
        body: profile,
      });
      setUser({ ...updated, id: updated._id });
      pushToast("Thông tin cá nhân đã được cập nhật.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingProfile(false);
    }
  }

  async function changePassword(event) {
    event.preventDefault();
    setError("");
    setSavingPassword(true);
    try {
      await api("/users/me/change-password", {
        method: "PUT",
        body: passwords,
      });
      setPasswords({ currentPassword: "", newPassword: "" });
      pushToast("Mật khẩu đã được đổi và các phiên cũ đã bị thu hồi.");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingPassword(false);
    }
  }

  if (loading) {
    return <DashboardLoading label="Đang tổng hợp hành trình học tập..." />;
  }

  const activeEnrollments = enrollments.filter((item) => item.course);

  return (
    <DashboardShell
      eyebrow="Không gian cá nhân"
      title={`Xin chào, ${user.username}`}
      description="Quản lý hồ sơ, bảo mật tài khoản và theo dõi những khóa học bạn đang tham gia."
    >
      <Notice type="error" tone="dark">{error}</Notice>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <div className="grid content-start gap-6">
          <Card className="overflow-hidden p-6">
            <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-emerald-400/20 via-blue-400/10 to-transparent" />
            <div className="relative">
              <Avatar name={user.username} src={user.avatar} size="lg" />
              <div className="mt-5">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-black tracking-[-.04em] text-white">
                    {user.username}
                  </h2>
                  <Badge tone={user.isVerified ? "success" : "warning"}>
                    {user.isVerified ? "Đã xác minh" : "Chờ xác minh"}
                  </Badge>
                </div>
                <p className="mt-2 break-all text-sm text-zinc-400">{user.email}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="info">{roleLabel[user.role] || user.role}</Badge>
                  <Badge>{user.authProvider === "google" ? "Google" : "Email"}</Badge>
                </div>
              </div>
            </div>
          </Card>

          {user.role === "student" && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <StatCard
                label="Khóa học"
                value={activeEnrollments.length}
                helper="Đang tham gia"
                icon="◇"
              />
              <StatCard
                label="Trạng thái"
                value={activeEnrollments.some((item) => item.status === "active") ? "Active" : "Ready"}
                helper="Hồ sơ học tập"
                icon="↗"
                tone="blue"
              />
            </div>
          )}
        </div>

        <div className="grid gap-6">
          {user.role === "student" && (
            <Card className="p-6">
              <SectionHeader
                eyebrow="Hành trình học tập"
                title="Khóa học đang tham gia"
                description="Các khóa học được đồng bộ từ enrollment hiện tại của bạn."
                meta={`${activeEnrollments.length} khóa học`}
              />
              {activeEnrollments.length ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {activeEnrollments.map((item) => (
                    <Link
                      key={item._id}
                      to={`/courses/${item.course._id}`}
                      className="group rounded-2xl border border-white/10 bg-white/[.035] p-5 transition hover:-translate-y-0.5 hover:border-emerald-400/30 hover:bg-emerald-400/[.06]"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <Badge tone={item.status === "completed" ? "success" : "info"}>
                          {item.status === "completed" ? "Hoàn thành" : "Đang học"}
                        </Badge>
                        <span className="text-zinc-500 transition group-hover:translate-x-1 group-hover:text-emerald-300">
                          →
                        </span>
                      </div>
                      <h3 className="mt-4 line-clamp-2 text-base font-bold text-white">
                        {item.course.title}
                      </h3>
                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-400">
                        {item.course.description}
                      </p>
                      <p className="mt-4 text-xs font-semibold text-zinc-500">
                        Giảng viên: {item.course.teacher?.username || "Northstar"}
                      </p>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyPanel
                  title="Chưa có khóa học"
                  description="Chọn một khóa học để bắt đầu hành trình học tập của bạn."
                  action={
                    <Link
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-500 px-4 text-sm font-bold text-emerald-950 transition hover:bg-emerald-400"
                      to="/"
                    >
                      Khám phá khóa học
                    </Link>
                  }
                />
              )}
            </Card>
          )}

          <div className="grid gap-6 xl:grid-cols-2">
            <Card className="p-6">
              <SectionHeader
                eyebrow="Hồ sơ"
                title="Thông tin cá nhân"
                description="Thông tin này được dùng để hiển thị trong lớp học và bình luận."
              />
              <form onSubmit={updateProfile} className="grid gap-5">
                <FormField
                  label="Tên hiển thị"
                  tone="dark"
                  value={profile.username}
                  onChange={(event) =>
                    setProfile({ ...profile, username: event.target.value })
                  }
                />
                <FormField
                  label="Email"
                  tone="dark"
                  type="email"
                  value={profile.email}
                  onChange={(event) =>
                    setProfile({ ...profile, email: event.target.value })
                  }
                />
                <Button type="submit" tone="dark" loading={savingProfile}>
                  {savingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </form>
            </Card>

            <Card className="p-6">
              <SectionHeader
                eyebrow="Bảo mật"
                title="Đổi mật khẩu"
                description="Sau khi đổi mật khẩu, các refresh token cũ sẽ bị thu hồi."
              />
              <form onSubmit={changePassword} className="grid gap-5">
                <PasswordField
                  label="Mật khẩu hiện tại"
                  tone="dark"
                  autoComplete="current-password"
                  value={passwords.currentPassword}
                  onChange={(event) =>
                    setPasswords({
                      ...passwords,
                      currentPassword: event.target.value,
                    })
                  }
                />
                <PasswordField
                  label="Mật khẩu mới"
                  tone="dark"
                  autoComplete="new-password"
                  value={passwords.newPassword}
                  onChange={(event) =>
                    setPasswords({ ...passwords, newPassword: event.target.value })
                  }
                  placeholder="8+ ký tự, chữ hoa và số"
                  hint="Ít nhất 8 ký tự, gồm chữ hoa và số"
                />
                <Button
                  type="submit"
                  variant="secondary"
                  tone="dark"
                  loading={savingPassword}
                >
                  {savingPassword ? "Đang cập nhật..." : "Đổi mật khẩu"}
                </Button>
              </form>
            </Card>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
