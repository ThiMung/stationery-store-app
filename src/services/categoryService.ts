
import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";
import type { Category } from "../types/category";

export interface ManagedCategory extends Category {
  productCount: number;
}

// Kiểm tra quyền Admin
async function checkAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Bạn không có quyền quản lý danh mục.");
  }

  return currentUser;
}

// Kiểm tra tên danh mục đã tồn tại chưa
async function checkDuplicateName(
  name: string,
  excludeId?: string
) {
  const db = await getDatabase();

  const existingCategory = await db.getFirstAsync<{ id: string }>(
    excludeId
      ? `SELECT id FROM categories
         WHERE name = ? COLLATE NOCASE AND id != ?`
      : `SELECT id FROM categories
         WHERE name = ? COLLATE NOCASE`,
    ...(excludeId ? [name, excludeId] : [name])
  );

  if (existingCategory) {
    throw new Error("Tên danh mục này đã tồn tại.");
  }
}

// 1. Lấy danh sách danh mục và số sản phẩm tương ứng
export async function getManagedCategories(): Promise<ManagedCategory[]> {
  await initDatabase();
  await checkAdmin();

  const db = await getDatabase();

  return db.getAllAsync<ManagedCategory>(`
    SELECT
      c.id,
      c.name,
      c.image,
      COUNT(p.id) AS productCount
    FROM categories c
    LEFT JOIN products p ON c.id = p.categoryId
    GROUP BY c.id, c.name, c.image
    ORDER BY c.id ASC
  `);
}

// 2. Thêm danh mục
export async function addCategory(nameInput: string): Promise<void> {
  await initDatabase();
  await checkAdmin();

  const name = nameInput.trim();

  if (!name) {
    throw new Error("Vui lòng nhập tên danh mục.");
  }

  if (name.length > 50) {
    throw new Error("Tên danh mục không được vượt quá 50 ký tự.");
  }

  await checkDuplicateName(name);

  const db = await getDatabase();
  const categoryId = `CAT_${Date.now()}`;

  await db.runAsync(
    `INSERT INTO categories (id, name, image)
     VALUES (?, ?, NULL)`,
    categoryId,
    name
  );
}

// 3. Chỉnh sửa danh mục
export async function updateCategory(
  categoryId: string,
  nameInput: string
): Promise<void> {
  await checkAdmin();

  const name = nameInput.trim();

  if (!name) {
    throw new Error("Vui lòng nhập tên danh mục.");
  }

  if (name.length > 50) {
    throw new Error("Tên danh mục không được vượt quá 50 ký tự.");
  }

  await checkDuplicateName(name, categoryId);

  const db = await getDatabase();

  const result = await db.runAsync(
    `UPDATE categories
     SET name = ?
     WHERE id = ?`,
    name,
    categoryId
  );

  if (result.changes === 0) {
    throw new Error("Không tìm thấy danh mục cần chỉnh sửa.");
  }
}

// 4. Xóa danh mục
export async function deleteCategory(
  categoryId: string
): Promise<void> {
  await checkAdmin();

  const db = await getDatabase();

  const category = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM categories WHERE id = ?",
    categoryId
  );

  if (!category) {
    throw new Error("Không tìm thấy danh mục.");
  }

  // Kiểm tra sản phẩm đang thuộc danh mục
  const result = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM products WHERE categoryId = ?",
    categoryId
  );

  if ((result?.total ?? 0) > 0) {
    throw new Error(
      `Danh mục đang có ${result?.total} sản phẩm. ` +
      "Vui lòng chuyển các sản phẩm sang danh mục khác hoặc xóa sản phẩm trước."
    );
  }

  await db.runAsync(
    "DELETE FROM categories WHERE id = ?",
    categoryId
  );
}
