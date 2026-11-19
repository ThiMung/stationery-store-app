import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { OrderDetail } from "../../types/order";
import {
  formatOrderDate,
  getOrderStatusLabel,
  getPaymentMethodLabel,
  getPaymentStatusLabel,
} from "../../types/order";

interface OrderDetailInfoProps {
  order: OrderDetail;
}

export default function OrderDetailInfo({ order }: OrderDetailInfoProps) {
  return (
    <>
      {/* 1. Thông tin đơn hàng & thanh toán */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>

        <Text style={styles.label}>Mã đơn hàng</Text>
        <Text style={styles.value}>{order.id}</Text>

        <Text style={styles.label}>Ngày đặt</Text>
        <Text style={styles.value}>{formatOrderDate(order.createdAt)}</Text>

        <Text style={styles.label}>Trạng thái đơn hàng</Text>
        <Text style={styles.status}>{getOrderStatusLabel(order.status)}</Text>

        <Text style={styles.label}>Phương thức thanh toán</Text>
        <Text style={styles.value}>{getPaymentMethodLabel(order.paymentMethod)}</Text>

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
      </View>

      {/* 2. Thông tin nhận hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Thông tin nhận hàng</Text>

        <Text style={styles.label}>Người nhận</Text>
        <Text style={styles.value}>{order.recipientName}</Text>

        <Text style={styles.label}>Số điện thoại</Text>
        <Text style={styles.value}>{order.phone}</Text>

        <Text style={styles.label}>Địa chỉ giao hàng</Text>
        <Text style={styles.value}>{order.address}</Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#777777",
    marginTop: 8,
  },
  value: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
    marginTop: 3,
  },
  status: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#338DA3",
    marginTop: 3,
  },
  paymentStatusText: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 3,
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
});
