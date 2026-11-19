import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";
import type {
  AdminOrderDetail,
  AdminOrderItem,
  AdminOrderSummary,
  OrderStatus,
} from "../types/order";

export type { AdminOrderDetail, AdminOrderItem, AdminOrderSummary, OrderStatus };

// Kiểm tra quyền Admin
async function checkAdmin() {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    throw new Error("Bạn không có quyền quản lý đơn hàng.");
  }
  return user;
}

// 1. Lấy danh sách tất cả đơn hàng cho Admin
export async function getAdminOrders(): Promise<AdminOrderSummary[]> {
  await checkAdmin();
  const db = await getDatabase();

  return db.getAllAsync<AdminOrderSummary>(`
    SELECT
      o.id, o.userId, o.recipientName, u.email, o.totalAmount, o.status,
      o.createdAt, o.phone, o.address, o.paymentMethod, o.paymentStatus,
      (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) AS itemCount
    FROM orders o
    LEFT JOIN users u ON o.userId = u.id
    ORDER BY o.createdAt DESC
  `);
}

// 2. Lấy chi tiết một đơn hàng cho Admin
export async function getAdminOrderDetails(
  orderId: string
): Promise<AdminOrderDetail> {
  await checkAdmin();
  const db = await getDatabase();

  const order = await db.getFirstAsync<AdminOrderSummary>(
    `SELECT
       o.id, o.userId, o.recipientName, u.email, o.totalAmount, o.status,
       o.createdAt, o.phone, o.address, o.paymentMethod, o.paymentStatus,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) AS itemCount
     FROM orders o
     LEFT JOIN users u ON o.userId = u.id
     WHERE o.id = ?`,
    orderId
  );

  if (!order) throw new Error("Không tìm thấy đơn hàng.");

  const items = await db.getAllAsync<AdminOrderItem>(
    `SELECT id, productId, productName, unitPrice, quantity
     FROM order_items
     WHERE orderId = ?
     ORDER BY id ASC`,
    orderId
  );

  return { ...order, items };
}

// 3. Admin xác nhận đã nhận tiền chuyển khoản ngân hàng
export async function confirmAdminPayment(orderId: string): Promise<void> {
  await checkAdmin();
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const order = await db.getFirstAsync<{
      paymentMethod: string;
      paymentStatus: string;
      status: string;
    }>(
      "SELECT paymentMethod, paymentStatus, status FROM orders WHERE id = ?",
      orderId
    );

    if (!order) throw new Error("Không tìm thấy đơn hàng.");
    if (order.paymentMethod !== "BANK_TRANSFER") {
      throw new Error("Chỉ có thể xác nhận thanh toán cho đơn hàng chuyển khoản.");
    }
    if (order.paymentStatus === "PAID") {
      throw new Error("Đơn hàng này đã được xác nhận thanh toán trước đó.");
    }
    if (order.status === "CANCELLED") {
      throw new Error("Không thể xác nhận thanh toán cho đơn hàng đã hủy.");
    }

    const result = await db.runAsync(
      "UPDATE orders SET paymentStatus = 'PAID' WHERE id = ?",
      orderId
    );

    if (result.changes === 0) {
      throw new Error("Không thể cập nhật trạng thái thanh toán.");
    }
  });
}

const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["SHIPPING", "CANCELLED"],
  SHIPPING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

// 4. Cập nhật trạng thái đơn hàng kèm các quy tắc nghiệp vụ
export async function updateAdminOrderStatus(
  orderId: string,
  newStatus: OrderStatus
): Promise<void> {
  await checkAdmin();
  const db = await getDatabase();

  await db.withTransactionAsync(async () => {
    const order = await db.getFirstAsync<{
      status: string;
      paymentMethod: string;
      paymentStatus: string;
    }>(
      "SELECT status, paymentMethod, paymentStatus FROM orders WHERE id = ?",
      orderId
    );

    if (!order) throw new Error("Không tìm thấy đơn hàng.");

    const currentStatus = order.status as OrderStatus;
    if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
      throw new Error(
        `Không thể chuyển trạng thái từ ${currentStatus} sang ${newStatus}.`
      );
    }

    // Không cho phép hoàn thành đơn chuyển khoản khi chưa thanh toán
    if (
      newStatus === "COMPLETED" &&
      order.paymentMethod === "BANK_TRANSFER" &&
      order.paymentStatus !== "PAID"
    ) {
      throw new Error(
        "Không thể hoàn thành đơn chuyển khoản khi chưa được xác nhận thanh toán."
      );
    }

    // Không cho phép hủy đơn đã thanh toán bằng thao tác thông thường
    if (newStatus === "CANCELLED" && order.paymentStatus === "PAID") {
      throw new Error(
        "Không thể hủy đơn hàng đã thanh toán bằng thao tác thông thường."
      );
    }

    // Nếu hủy đơn: hoàn lại tồn kho cho sản phẩm
    if (newStatus === "CANCELLED") {
      const orderItems = await db.getAllAsync<{
        productId: string | null;
        quantity: number;
        productName: string;
      }>("SELECT productId, quantity, productName FROM order_items WHERE orderId = ?", orderId);

      for (const item of orderItems) {
        if (!item.productId) continue;
        const stockResult = await db.runAsync(
          "UPDATE products SET stock = stock + ? WHERE id = ?",
          item.quantity,
          item.productId
        );
        if (stockResult.changes === 0) {
          throw new Error(
            `Không thể hoàn lại tồn kho cho sản phẩm ${item.productName}.`
          );
        }
      }

      // Nếu đơn bị hủy khi đang chờ chuyển khoản, cập nhật paymentStatus để không còn mang nghĩa chờ
      if (order.paymentStatus === "WAITING_TRANSFER") {
        await db.runAsync(
          "UPDATE orders SET paymentStatus = 'UNPAID' WHERE id = ?",
          orderId
        );
      }
    }

    // Nếu đơn COD hoàn thành, tự động chuyển trạng thái thanh toán sang PAID
    if (newStatus === "COMPLETED" && order.paymentMethod === "COD") {
      await db.runAsync(
        "UPDATE orders SET paymentStatus = 'PAID' WHERE id = ?",
        orderId
      );
    }

    // Cập nhật trạng thái đơn hàng
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
