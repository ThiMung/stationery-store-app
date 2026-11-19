import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface CartSummaryProps {
  totalAmount: number;
  onCheckout: () => void;
}

export default function CartSummary({
  totalAmount,
  onCheckout,
}: CartSummaryProps) {
  return (
    <View style={styles.summary}>
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Tổng tiền</Text>
        <Text style={styles.totalPrice}>
          {totalAmount.toLocaleString("vi-VN")} đ
        </Text>
      </View>

      <Pressable style={styles.checkoutButton} onPress={onCheckout}>
        <Text style={styles.checkoutButtonText}>Tiến hành thanh toán</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  summary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#E76F51",
  },
  checkoutButton: {
    backgroundColor: "#338DA3",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  checkoutButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
