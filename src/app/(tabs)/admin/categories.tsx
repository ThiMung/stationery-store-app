import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import {
  addCategory,
  deleteCategory,
  getManagedCategories,
  updateCategory,
  type ManagedCategory,
} from "../../../services/categoryService";
import AdminCategoryCard from "../../../components/admin/AdminCategoryCard";
import CategoryFormModal from "../../../components/admin/CategoryFormModal";

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] = useState<ManagedCategory | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getManagedCategories();
      setCategories(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải danh sách danh mục.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setModalVisible(true);
  };

  const openEditModal = (category: ManagedCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên danh mục.");
      return;
    }

    try {
      setSaving(true);
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryName);
      } else {
        await addCategory(categoryName);
      }

      setModalVisible(false);
      setCategoryName("");
      setEditingCategory(null);
      await loadCategories();
      Alert.alert(
        "Thành công",
        editingCategory ? "Đã cập nhật danh mục." : "Đã thêm danh mục mới."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể lưu danh mục.";
      Alert.alert("Lỗi", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = (category: ManagedCategory) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteCategory(category.id);
              await loadCategories();
              Alert.alert("Thành công", "Đã xóa danh mục.");
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Không thể xóa danh mục.";
              Alert.alert("Không thể xóa", message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AdminCategoryCard
            category={item}
            onEdit={openEditModal}
            onDelete={handleDeleteCategory}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadCategories}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Quay lại Dashboard</Text>
            </Pressable>
            <Text style={styles.title}>Quản lý danh mục</Text>
            <Text style={styles.subtitle}>Tổng số danh mục: {categories.length}</Text>
            <Pressable style={styles.addButton} onPress={openAddModal}>
              <Text style={styles.addButtonText}>+ Thêm danh mục mới</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#338DA3" style={{ marginTop: 30 }} />
          ) : (
            <Text style={styles.emptyText}>Chưa có danh mục nào.</Text>
          )
        }
      />

      <CategoryFormModal
        visible={modalVisible}
        editingCategory={editingCategory}
        categoryName={categoryName}
        setCategoryName={setCategoryName}
        saving={saving}
        onClose={() => setModalVisible(false)}
        onSave={handleSaveCategory}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  listContent: { padding: 16, paddingBottom: 30 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8 },
  backText: { color: "#338DA3", fontSize: 14, fontWeight: "bold" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333333", marginTop: 8 },
  subtitle: { color: "#777777", fontSize: 13, marginTop: 4, marginBottom: 16 },
  addButton: {
    backgroundColor: "#338DA3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
  emptyText: { textAlign: "center", color: "#777777", marginTop: 30 },
});
