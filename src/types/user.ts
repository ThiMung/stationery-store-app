// Định nghĩa kiểu dữ liệu người dùng và phân quyền
export type UserRole = "USER" | "ADMIN";

export interface AuthenticatedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
}

export interface RegisterUserInput {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
}

export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: UserRole;
  createdAt: string | null;
}
