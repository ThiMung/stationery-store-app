
import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export interface AdminOrderSummary {
  id: string;
  userId: string | null;
  recipientName: string;
  email: string | null;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string | null;
  itemCount: number;
  phone: string;
  address: string;
}

export interface AdminOrderItem {
  id: number;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  items: AdminOrderItem[];
}

// Kiểm tra quyền Admin
async function checkAdmin() {
  await initDatabase();

  const user = await getCurrentUser();

  if (!user || user.role !== "ADMIN") {
    throw new Error("Bạn không có quyền quản lý đơn hàng.");
  }

  return user;
}

// 1. Lấy danh sách tất cả đơn hàng
export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  await checkAdmin();

  const db = await getDatabase();

  return db.getAllAsync<AdminOrderSummary>(`
    SELECT
      o.id,
      o.userId,
      o.recipientName,
      u.email,
      o.totalAmount,
      o.status,
      o.createdAt,
      o.phone,
      o.address,
      (
        SELECT COUNT(*)
        FROM order_items oi
        WHERE oi.orderId = o.id
      ) AS itemCount
    FROM orders o
    LEFT JOIN users u ON o.userId = u.id
    ORDER BY o.createdAt DESC
  `);
}

// 2. Lấy chi tiết một đơn hàng
export async function getAdminOrderDetails(
  orderId: string
): Promise<AdminOrderDetail> {
  await checkAdmin();

  const db = await getDatabase();

  const order = await db.getFirstAsync<AdminOrderSummary>(
    `
    SELECT
      o.id,
      o.userId,
      o.recipientName,
      u.email,
      o.totalAmount,
      o.status,
      o.createdAt,
      o.phone,
      o.address,
      (
        SELECT COUNT(*)
        FROM order_items oi
        WHERE oi.orderId = o.id
      ) AS itemCount
    FROM orders o
    LEFT JOIN users u ON o.userId = u.id
    WHERE o.id = ?
    `,
    orderId
  );

  if (!order) {
    throw new Error("Không tìm thấy đơn hàng.");
  }

  const items = await db.getAllAsync<AdminOrderItem>(
    `
    SELECT
      id,
      productId,
      productName,
      unitPrice,
      quantity
    FROM order_items
    WHERE orderId = ?
    ORDER BY id ASC
    `,
    orderId
  );

  return {
    ...order,
    items,
  };
}

// Các trạng thái tiếp theo được phép
const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

// 3. Cập nhật trạng thái đơn hàng
export async function updateAdminOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  await checkAdmin();

  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const order = await db.getFirstAsync<{ status: string }>(
      "SELECT status FROM orders WHERE id = ?",
      orderId
    );

    if (!order) {
      throw new Error("Không tìm thấy đơn hàng.");
    }

    const currentStatus = order.status as OrderStatus;

    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}.`
      );
    }

    // Nếu hủy đơn, hoàn lại số lượng tồn kho
    if (newStatus === "CANCELLED") {
      const orderItems = await db.getAllAsync<{
        productId: string | null;
        quantity: number;
        productName: string;
      }>(
        `
        SELECT productId, quantity, productName
        FROM order_items
        WHERE orderId = ?
        `,
        orderId
      );

      for (const item of orderItems) {
        // Bỏ qua sản phẩm không còn liên kết với ID sản phẩm
        if (!item.productId) {
          continue;
        }

        const stockResult = await db.runAsync(
          `
          UPDATE products
          SET stock = stock + ?
          WHERE id = ?
          `,
          item.quantity,
          item.productId
        );

        if (stockResult.changes === 0) {
          throw new Error(
            `Không thể hoàn lại tồn kho cho sản phẩm ${item.productName}.`
          );
        }
      }
    }

    // Cập nhật trạng thái
    const result = await db.runAsync(
      "UPDATE orders SET status = ? WHERE id = ?",
      newStatus,
      orderId
    );

    if (result.changes === 0) {
      throw new Error("Không thể cập nhật trạng thái đơn hàng.");
    }
  });
}
