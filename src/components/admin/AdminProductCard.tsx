import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import type { Product } from "../../types/product";

interface AdminProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export default function AdminProductCard({
  product,
  onEdit,
  onDelete,
}: AdminProductCardProps) {
  return (
    <View style={styles.productCard}>
      <View style={styles.productHeader}>
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.adminProductImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.adminProductImage, styles.adminImagePlaceholder]}>
            <Text style={styles.placeholderText}>Ảnh</Text>
          </View>
        )}

        <View style={styles.productInfo}>
          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productPrice}>
            {product.price.toLocaleString("vi-VN")} đ
          </Text>
          <Text style={styles.productDetail}>
            Danh mục: {product.categoryName ?? "Chưa có"}
          </Text>
          <Text style={styles.productDetail}>
            Thương hiệu: {product.brand || "Chưa cập nhật"}
          </Text>
          <Text style={styles.productDetail}>Tồn kho: {product.stock}</Text>
          <Text style={styles.productDetail}>Đánh giá: {product.rating}/5</Text>
          <Text style={styles.productId}>Mã: {product.id}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <Pressable style={styles.editButton} onPress={() => onEdit(product)}>
          <Text style={styles.buttonText}>Chỉnh sửa</Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() => onDelete(product)}
        >
          <Text style={styles.buttonText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productHeader: {
    flexDirection: "row",
  },
  adminProductImage: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  adminImagePlaceholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#888888",
    fontSize: 12,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#E76F51",
    marginVertical: 3,
  },
  productDetail: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  productId: {
    fontSize: 11,
    color: "#999999",
    marginTop: 4,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  editButton: {
    flex: 1,
    backgroundColor: "#338DA3",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#E53935",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
