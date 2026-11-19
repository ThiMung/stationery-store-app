import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { AdminOrderSummary } from "../../types/order";
import {
  formatOrderDate,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../types/order";

interface AdminOrderCardProps {
  order: AdminOrderSummary;
  onPress: (orderId: string) => void;
}

export default function AdminOrderCard({ order, onPress }: AdminOrderCardProps) {
  return (
    <Pressable style={styles.orderCard} onPress={() => onPress(order.id)}>
      <View style={styles.orderHeader}>
        <View style={styles.orderInfo}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.customerName}>Người nhận: {order.recipientName}</Text>
          <Text style={styles.email}>
            {order.email ?? "Tài khoản không còn tồn tại"}
          </Text>
        </View>
        <Text style={styles.statusBadge}>{getOrderStatusLabel(order.status)}</Text>
      </View>

      <View style={styles.separator} />

      {/* Hiển thị phương thức và trạng thái thanh toán */}
      <View style={styles.paymentRow}>
        <Text style={styles.paymentMethodText}>
          {getPaymentMethodLabel(order.paymentMethod)}
        </Text>
        <Text
          style={[
            styles.paymentStatusBadge,
            order.paymentStatus === "PAID"
              ? styles.paidBadge
              : order.paymentStatus === "WAITING_TRANSFER"
              ? styles.waitingBadge
              : styles.unpaidBadge,
          ]}
        >
          {getPaymentStatusLabel(order.paymentStatus)}
        </Text>
      </View>

      <View style={styles.separator} />

      <View style={styles.orderFooter}>
        <View>
          <Text style={styles.orderDate}>{formatOrderDate(order.createdAt)}</Text>
          <Text style={styles.itemCount}>{order.itemCount} loại sản phẩm</Text>
        </View>
        <Text style={styles.totalPrice}>
          {order.totalAmount.toLocaleString("vi-VN")} đ
        </Text>
      </View>

      <Text style={styles.detailLink}>Xem chi tiết và cập nhật trạng thái →</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  orderCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderInfo: {
    flex: 1,
    marginRight: 10,
  },
  orderId: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  customerName: {
    fontSize: 13,
    color: "#555555",
    marginTop: 4,
  },
  email: {
    fontSize: 12,
    color: "#888888",
    marginTop: 2,
  },
  statusBadge: {
    color: "#338DA3",
    fontWeight: "bold",
    fontSize: 13,
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 10,
  },
  paymentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  paymentMethodText: {
    fontSize: 12,
    color: "#555555",
    fontWeight: "500",
  },
  paymentStatusBadge: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  paidBadge: {
    backgroundColor: "#E6F4EA",
    color: "#137333",
  },
  waitingBadge: {
    backgroundColor: "#FEF7E0",
    color: "#B06000",
  },
  unpaidBadge: {
    backgroundColor: "#F1F3F4",
    color: "#5F6368",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDate: {
    fontSize: 12,
    color: "#777777",
  },
  itemCount: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E76F51",
  },
  detailLink: {
    color: "#338DA3",
    fontSize: 13,
    fontWeight: "bold",
    marginTop: 12,
    textAlign: "right",
  },
});
