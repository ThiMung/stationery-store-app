import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";
import type { ManagedUser, UserRole } from "../types/user";

export type { ManagedUser };

// Kiểm tra quyền Quản trị viên (Admin)
async function checkAdmin() {
  const currentUser = await getCurrentUser();
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Bạn không có quyền thực hiện chức năng này.");
  }
  return currentUser;
}

// 1. Lấy danh sách tất cả người dùng
export async function getManagedUsers(): Promise<ManagedUser[]> {
  await initDatabase();
  await checkAdmin();
  const db = await getDatabase();

  return db.getAllAsync<ManagedUser>(`
    SELECT id, fullName, email, phone, address, role, createdAt
    FROM users
    ORDER BY createdAt DESC
  `);
}

// 2. Cập nhật vai trò người dùng (USER <-> ADMIN)
export async function updateUserRole(
  userId: string,
  newRole: UserRole
): Promise<void> {
  const currentAdmin = await checkAdmin();
  const db = await getDatabase();

  if (userId === currentAdmin.id) {
    throw new Error("Bạn không thể thay đổi vai trò của chính mình.");
  }

  await db.withTransactionAsync(async () => {
    const targetUser = await db.getFirstAsync<{ role: UserRole }>(
      "SELECT role FROM users WHERE id = ?",
      userId
    );

    if (!targetUser) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // Không cho phép hạ quyền nếu đây là Admin duy nhất còn lại
    if (targetUser.role === "ADMIN" && newRole === "USER") {
      const result = await db.getFirstAsync<{ total: number }>(
        "SELECT COUNT(*) AS total FROM users WHERE role = 'ADMIN'"
      );

      if ((result?.total ?? 0) <= 1) {
        throw new Error("Hệ thống phải có ít nhất một tài khoản Admin.");
      }
    }

    await db.runAsync(
      "UPDATE users SET role = ? WHERE id = ?",
      newRole,
      userId
    );
  });
}

// 3. Xóa tài khoản người dùng
export async function deleteUser(userId: string): Promise<void> {
  const currentAdmin = await checkAdmin();
  const db = await getDatabase();

  if (userId === currentAdmin.id) {
    throw new Error("Bạn không thể xóa tài khoản đang đăng nhập.");
  }

  await db.withTransactionAsync(async () => {
    const targetUser = await db.getFirstAsync<{ role: UserRole }>(
      "SELECT role FROM users WHERE id = ?",
      userId
    );

    if (!targetUser) {
      throw new Error("Không tìm thấy người dùng.");
    }

    if (targetUser.role === "ADMIN") {
      const result = await db.getFirstAsync<{ total: number }>(
        "SELECT COUNT(*) AS total FROM users WHERE role = 'ADMIN'"
      );

      if ((result?.total ?? 0) <= 1) {
        throw new Error("Không thể xóa tài khoản Admin duy nhất.");
      }
    }

    await db.runAsync("DELETE FROM users WHERE id = ?", userId);
  });
}
