import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { Product } from "../../types/product";

interface ProductDetailBodyProps {
  product: Product;
  onAddToCart: () => void;
}

export default function ProductDetailBody({
  product,
  onAddToCart,
}: ProductDetailBodyProps) {
  return (
    <>
      {product.image ? (
        <Image
          source={{ uri: product.image }}
          style={styles.image}
          resizeMode="contain"
        />
      ) : (
        <View style={styles.imagePlaceholder}>
          <Text style={styles.placeholderText}>Hình ảnh sản phẩm</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.category}>
          {product.categoryName || "Chưa phân loại"}
        </Text>

        <Text style={styles.name}>{product.name}</Text>

        <Text style={styles.price}>
          {product.price.toLocaleString("vi-VN")} đ
        </Text>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Mã sản phẩm</Text>
          <Text style={styles.infoValue}>{product.id}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Thương hiệu</Text>
          <Text style={styles.infoValue}>
            {product.brand || "Chưa cập nhật"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Danh mục</Text>
          <Text style={styles.infoValue}>
            {product.categoryName || "Chưa phân loại"}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Đánh giá</Text>
          <Text style={styles.infoValue}>{product.rating ?? 0} / 5</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tồn kho</Text>
          <Text style={styles.infoValue}>
            {product.stock > 0
              ? `Còn ${product.stock} sản phẩm`
              : "Hết hàng"}
          </Text>
        </View>

        <View style={styles.divider} />

        <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
        <Text style={styles.description}>
          {product.description || "Chưa có mô tả sản phẩm."}
        </Text>

        <Pressable
          onPress={onAddToCart}
          disabled={product.stock <= 0}
          style={[
            styles.addButton,
            { backgroundColor: product.stock > 0 ? "#338DA3" : "#AAAAAA" },
          ]}
        >
          <Text style={styles.addButtonText}>
            {product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push("/cart")}
          style={styles.cartButton}
        >
          <Text style={styles.cartButtonText}>Xem giỏ hàng</Text>
        </Pressable>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 260,
    backgroundColor: "#FFFFFF",
  },
  imagePlaceholder: {
    height: 260,
    backgroundColor: "#EFF3F5",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888888",
  },
  content: {
    padding: 20,
    backgroundColor: "#FFFFFF",
    marginTop: 12,
  },
  category: {
    color: "#338DA3",
    fontSize: 14,
    fontWeight: "600",
  },
  name: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 10,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#E76F32",
    marginTop: 12,
  },
  divider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F1F1",
  },
  infoLabel: {
    fontSize: 14,
    color: "#777777",
  },
  infoValue: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "500",
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    color: "#666666",
    marginBottom: 30,
  },
  addButton: {
    padding: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 18,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  cartButton: {
    padding: 13,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#338DA3",
  },
  cartButtonText: {
    color: "#338DA3",
    fontWeight: "bold",
  },
});
