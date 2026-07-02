// src/controllers/userController.js
import * as userService from "../services/userService.js";

// GET /api/users — admin only
export async function getAll(req, res) {
  const result = await userService.getAllUsers(req.query);
  res.json(result);
}

// GET /api/users/:id — admin hoặc chính mình
export async function getById(req, res) {
  const user = await userService.getUserById(
    req.params.id,
    req.user.id,
    req.user.role,
  );
  res.json(user);
}

// GET /api/users/me — xem profile của chính mình
export async function getMe(req, res) {
  const user = await userService.getUserById(
    req.user.id,
    req.user.id,
    req.user.role,
  );
  res.json(user);
}

// PUT /api/users/:id — admin hoặc chính mình
export async function update(req, res) {
  const user = await userService.updateUser(
    req.params.id,
    req.user.id,
    req.user.role,
    req.body,
  );
  res.json(user);
}

// PUT /api/users/me/change-password — chính mình
export async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  await userService.changePassword(req.user.id, currentPassword, newPassword);
  res.json({ message: "Đổi mật khẩu thành công" });
}

// PATCH /api/users/:id/role — admin only
export async function updateRole(req, res) {
  const user = await userService.updateRole(req.params.id, req.body.role);
  res.json(user);
}

// DELETE /api/users/:id — admin hoặc chính mình
export async function remove(req, res) {
  await userService.deleteUser(req.params.id, req.user.id, req.user.role);
  res.json({ message: "User deleted" });
}
