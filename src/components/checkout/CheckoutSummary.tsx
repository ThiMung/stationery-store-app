import React from "react";
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from "react-native";

interface CheckoutSummaryProps {
  totalAmount: number;
  submitting: boolean;
  disabled: boolean;
  onPlaceOrder: () => void;
}

export default function CheckoutSummary({
  totalAmount,
  submitting,
  disabled,
  onPlaceOrder,
}: CheckoutSummaryProps) {
  return (
    <>
      <View style={styles.section}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Tổng tiền đơn hàng</Text>
          <Text style={styles.totalPrice}>
            {totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      </View>

      <Pressable
        style={[styles.orderButton, disabled && styles.disabledButton]}
        onPress={onPlaceOrder}
        disabled={disabled}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.orderButtonText}>Xác nhận đặt hàng</Text>
        )}
      </Pressable>
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
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#555555",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalPrice: {
    color: "#E76F51",
    fontSize: 19,
    fontWeight: "bold",
  },
  orderButton: {
    backgroundColor: "#338DA3",
    padding: 15,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
});
