import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { Product } from "../../types/product";

interface HomeProductCardProps {
  product: Product;
}

export default function HomeProductCard({ product }: HomeProductCardProps) {
  return (
    <Pressable
      style={styles.productCard}
      onPress={() => {
        router.push({
          pathname: "/products/[id]",
          params: { id: product.id },
        });
      }}
    >
      {product.image ? (
        <Image
          source={{ uri: product.image }}
          style={styles.homeProductImage}
          resizeMode="contain"
        />
      ) : (
        <View style={[styles.homeProductImage, styles.homeImagePlaceholder]}>
          <Text style={styles.placeholderText}>Hình ảnh sản phẩm</Text>
        </View>
      )}

      <Text style={styles.productName} numberOfLines={2}>
        {product.name}
      </Text>

      <Text style={styles.brand}>
        {product.brand || "Chưa có thương hiệu"}
      </Text>

      <Text style={styles.price}>
        {product.price.toLocaleString("vi-VN")} đ
      </Text>

      <Text style={styles.stock}>Còn hàng: {product.stock}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  productCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  homeProductImage: {
    width: "100%",
    aspectRatio: 4 / 3,
    borderRadius: 10,
    backgroundColor: "#F5F7FA",
    marginBottom: 10,
  },
  homeImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888888",
    fontSize: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    minHeight: 38,
    color: "#333333",
  },
  brand: {
    fontSize: 12,
    color: "#888888",
    marginTop: 5,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E76F32",
    marginTop: 8,
  },
  stock: {
    fontSize: 12,
    color: "#777777",
    marginTop: 5,
  },
});
