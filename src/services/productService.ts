
import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";
import type { Product } from "../types/product";

// Dữ liệu đầu vào khi thêm hoặc sửa sản phẩm
export interface ProductInput {
  name: string;
  description: string;
  price: number;
  image: string;
  categoryId: string;
  brand: string;
  stock: number;
  rating: number;
}

// Kiểm tra quyền Admin
async function checkAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Bạn không có quyền quản lý sản phẩm.");
  }

  return currentUser;
}

// Kiểm tra và chuẩn hóa dữ liệu sản phẩm
function validateProduct(input: ProductInput): ProductInput {
  const name = input.name.trim();
  const categoryId = input.categoryId.trim();

  if (!name) {
    throw new Error("Vui lòng nhập tên sản phẩm.");
  }

  if (name.length > 100) {
    throw new Error("Tên sản phẩm không được vượt quá 100 ký tự.");
  }

  if (!categoryId) {
    throw new Error("Vui lòng chọn danh mục sản phẩm.");
  }

  if (!Number.isInteger(input.price) || input.price <= 0) {
    throw new Error("Giá sản phẩm phải là số nguyên lớn hơn 0.");
  }

  if (!Number.isInteger(input.stock) || input.stock < 0) {
    throw new Error("Số lượng tồn kho phải là số nguyên không âm.");
  }

  if (
    !Number.isFinite(input.rating) ||
    input.rating < 0 ||
    input.rating > 5
  ) {
    throw new Error("Đánh giá phải nằm trong khoảng từ 0 đến 5.");
  }

  return {
    ...input,
    name,
    categoryId,
    description: input.description.trim(),
    image: input.image.trim(),
    brand: input.brand.trim(),
  };
}

// Kiểm tra danh mục có tồn tại không
async function checkCategory(categoryId: string) {
  const db = await getDatabase();

  const category = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM categories WHERE id = ?",
    categoryId
  );

  if (!category) {
    throw new Error("Danh mục được chọn không tồn tại.");
  }
}

// 1. Lấy danh sách sản phẩm
export async function getManagedProducts(): Promise<Product[]> {
  await initDatabase();
  await checkAdmin();

  const db = await getDatabase();

  return db.getAllAsync<Product>(`
    SELECT
      p.id,
      p.name,
      p.description,
      p.price,
      p.image,
      p.categoryId,
      c.name AS categoryName,
      p.brand,
      p.stock,
      p.rating
    FROM products p
    LEFT JOIN categories c ON p.categoryId = c.id
    ORDER BY p.id DESC
  `);
}

// 2. Thêm sản phẩm
export async function addProduct(
  input: ProductInput
): Promise<void> {
  await initDatabase();
  await checkAdmin();

  const product = validateProduct(input);

  const db = await getDatabase();

  await checkCategory(product.categoryId);

  const productId = `SP_${Date.now()}`;

  await db.runAsync(
    `INSERT INTO products (
      id,
      name,
      description,
      price,
      image,
      categoryId,
      brand,
      stock,
      rating,
      isFeatured
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)`,
    productId,
    product.name,
    product.description || null,
    product.price,
    product.image || null,
    product.categoryId,
    product.brand || null,
    product.stock,
    product.rating
  );
}

// 3. Chỉnh sửa sản phẩm
export async function updateProduct(
  productId: string,
  input: ProductInput
): Promise<void> {
  await checkAdmin();

  const product = validateProduct(input);
  const db = await getDatabase();

  await checkCategory(product.categoryId);

  const result = await db.runAsync(
    `UPDATE products
     SET
       name = ?,
       description = ?,
       price = ?,
       image = ?,
       categoryId = ?,
       brand = ?,
       stock = ?,
       rating = ?
     WHERE id = ?`,
    product.name,
    product.description || null,
    product.price,
    product.image || null,
    product.categoryId,
    product.brand || null,
    product.stock,
    product.rating,
    productId
  );

  if (result.changes === 0) {
    throw new Error("Không tìm thấy sản phẩm cần chỉnh sửa.");
  }
}

// 4. Xóa sản phẩm
export async function deleteProduct(
  productId: string
): Promise<void> {
  await checkAdmin();

  const db = await getDatabase();

  const product = await db.getFirstAsync<{ id: string }>(
    "SELECT id FROM products WHERE id = ?",
    productId
  );

  if (!product) {
    throw new Error("Không tìm thấy sản phẩm.");
  }

  // Không xóa sản phẩm đã xuất hiện trong đơn hàng
  const orderResult = await db.getFirstAsync<{ total: number }>(
    "SELECT COUNT(*) AS total FROM order_items WHERE productId = ?",
    productId
  );

  if ((orderResult?.total ?? 0) > 0) {
    throw new Error(
      "Sản phẩm đã xuất hiện trong đơn hàng. " +
      "Không thể xóa để bảo toàn lịch sử mua hàng."
    );
  }

  // Xóa các dữ liệu phụ thuộc trước khi xóa sản phẩm
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      "DELETE FROM favorites WHERE productId = ?",
      productId
    );

    await db.runAsync(
      "DELETE FROM cart_items WHERE productId = ?",
      productId
    );

    const result = await db.runAsync(
      "DELETE FROM products WHERE id = ?",
      productId
    );

    if (result.changes === 0) {
      throw new Error("Không thể xóa sản phẩm.");
    }
  });
}
