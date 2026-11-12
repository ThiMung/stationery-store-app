
import {
  getDatabase,
  initDatabase,
} from "../database/database";

// Kiểu dữ liệu đầu vào khi đăng ký
export interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

// Hàm đăng ký tài khoản
export async function registerUser(
  input: RegisterUserInput
) {
  // 1. Chuẩn hóa dữ liệu
  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password;
  const phone = input.phone.trim();
  const address = input.address.trim();

  // 2. Kiểm tra thông tin bắt buộc
  if (!fullName || !email || !password) {
    throw new Error("Vui lòng nhập đầy đủ thông tin bắt buộc.");
  }

  // 3. Kiểm tra định dạng email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(email)) {
    throw new Error("Email không đúng định dạng.");
  }

  // 4. Kiểm tra mật khẩu
  if (password.length < 6) {
    throw new Error("Mật khẩu phải có ít nhất 6 ký tự.");
  }

  // 5. Đảm bảo database đã được khởi tạo
  await initDatabase();

  const db = await getDatabase();

  // 6. Kiểm tra email đã tồn tại chưa
  const existingUser = await db.getFirstAsync<{ id: string }>(
    `SELECT id FROM users WHERE email = ?`,
    email
  );

  if (existingUser) {
    throw new Error("Email này đã được đăng ký.");
  }

  // 7. Tạo ID cho tài khoản mới
  const userId = `USER_${Date.now()}`;

  try {
    // 8. Thêm tài khoản vào SQLite
    await db.runAsync(
      `INSERT INTO users (
        id,
        fullName,
        email,
        password,
        phone,
        address,
        role
      )
      VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        fullName,
        email,
        password,
        phone || null,
        address || null,
        "USER",
      ]
    );

    console.log("User registered successfully:", email);

    return {
      id: userId,
      fullName,
      email,
      phone,
      address,
      role: "USER",
    };

  } catch (error) {
    console.error("Register error:", error);

    // Xử lý trường hợp email bị trùng
    const errorMessage = String(error).toLowerCase();

    if (errorMessage.includes("unique")) {
      throw new Error("Email này đã được đăng ký.");
    }

    throw new Error("Đăng ký thất bại. Vui lòng thử lại.");
  }
}

// Kiểu dữ liệu tài khoản đăng nhập
export type UserRole = "USER" | "ADMIN";

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
}

// Hàm đăng nhập
export async function loginUser(
  emailInput: string,
  passwordInput: string
): Promise<AuthenticatedUser> {

  // 1. Chuẩn hóa email
  const email = emailInput.trim().toLowerCase();

  // 2. Kiểm tra dữ liệu nhập
  if (!email || !passwordInput) {
    throw new Error("Vui lòng nhập email và mật khẩu.");
  }

  // 3. Khởi tạo database
  await initDatabase();

  const db = await getDatabase();

  // 4. Kiểm tra email và mật khẩu
  const user = await db.getFirstAsync<AuthenticatedUser>(
    `
      SELECT
        id,
        fullName,
        email,
        phone,
        address,
        role
      FROM users
      WHERE email = ? AND password = ?
    `,
    email,
    passwordInput
  );

  // 5. Nếu không tìm thấy tài khoản
  if (!user) {
    throw new Error("Email hoặc mật khẩu không chính xác.");
  }

  // 6. Lưu phiên đăng nhập
  await db.runAsync(
    `
      INSERT INTO auth_sessions (id, userId)
      VALUES (1, ?)
      ON CONFLICT(id)
      DO UPDATE SET userId = excluded.userId
    `,
    user.id
  );

  console.log("Login successful:", user);

  return user;
}

// Lấy thông tin tài khoản đang đăng nhập
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  await initDatabase();

  const db = await getDatabase();

  const user = await db.getFirstAsync<AuthenticatedUser>(`
    SELECT
      users.id,
      users.fullName,
      users.email,
      users.phone,
      users.address,
      users.role
    FROM auth_sessions
    INNER JOIN users
      ON auth_sessions.userId = users.id
    WHERE auth_sessions.id = 1
  `);

  return user;
}

// Đăng xuất
export async function logoutUser() {
  const db = await getDatabase();

  await db.runAsync(
    "DELETE FROM auth_sessions WHERE id = 1"
  );

  console.log("Logout successful!");
}
