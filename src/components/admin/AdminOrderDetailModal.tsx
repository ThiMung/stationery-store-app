import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { AdminOrderDetail, OrderStatus } from "../../types/order";
import {
  formatOrderDate,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../types/order";

interface AdminOrderDetailModalProps {
  order: AdminOrderDetail | null;
  loading: boolean;
  updating: boolean;
  nextStatuses: OrderStatus[];
  onClose: () => void;
  onUpdateStatus: (newStatus: OrderStatus) => void;
  onConfirmPayment: () => void;
}

export default function AdminOrderDetailModal({
  order,
  loading,
  updating,
  nextStatuses,
  onClose,
  onUpdateStatus,
  onConfirmPayment,
}: AdminOrderDetailModalProps) {
  const visible = order !== null || loading;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!updating) onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#338DA3" />
              <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
            </View>
          ) : order ? (
            <>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
                <Pressable onPress={onClose} disabled={updating}>
                  <Text style={styles.closeButton}>✕</Text>
                </Pressable>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={styles.label}>Mã đơn hàng</Text>
                <Text style={styles.value}>{order.id}</Text>

                <Text style={styles.label}>Ngày đặt</Text>
                <Text style={styles.value}>{formatOrderDate(order.createdAt)}</Text>

                <Text style={styles.label}>Trạng thái hiện tại</Text>
                <Text style={styles.statusValue}>
                  {getOrderStatusLabel(order.status)}
                </Text>

                <Text style={styles.label}>Phương thức thanh toán</Text>
                <Text style={styles.value}>
                  {getPaymentMethodLabel(order.paymentMethod)}
                </Text>

                <Text style={styles.label}>Trạng thái thanh toán</Text>
                <Text
                  style={[
                    styles.paymentStatusText,
                    order.paymentStatus === "PAID"
                      ? styles.paidText
                      : order.paymentStatus === "WAITING_TRANSFER"
                      ? styles.waitingText
                      : styles.unpaidText,
                  ]}
                >
                  {getPaymentStatusLabel(order.paymentStatus)}
                </Text>

                {/* Nút xác nhận thanh toán chuyển khoản cho Admin */}
                {order.paymentMethod === "BANK_TRANSFER" &&
                  order.paymentStatus === "WAITING_TRANSFER" &&
                  order.status !== "CANCELLED" && (
                    <Pressable
                      style={styles.confirmPaymentButton}
                      onPress={onConfirmPayment}
                      disabled={updating}
                    >
                      <Text style={styles.confirmPaymentButtonText}>
                        ✓ Xác nhận đã nhận tiền
                      </Text>
                    </Pressable>
                  )}

                <View style={styles.separator} />

                <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>
                <Text style={styles.label}>Người nhận</Text>
                <Text style={styles.value}>{order.recipientName}</Text>

                <Text style={styles.label}>Email tài khoản</Text>
                <Text style={styles.value}>
                  {order.email ?? "Không còn tài khoản"}
                </Text>

                <Text style={styles.label}>Số điện thoại</Text>
                <Text style={styles.value}>{order.phone}</Text>

                <Text style={styles.label}>Địa chỉ</Text>
                <Text style={styles.value}>{order.address}</Text>

                <View style={styles.separator} />

                <Text style={styles.sectionTitle}>Sản phẩm trong đơn</Text>
                {order.items.map((item) => (
                  <View key={String(item.id)} style={styles.itemRow}>
                    <View style={styles.itemInfo}>
                      <Text style={styles.productName}>{item.productName}</Text>
                      <Text style={styles.itemQuantity}>
                        {item.unitPrice.toLocaleString("vi-VN")} đ × {item.quantity}
                      </Text>
                    </View>
                    <Text style={styles.itemTotal}>
                      {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} đ
                    </Text>
                  </View>
                ))}

                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tổng tiền</Text>
                  <Text style={styles.totalPrice}>
                    {order.totalAmount.toLocaleString("vi-VN")} đ
                  </Text>
                </View>

                <View style={styles.separator} />

                <Text style={styles.sectionTitle}>Cập nhật trạng thái</Text>
                {updating ? (
                  <ActivityIndicator color="#338DA3" />
                ) : nextStatuses.length > 0 ? (
                  <View style={styles.statusActions}>
                    {nextStatuses.map((status) => (
                      <Pressable
                        key={status}
                        style={[
                          styles.statusButton,
                          status === "CANCELLED"
                            ? styles.cancelButton
                            : styles.updateButton,
                        ]}
                        onPress={() => onUpdateStatus(status)}
                      >
                        <Text style={styles.statusButtonText}>
                          {status === "CANCELLED"
                            ? "Hủy đơn hàng"
                            : `Chuyển sang ${getOrderStatusLabel(status)}`}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.terminalText}>
                    Đơn hàng đã kết thúc, không thể cập nhật thêm trạng thái.
                  </Text>
                )}
              </ScrollView>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "85%",
  },
  loadingContainer: {
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    color: "#777777",
    marginTop: 10,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  closeButton: {
    fontSize: 20,
    color: "#888888",
    padding: 5,
  },
  label: {
    fontSize: 12,
    color: "#777777",
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    color: "#333333",
    marginTop: 2,
  },
  statusValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#338DA3",
    marginTop: 2,
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 2,
  },
  paidText: {
    color: "#137333",
  },
  waitingText: {
    color: "#B06000",
  },
  unpaidText: {
    color: "#5F6368",
  },
  confirmPaymentButton: {
    backgroundColor: "#2E7D32",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginTop: 12,
    alignItems: "center",
  },
  confirmPaymentButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "500",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  itemTotal: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E76F51",
  },
  statusActions: {
    gap: 8,
    marginTop: 8,
  },
  statusButton: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#338DA3",
  },
  cancelButton: {
    backgroundColor: "#E53935",
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  terminalText: {
    color: "#888888",
    fontSize: 13,
    fontStyle: "italic",
    marginTop: 4,
  },
});
