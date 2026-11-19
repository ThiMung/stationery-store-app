import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface EmptyCartProps {
  onContinueShopping: () => void;
}

export default function EmptyCart({ onContinueShopping }: EmptyCartProps) {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
      <Text style={styles.emptyText}>
        Bạn chưa thêm sản phẩm nào vào giỏ hàng.
      </Text>
      <Pressable style={styles.shopButton} onPress={onContinueShopping}>
        <Text style={styles.shopButtonText}>Tiếp tục mua sắm</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContainer: {
    alignItems: "center",
    marginTop: 40,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  emptyText: {
    color: "#777777",
    textAlign: "center",
    marginTop: 8,
  },
  shopButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
