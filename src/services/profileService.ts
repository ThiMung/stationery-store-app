
import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";

export interface UpdateProfileInput {
  fullName: string;
  phone: string;
  address: string;
}

// Cập nhật thông tin tài khoản đang đăng nhập
export async function updateMyProfile(
  input: UpdateProfileInput
): Promise<void> {
  await initDatabase();

  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Bạn cần đăng nhập để cập nhật thông tin.");
  }

  const fullName = input.fullName.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();

  // Kiểm tra họ tên
  if (!fullName) {
    throw new Error("Vui lòng nhập họ và tên.");
  }

  if (fullName.length > 100) {
    throw new Error("Họ tên không được vượt quá 100 ký tự.");
  }

  // Kiểm tra số điện thoại nếu người dùng có nhập
  if (phone) {
    const phoneDigits = phone.replace(/\D/g, "");

    if (phoneDigits.length < 9 || phoneDigits.length > 11) {
      throw new Error(
        "Số điện thoại phải có từ 9 đến 11 chữ số."
      );
    }
  }

  if (address.length > 250) {
    throw new Error("Địa chỉ không được vượt quá 250 ký tự.");
  }

  const db = await getDatabase();

  const result = await db.runAsync(
    `UPDATE users
     SET fullName = ?, phone = ?, address = ?
     WHERE id = ?`,
    fullName,
    phone || null,
    address || null,
    user.id
  );

  if (result.changes === 0) {
    throw new Error("Không thể cập nhật thông tin tài khoản.");
  }
}
