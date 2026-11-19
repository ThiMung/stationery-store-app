import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { OrderItemDetail } from "../../types/order";

interface OrderDetailItemsProps {
  items: OrderItemDetail[];
  totalAmount: number;
}

export default function OrderDetailItems({
  items,
  totalAmount,
}: OrderDetailItemsProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sản phẩm đã mua</Text>

      {items.map((item) => (
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

      <View style={styles.separator} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng thanh toán</Text>
        <Text style={styles.totalPrice}>
          {totalAmount.toLocaleString("vi-VN")} đ
        </Text>
      </View>
    </View>
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
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
  },
  itemQuantity: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "bold",
  },
  separator: {
    height: 1,
    backgroundColor: "#E5E7EB",
    marginTop: 12,
    marginBottom: 12,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "bold",
  },
  totalPrice: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#E76F51",
  },
});
