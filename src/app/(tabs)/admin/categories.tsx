
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  addCategory,
  deleteCategory,
  getManagedCategories,
  updateCategory,
  type ManagedCategory,
} from "../../../services/categoryService";

export default function AdminCategoriesScreen() {
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [editingCategory, setEditingCategory] =
    useState<ManagedCategory | null>(null);

  // Tải danh sách danh mục
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getManagedCategories();
      setCategories(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách danh mục.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tự động tải lại khi mở màn hình
  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  // Mở form thêm danh mục
  const openAddModal = () => {
    setEditingCategory(null);
    setCategoryName("");
    setModalVisible(true);
  };

  // Mở form chỉnh sửa
  const openEditModal = (category: ManagedCategory) => {
    setEditingCategory(category);
    setCategoryName(category.name);
    setModalVisible(true);
  };

  // Lưu danh mục
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
        editingCategory
          ? "Đã cập nhật danh mục."
          : "Đã thêm danh mục mới."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể lưu danh mục.";

      Alert.alert("Lỗi", message);
    } finally {
      setSaving(false);
    }
  };

  // Xác nhận xóa danh mục
  const handleDeleteCategory = (category: ManagedCategory) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa danh mục "${category.name}" không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
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
                error instanceof Error
                  ? error.message
                  : "Không thể xóa danh mục.";

              Alert.alert("Không thể xóa", message);
            }
          },
        },
      ]
    );
  };

  // Giao diện từng danh mục
  const renderCategory = ({
    item,
  }: {
    item: ManagedCategory;
  }) => {
    return (
      <View style={styles.categoryCard}>
        <View style={styles.categoryInfo}>
          <Text style={styles.categoryName}>
            {item.name}
          </Text>

          <Text style={styles.categoryId}>
            Mã danh mục: {item.id}
          </Text>

          <Text style={styles.productCount}>
            Số sản phẩm: {item.productCount}
          </Text>
        </View>

        <Pressable
          style={styles.addProductButton}
          onPress={() =>
            router.push({
              pathname: "/admin/products",
              params: {
                categoryId: item.id,
                openAdd: "true",
              },
            })
          }
        >
          <Text style={styles.addProductText}>
            + Thêm sản phẩm
          </Text>
        </Pressable>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.buttonText}>Sửa</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteCategory(item)}
          >
            <Text style={styles.buttonText}>Xóa</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        renderItem={renderCategory}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadCategories}
        ListHeaderComponent={
          <View>

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>
                ‹ Quay lại Dashboard
              </Text>
            </Pressable>

            <Text style={styles.title}>
              Quản lý danh mục
            </Text>

            <Text style={styles.subtitle}>
              Tổng số danh mục: {categories.length}
            </Text>

            <Pressable
              style={styles.addButton}
              onPress={openAddModal}
            >
              <Text style={styles.addButtonText}>
                + Thêm danh mục
              </Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#338DA3"
              style={{ marginTop: 30 }}
            />
          ) : (
            <Text style={styles.emptyText}>
              Chưa có danh mục nào.
            </Text>
          )
        }
      />

      {/* Form thêm và chỉnh sửa danh mục */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingCategory
                ? "Chỉnh sửa danh mục"
                : "Thêm danh mục mới"}
            </Text>

            <Text style={styles.inputLabel}>
              Tên danh mục
            </Text>

            <TextInput
              style={styles.input}
              value={categoryName}
              onChangeText={setCategoryName}
              placeholder="Nhập tên danh mục..."
              maxLength={50}
              autoFocus
            />

            <View style={styles.modalActions}>
              <Pressable
                style={styles.cancelButton}
                onPress={() => {
                  setModalVisible(false);
                  setCategoryName("");
                  setEditingCategory(null);
                }}
                disabled={saving}
              >
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={handleSaveCategory}
                disabled={saving}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Lưu</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 15,
  },
  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 5,
    marginBottom: 15,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    color: "#338DA3",
    fontSize: 14,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#338DA3",
    padding: 13,
    borderRadius: 9,
    alignItems: "center",
    marginBottom: 16,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  categoryCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  categoryInfo: {
    marginBottom: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  categoryId: {
    fontSize: 12,
    color: "#888888",
    marginTop: 5,
  },
  productCount: {
    fontSize: 13,
    color: "#338DA3",
    marginTop: 5,
    fontWeight: "600",
  },
  addProductButton: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF2F4",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    marginBottom: 12,
  },

  addProductText: {
    color: "#338DA3",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  editButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 7,
  },
  deleteButton: {
    backgroundColor: "#DC5555",
    paddingHorizontal: 20,
    paddingVertical: 9,
    borderRadius: 7,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#888888",
    marginTop: 30,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    color: "#555555",
    marginBottom: 8,
  },
  input: {
    height: 46,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 20,
    gap: 10,
  },
  cancelButton: {
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#EEEEEE",
  },
  cancelText: {
    color: "#555555",
    fontWeight: "bold",
  },
  saveButton: {
    minWidth: 85,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#338DA3",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
