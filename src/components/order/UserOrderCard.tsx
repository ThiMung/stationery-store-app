import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { OrderSummary } from "../../types/order";
import {
  formatOrderDate,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../types/order";

interface UserOrderCardProps {
  order: OrderSummary;
}

export default function UserOrderCard({ order }: UserOrderCardProps) {
  return (
    <Pressable
      style={styles.orderCard}
      onPress={() =>
        router.push({
          pathname: "/orders/[id]",
          params: { id: order.id },
        })
      }
    >
      <View style={styles.orderHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.orderId}>{order.id}</Text>
          <Text style={styles.orderDate}>{formatOrderDate(order.createdAt)}</Text>
        </View>
        <Text style={styles.status}>{getOrderStatusLabel(order.status)}</Text>
      </View>

      <View style={styles.separator} />

      {/* Thông tin phương thức và trạng thái thanh toán */}
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
          <Text style={styles.itemCount}>{order.itemCount} loại sản phẩm</Text>
          <Text style={styles.totalLabel}>Tổng tiền</Text>
        </View>
        <Text style={styles.totalPrice}>
          {order.totalAmount.toLocaleString("vi-VN")} đ
        </Text>
      </View>

      <Text style={styles.detailLink}>Xem chi tiết đơn hàng →</Text>
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
  orderId: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  orderDate: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },
  status: {
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
  itemCount: {
    fontSize: 12,
    color: "#777777",
  },
  totalLabel: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "600",
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
