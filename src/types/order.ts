// Định nghĩa các kiểu dữ liệu liên quan đến Đơn hàng và Thanh toán
export type PaymentMethod = "COD" | "BANK_TRANSFER";

export type PaymentStatus = "UNPAID" | "WAITING_TRANSFER" | "PAID";

export type OrderStatus =
  | "PENDING"
  | "CONFIRMED"
  | "SHIPPING"
  | "COMPLETED"
  | "CANCELLED";

export interface CheckoutInput {
  recipientName: string;
  phone: string;
  address: string;
  paymentMethod?: PaymentMethod;
}

export interface CreatedOrder {
  orderId: string;
  totalAmount: number;
  itemCount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export interface OrderItemDetail {
  id: string | number;
  productId: string | null;
  productName: string;
  unitPrice: number;
  quantity: number;
}

export interface OrderSummary {
  id: string;
  totalAmount: number;
  status: OrderStatus;
  recipientName: string;
  createdAt: string;
  itemCount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
}

export interface OrderDetail extends OrderSummary {
  phone: string;
  address: string;
  items: OrderItemDetail[];
}

export interface AdminOrderSummary extends OrderSummary {
  userId: string | null;
  email: string | null;
  phone: string;
  address: string;
}

export interface AdminOrderDetail extends AdminOrderSummary {
  items: OrderItemDetail[];
}

export type AdminOrderItem = OrderItemDetail;

// Chuyển mã trạng thái đơn hàng sang tiếng Việt
export function getOrderStatusLabel(status: OrderStatus | string): string {
  switch (status) {
    case "PENDING":
      return "Chờ xử lý";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPING":
      return "Đang giao hàng";
    case "COMPLETED":
      return "Đã hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

// Chuyển mã phương thức thanh toán sang tiếng Việt
export function getPaymentMethodLabel(method: PaymentMethod | string): string {
  switch (method) {
    case "BANK_TRANSFER":
      return "Chuyển khoản ngân hàng";
    case "COD":
    default:
      return "Thanh toán khi nhận hàng (COD)";
  }
}

// Chuyển mã trạng thái thanh toán sang tiếng Việt
export function getPaymentStatusLabel(status: PaymentStatus | string): string {
  switch (status) {
    case "WAITING_TRANSFER":
      return "Chờ xác nhận thanh toán";
    case "PAID":
      return "Đã thanh toán";
    case "UNPAID":
    default:
      return "Chưa thanh toán";
  }
}

// Định dạng ngày giờ chuẩn tiếng Việt
export function formatOrderDate(dateString: string | null): string {
  if (!dateString) return "Chưa có thông tin";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  return date.toLocaleString("vi-VN");
}
