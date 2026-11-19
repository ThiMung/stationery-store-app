import { getDatabase, initDatabase } from "../database/database";
import type {
  AuthenticatedUser,
  RegisterUserInput,
  UserRole,
} from "../types/user";

export type { AuthenticatedUser, RegisterUserInput, UserRole };

// Đăng ký tài khoản người dùng mới
export async function registerUser(input: RegisterUserInput) {
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const phone = input.phone.trim();
  const address = input.address.trim();

  if (!fullName || !email || !password) {
    throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error("Email không đúng định dạng.");
  }

  if (password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  await initDatabase();
  const db = await getDatabase();

  const existingUser = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM users WHERE email = ?",
    email
  );

  if (existingUser) {
    throw new Error("Email này đã được đăng ký.");
  }

  const userId = `USER_${Date.now()}`;

  try {
    await db.runAsync(
      `INSERT INTO users (id, fullName, email, password, phone, address, role)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, fullName, email, password, phone || null, address || null, "USER"]
    );

    return {
      id: userId,
      fullName,
      email,
      phone,
      address,
      role: "USER" as UserRole,
    };
  } catch (error) {
    const errorMessage = String(error).toLowerCase();
    if (errorMessage.includes("unique")) {
      throw new Error("Email này đã được đăng ký.");
    }
    throw new Error("Đăng ký thất bại. Vui lòng thử lại.");
  }
}

// Đăng nhập tài khoản
export async function loginUser(
  emailInput: string,
  passwordInput: string
): Promise<AuthenticatedUser> {
  const email = emailInput.trim().toLowerCase();

  if (!email || !passwordInput) {
    throw new Error("Vui lòng nhập email và mật khẩu.");
  }

  await initDatabase();
  const db = await getDatabase();

  const user = await db.getFirstAsync<AuthenticatedUser>(
    `SELECT id, fullName, email, phone, address, role
     FROM users
     WHERE email = ? AND password = ?`,
    email,
    passwordInput
  );

  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác.");
  }

  await db.runAsync(
    `INSERT INTO auth_sessions (id, userId)
     VALUES (1, ?)
     ON CONFLICT(id) DO UPDATE SET userId = excluded.userId`,
    user.id
  );

  return user;
}

// Lấy thông tin tài khoản đang đăng nhập
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  await initDatabase();
  const db = await getDatabase();

  return db.getFirstAsync<AuthenticatedUser>(`
    SELECT u.id, u.fullName, u.email, u.phone, u.address, u.role
    FROM auth_sessions s
    INNER JOIN users u ON s.userId = u.id
    WHERE s.id = 1
  `);
}

// Đăng xuất tài khoản
export async function logoutUser(): Promise<void> {
  const db = await getDatabase();
  await db.runAsync("DELETE FROM auth_sessions WHERE id = 1");
}
