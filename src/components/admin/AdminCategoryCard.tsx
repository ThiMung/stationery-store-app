import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { router } from "expo-router";
import type { ManagedCategory } from "../../services/categoryService";

interface AdminCategoryCardProps {
  category: ManagedCategory;
  onEdit: (category: ManagedCategory) => void;
  onDelete: (category: ManagedCategory) => void;
}

export default function AdminCategoryCard({
  category,
  onEdit,
  onDelete,
}: AdminCategoryCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{category.name}</Text>
          <Text style={styles.count}>
            {category.productCount} sản phẩm thuộc danh mục
          </Text>
        </View>
        <Text style={styles.id}>{category.id}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={styles.addProductButton}
          onPress={() => {
            router.push({
              pathname: "/admin/products",
              params: {
                categoryId: category.id,
                openAdd: "true",
              },
            });
          }}
        >
          <Text style={styles.buttonText}>+ Thêm SP</Text>
        </Pressable>

        <Pressable style={styles.editButton} onPress={() => onEdit(category)}>
          <Text style={styles.buttonText}>Sửa</Text>
        </Pressable>

        <Pressable
          style={styles.deleteButton}
          onPress={() => onDelete(category)}
        >
          <Text style={styles.buttonText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  count: {
    fontSize: 13,
    color: "#777777",
    marginTop: 4,
  },
  id: {
    fontSize: 12,
    color: "#999999",
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  addProductButton: {
    flex: 1.2,
    backgroundColor: "#2E7D32",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
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
