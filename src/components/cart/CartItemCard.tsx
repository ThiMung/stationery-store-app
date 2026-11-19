import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import type { CartItem } from "../../services/cartService";

interface CartItemCardProps {
  item: CartItem;
  onChangeQuantity: (item: CartItem, newQty: number) => void;
  onRemoveItem: (item: CartItem) => void;
}

export default function CartItemCard({
  item,
  onChangeQuantity,
  onRemoveItem,
}: CartItemCardProps) {
  return (
    <View style={styles.card}>
      {item.image ? (
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imagePlaceholderText}>No image</Text>
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          <Pressable
            style={styles.deleteButton}
            onPress={() => onRemoveItem(item)}
          >
            <Text style={styles.deleteButtonText}>✕</Text>
          </Pressable>
        </View>

        <Text style={styles.price}>
          {item.price.toLocaleString("vi-VN")} đ
        </Text>

        <View style={styles.footerRow}>
          <View style={styles.quantityControl}>
            <Pressable
              style={styles.qtyButton}
              onPress={() => onChangeQuantity(item, item.quantity - 1)}
            >
              <Text style={styles.qtyButtonText}>-</Text>
            </Pressable>

            <Text style={styles.qtyText}>{item.quantity}</Text>

            <Pressable
              style={styles.qtyButton}
              onPress={() => onChangeQuantity(item, item.quantity + 1)}
            >
              <Text style={styles.qtyButtonText}>+</Text>
            </Pressable>
          </View>

          <Text style={styles.itemTotal}>
            {(item.price * item.quantity).toLocaleString("vi-VN")} đ
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  imagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  imagePlaceholderText: {
    color: "#999999",
    fontSize: 11,
  },
  info: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  name: {
    flex: 1,
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
    marginRight: 6,
  },
  deleteButton: {
    padding: 4,
  },
  deleteButtonText: {
    color: "#999999",
    fontSize: 15,
    fontWeight: "bold",
  },
  price: {
    fontSize: 13,
    color: "#666666",
    marginVertical: 4,
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 6,
  },
  qtyButton: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyButtonText: {
    fontSize: 15,
    color: "#333333",
    fontWeight: "bold",
  },
  qtyText: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "bold",
    paddingHorizontal: 8,
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E76F51",
  },
});
