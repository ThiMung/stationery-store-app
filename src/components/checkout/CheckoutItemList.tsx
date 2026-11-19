import React from "react";
import { View, Text, StyleSheet } from "react-native";
import type { CartItem } from "../../services/cartService";

interface CheckoutItemListProps {
  items: CartItem[];
}

export default function CheckoutItemList({ items }: CheckoutItemListProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>2. Đơn hàng của bạn</Text>
      {items.map((item) => (
        <View key={item.id} style={styles.productRow}>
          <View style={styles.productInfo}>
            <Text style={styles.productName}>{item.name}</Text>
            <Text style={styles.productQuantity}>
              {item.price.toLocaleString("vi-VN")} đ × {item.quantity}
            </Text>
          </View>
          <Text style={styles.subtotal}>
            {(item.price * item.quantity).toLocaleString("vi-VN")} đ
          </Text>
        </View>
      ))}
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
    marginBottom: 14,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
  },
  productQuantity: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
  },
  subtotal: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 13,
  },
});
