import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser, type UserRole } from "./authService";

// Thông tin người dùng hiển thị trong trang Admin
export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  createdAt: string | null;
}

// Kiểm tra tài khoản hiện tại có phải Admin không
async function checkAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Bạn không có quyền thực hiện chức năng này.");
  }

  return currentUser;
}

// 1. Lấy danh sách người dùng
export async function getManagedUsers(): Promise<ManagedUser[]> {
  await initDatabase();
  await checkAdmin();

  const db = await getDatabase();

  return db.getAllAsync<ManagedUser>(`
    SELECT
      id,
      fullName,
      email,
      phone,
      address,
      role,
      createdAt
    FROM users
    ORDER BY createdAt DESC
  `);
}

// 2. Cập nhật vai trò người dùng
export async function updateUserRole(
  userId: string,
  newRole: UserRole,
): Promise<void> {
  const currentAdmin = await checkAdmin();
  const db = await getDatabase();

  // Không cho Admin tự thay đổi vai trò của mình
  if (userId === currentAdmin.id) {
    throw new Error("Bạn không thể thay đổi vai trò của chính mình.");
  }

  await db.withTransactionAsync(async () => {
    const targetUser = await db.getFirstAsync<{ role: UserRole }>(
      "SELECT role FROM users WHERE id = ?",
      userId,
    );

    if (!targetUser) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // Không cho phép hạ quyền nếu đây là Admin cuối cùng
    if (targetUser.role === "ADMIN" && newRole === "USER") {
      const result = await db.getFirstAsync<{ total: number }>(
        "SELECT COUNT(*) AS total FROM users WHERE role = 'ADMIN'",
      );

      if ((result?.total ?? 0) <= 1) {
        throw new Error("Hệ thống phải có ít nhất một tài khoản Admin.");
      }
    }

    await db.runAsync(
      "UPDATE users SET role = ? WHERE id = ?",
      newRole,
      userId,
    );
  });
}

// 3. Xóa người dùng
export async function deleteUser(userId: string): Promise<void> {
  const currentAdmin = await checkAdmin();
  const db = await getDatabase();

  // Không cho Admin tự xóa tài khoản của mình
  if (userId === currentAdmin.id) {
    throw new Error("Bạn không thể xóa tài khoản đang đăng nhập.");
  }

  await db.withTransactionAsync(async () => {
    const targetUser = await db.getFirstAsync<{ role: UserRole }>(
      "SELECT role FROM users WHERE id = ?",
      userId,
    );

    if (!targetUser) {
      throw new Error("Không tìm thấy người dùng.");
    }

    // Kiểm tra tài khoản có phải Admin cuối cùng không
    if (targetUser.role === "ADMIN") {
      const result = await db.getFirstAsync<{ total: number }>(
        "SELECT COUNT(*) AS total FROM users WHERE role = 'ADMIN'",
      );

      if ((result?.total ?? 0) <= 1) {
        throw new Error("Không thể xóa tài khoản Admin cuối cùng.");
      }
    }

    // Không xóa tài khoản đã có đơn hàng để giữ lịch sử mua hàng
    const orderResult = await db.getFirstAsync<{ total: number }>(
      "SELECT COUNT(*) AS total FROM orders WHERE userId = ?",
      userId,
    );

    if ((orderResult?.total ?? 0) > 0) {
      throw new Error(
        "Người dùng đã có đơn hàng. Không thể xóa để bảo toàn lịch sử mua hàng.",
      );
    }

    // Xóa dữ liệu liên quan trước khi xóa tài khoản
    await db.runAsync("DELETE FROM favorites WHERE userId = ?", userId);

    await db.runAsync("DELETE FROM cart_items WHERE userId = ?", userId);

    await db.runAsync("DELETE FROM users WHERE id = ?", userId);
  });
}
