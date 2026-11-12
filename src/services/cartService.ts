
import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";
import type { Product } from "../types/product";

export interface CartItem extends Product {
  quantity: number;
}

// Kiểm tra người dùng đã đăng nhập
async function getLoggedInUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Bạn cần đăng nhập để sử dụng giỏ hàng.");
  }

  return user;
}

// 1. Lấy danh sách sản phẩm trong giỏ hàng
export async function getCartItems(): Promise<CartItem[]> {
  await initDatabase();

  const user = await getLoggedInUser();
  const db = await getDatabase();

  return db.getAllAsync<CartItem>(
    `
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
      p.rating,
      ci.quantity
    FROM cart_items ci
    INNER JOIN products p ON ci.productId = p.id
    LEFT JOIN categories c ON p.categoryId = c.id
    WHERE ci.userId = ?
    ORDER BY p.name ASC
    `,
    user.id
  );
}

// 2. Thêm sản phẩm vào giỏ hàng
export async function addToCart(
  productId: string,
  quantity: number = 1
): Promise<void> {
  await initDatabase();

  const user = await getLoggedInUser();
  const db = await getDatabase();

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Số lượng sản phẩm không hợp lệ.");
  }

  await db.withTransactionAsync(async () => {
    // Kiểm tra sản phẩm có tồn tại không
    const product = await db.getFirstAsync<{
      id: string;
      stock: number;
    }>(
      "SELECT id, stock FROM products WHERE id = ?",
      productId
    );

    if (!product) {
      throw new Error("Sản phẩm không tồn tại.");
    }

    if (product.stock <= 0) {
      throw new Error("Sản phẩm hiện đã hết hàng.");
    }

    // Kiểm tra sản phẩm đã có trong giỏ hàng chưa
    const existingItem = await db.getFirstAsync<{
      quantity: number;
    }>(
      `SELECT quantity
       FROM cart_items
       WHERE userId = ? AND productId = ?`,
      user.id,
      productId
    );

    const newQuantity = (existingItem?.quantity ?? 0) + quantity;

    if (newQuantity > product.stock) {
      throw new Error(
        `Số lượng vượt quá tồn kho. Hiện chỉ còn ${product.stock} sản phẩm.`
      );
    }

    if (existingItem) {
      // Nếu đã có thì cập nhật số lượng
      await db.runAsync(
        `UPDATE cart_items
         SET quantity = ?
         WHERE userId = ? AND productId = ?`,
        newQuantity,
        user.id,
        productId
      );
    } else {
      // Nếu chưa có thì thêm mới
      await db.runAsync(
        `INSERT INTO cart_items (userId, productId, quantity)
         VALUES (?, ?, ?)`,
        user.id,
        productId,
        quantity
      );
    }
  });
}

// 3. Cập nhật số lượng sản phẩm trong giỏ
export async function updateCartItemQuantity(
  productId: string,
  quantity: number
): Promise<void> {
  const user = await getLoggedInUser();
  const db = await getDatabase();

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Số lượng phải là số nguyên lớn hơn 0.");
  }

  const product = await db.getFirstAsync<{ stock: number }>(
    "SELECT stock FROM products WHERE id = ?",
    productId
  );

  if (!product) {
    throw new Error("Sản phẩm không tồn tại.");
  }

  if (quantity > product.stock) {
    throw new Error(
      `Số lượng vượt quá tồn kho. Hiện chỉ còn ${product.stock} sản phẩm.`
    );
  }

  const result = await db.runAsync(
    `UPDATE cart_items
     SET quantity = ?
     WHERE userId = ? AND productId = ?`,
    quantity,
    user.id,
    productId
  );

  if (result.changes === 0) {
    throw new Error("Không tìm thấy sản phẩm trong giỏ hàng.");
  }
}

// 4. Xóa một sản phẩm khỏi giỏ hàng
export async function removeCartItem(
  productId: string
): Promise<void> {
  const user = await getLoggedInUser();
  const db = await getDatabase();

  await db.runAsync(
    `DELETE FROM cart_items
     WHERE userId = ? AND productId = ?`,
    user.id,
    productId
  );
}
