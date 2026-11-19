import { getDatabase, initDatabase } from "../database/database";
import { getCurrentUser } from "./authService";
import type {
  CheckoutInput,
  CreatedOrder,
  OrderDetail,
  OrderItemDetail,
  OrderSummary,
  PaymentMethod,
  PaymentStatus,
} from "../types/order";

export type {
  CheckoutInput,
  CreatedOrder,
  OrderDetail,
  OrderItemDetail,
  OrderSummary,
};

interface CheckoutCartRow {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

// Kiểm tra và chuẩn hóa thông tin người nhận
function validateCheckoutInput(input: CheckoutInput) {
  const recipientName = input.recipientName.trim();
  const phone = input.phone.trim();
  const address = input.address.trim();

  if (!recipientName) throw new Error("Vui lòng nhập tên người nhận.");
  if (recipientName.length > 100) {
    throw new Error("Tên người nhận không được vượt quá 100 ký tự.");
  }

  const phoneDigits = phone.replace(/\D/g, "");
  if (phoneDigits.length < 9 || phoneDigits.length > 11) {
    throw new Error("Số điện thoại phải có từ 9 đến 11 chữ số.");
  }

  if (!address) throw new Error("Vui lòng nhập địa chỉ nhận hàng.");
  if (address.length > 250) {
    throw new Error("Địa chỉ không được vượt quá 250 ký tự.");
  }

  return { recipientName, phone, address };
}

// Tạo đơn hàng từ giỏ hàng hiện tại với phương thức thanh toán đã chọn
export async function createOrder(input: CheckoutInput): Promise<CreatedOrder> {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user) throw new Error("Bạn cần đăng nhập để đặt hàng.");

  const { recipientName, phone, address } = validateCheckoutInput(input);
  const paymentMethod: PaymentMethod =
    input.paymentMethod === "BANK_TRANSFER" ? "BANK_TRANSFER" : "COD";
  const paymentStatus: PaymentStatus =
    paymentMethod === "BANK_TRANSFER" ? "WAITING_TRANSFER" : "UNPAID";

  const db = await getDatabase();
  const orderId = `ORDER_${Date.now()}`;
  const createdAt = new Date().toISOString();
  let createdOrder: CreatedOrder | null = null;

  await db.withTransactionAsync(async () => {
    // Lấy giỏ hàng và giá, tồn kho mới nhất từ SQLite
    const cartItems = await db.getAllAsync<CheckoutCartRow>(
      `SELECT p.id AS productId, p.name AS productName, p.price AS unitPrice, ci.quantity, p.stock
       FROM cart_items ci
       INNER JOIN products p ON ci.productId = p.id
       WHERE ci.userId = ?`,
      user.id
    );

    if (cartItems.length === 0) {
      throw new Error("Giỏ hàng đang trống.");
    }

    let totalAmount = 0;
    for (const item of cartItems) {
      if (item.quantity < 1) {
        throw new Error(`Số lượng của sản phẩm ${item.productName} không hợp lệ.`);
      }
      if (item.stock < item.quantity) {
        throw new Error(
          `Sản phẩm "${item.productName}" không đủ số lượng trong kho. Hiện chỉ còn ${item.stock} sản phẩm.`
        );
      }
      totalAmount += item.unitPrice * item.quantity;
    }

    // Lưu thông tin đơn hàng cùng phương thức & trạng thái thanh toán
    await db.runAsync(
      `INSERT INTO orders (
        id, userId, totalAmount, status, recipientName, phone, address,
        paymentMethod, paymentStatus, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      orderId,
      user.id,
      totalAmount,
      "PENDING",
      recipientName,
      phone,
      address,
      paymentMethod,
      paymentStatus,
      createdAt
    );

    // Lưu chi tiết từng sản phẩm và trừ tồn kho
    for (const item of cartItems) {
      await db.runAsync(
        `INSERT INTO order_items (orderId, productId, productName, unitPrice, quantity)
         VALUES (?, ?, ?, ?, ?)`,
        orderId,
        item.productId,
        item.productName,
        item.unitPrice,
        item.quantity
      );

      const stockResult = await db.runAsync(
        "UPDATE products SET stock = stock - ? WHERE id = ? AND stock >= ?",
        item.quantity,
        item.productId,
        item.quantity
      );

      if (stockResult.changes === 0) {
        throw new Error(
          `Không thể cập nhật tồn kho của "${item.productName}". Vui lòng thử lại.`
        );
      }
    }

    // Xóa sạch giỏ hàng sau khi tạo đơn thành công
    await db.runAsync("DELETE FROM cart_items WHERE userId = ?", user.id);

    createdOrder = {
      orderId,
      totalAmount,
      itemCount: cartItems.length,
      paymentMethod,
      paymentStatus,
    };
  });

  if (!createdOrder) {
    throw new Error("Không thể tạo đơn hàng.");
  }

  return createdOrder;
}

// 1. Lấy danh sách đơn hàng của người dùng đang đăng nhập
export async function getUserOrders(): Promise<OrderSummary[]> {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user) throw new Error("Bạn cần đăng nhập để xem lịch sử đơn hàng.");

  const db = await getDatabase();
  return db.getAllAsync<OrderSummary>(
    `SELECT
       o.id, o.totalAmount, o.status, o.recipientName, o.createdAt,
       o.paymentMethod, o.paymentStatus,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) AS itemCount
     FROM orders o
     WHERE o.userId = ?
     ORDER BY o.createdAt DESC`,
    user.id
  );
}

// 2. Lấy chi tiết một đơn hàng của người dùng đang đăng nhập
export async function getOrderDetails(orderId: string): Promise<OrderDetail> {
  await initDatabase();
  const user = await getCurrentUser();
  if (!user) throw new Error("Bạn cần đăng nhập để xem đơn hàng.");

  const db = await getDatabase();
  const order = await db.getFirstAsync<OrderSummary & { phone: string; address: string }>(
    `SELECT
       o.id, o.totalAmount, o.status, o.recipientName, o.createdAt,
       o.phone, o.address, o.paymentMethod, o.paymentStatus,
       (SELECT COUNT(*) FROM order_items oi WHERE oi.orderId = o.id) AS itemCount
     FROM orders o
     WHERE o.id = ? AND o.userId = ?`,
    orderId,
    user.id
  );

  if (!order) throw new Error("Không tìm thấy đơn hàng.");

  const items = await db.getAllAsync<OrderItemDetail>(
    `SELECT id, productId, productName, unitPrice, quantity
     FROM order_items
     WHERE orderId = ?
     ORDER BY id ASC`,
    orderId
  );

  return { ...order, items };
}
