import React from "react";
import {
  View,
  Text,
  Modal,
  ScrollView,
  TextInput,
  Pressable,
  Image,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import type { Product } from "../../types/product";
import type { ManagedCategory } from "../../services/categoryService";
import { pickProductImage } from "../../utils/imageUtils";

interface ProductFormModalProps {
  visible: boolean;
  editingProduct: Product | null;
  name: string;
  setName: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  price: string;
  setPrice: (val: string) => void;
  image: string;
  setImage: (val: string) => void;
  brand: string;
  setBrand: (val: string) => void;
  stock: string;
  setStock: (val: string) => void;
  rating: string;
  setRating: (val: string) => void;
  categoryId: string;
  setCategoryId: (val: string) => void;
  categories: ManagedCategory[];
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
}

export default function ProductFormModal({
  visible,
  editingProduct,
  name,
  setName,
  description,
  setDescription,
  price,
  setPrice,
  image,
  setImage,
  brand,
  setBrand,
  stock,
  setStock,
  rating,
  setRating,
  categoryId,
  setCategoryId,
  categories,
  saving,
  onClose,
  onSave,
}: ProductFormModalProps) {
  const handlePickImage = async () => {
    try {
      const uri = await pickProductImage();
      if (uri) {
        setImage(uri);
      }
    } catch {
      // Bỏ qua lỗi hủy chọn ảnh
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={() => {
        if (!saving) onClose();
      }}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới"}
          </Text>

          <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
            <Text style={styles.inputLabel}>Tên sản phẩm *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Nhập tên sản phẩm"
              maxLength={100}
            />

            <Text style={styles.inputLabel}>Mô tả</Text>
            <TextInput
              style={[styles.input, styles.descriptionInput]}
              value={description}
              onChangeText={setDescription}
              placeholder="Nhập mô tả sản phẩm"
              multiline
            />

            <Text style={styles.inputLabel}>Giá bán (VNĐ) *</Text>
            <TextInput
              style={styles.input}
              value={price}
              onChangeText={(val) => setPrice(val.replace(/\D/g, ""))}
              keyboardType="number-pad"
              placeholder="Ví dụ: 15000"
            />

            <Text style={styles.inputLabel}>Thương hiệu</Text>
            <TextInput
              style={styles.input}
              value={brand}
              onChangeText={setBrand}
              placeholder="Ví dụ: Thiên Long"
            />

            <Text style={styles.inputLabel}>Số lượng tồn kho *</Text>
            <TextInput
              style={styles.input}
              value={stock}
              onChangeText={(val) => setStock(val.replace(/\D/g, ""))}
              keyboardType="number-pad"
              placeholder="Ví dụ: 50"
            />

            <Text style={styles.inputLabel}>Đánh giá (0 - 5) *</Text>
            <TextInput
              style={styles.input}
              value={rating}
              onChangeText={(val) => setRating(val.replace(/[^0-9.]/g, ""))}
              keyboardType="decimal-pad"
              placeholder="Ví dụ: 4.8"
            />

            <Text style={styles.inputLabel}>Hình ảnh sản phẩm</Text>
            {image ? (
              <Image source={{ uri: image }} style={styles.selectedImage} resizeMode="contain" />
            ) : (
              <View style={styles.imagePickerPlaceholder}>
                <Text style={{ fontSize: 35 }}>📷</Text>
                <Text style={styles.imagePlaceholderText}>Chưa có hình ảnh sản phẩm</Text>
              </View>
            )}

            <Pressable style={styles.imagePickerButton} onPress={handlePickImage}>
              <Text style={styles.imagePickerButtonText}>📁 Chọn ảnh từ điện thoại</Text>
            </Pressable>

            {image !== "" && (
              <Pressable style={styles.removeImageButton} onPress={() => setImage("")}>
                <Text style={styles.removeImageText}>Xóa hình ảnh đã chọn</Text>
              </Pressable>
            )}

            <Text style={styles.inputLabel}>Chọn danh mục *</Text>
            <View style={styles.categoryList}>
              {categories.map((c) => (
                <Pressable
                  key={c.id}
                  style={[
                    styles.categoryOption,
                    categoryId === c.id && styles.categorySelected,
                  ]}
                  onPress={() => setCategoryId(c.id)}
                >
                  <Text
                    style={[
                      styles.categoryOptionText,
                      categoryId === c.id && styles.categorySelectedText,
                    ]}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              ))}
            </View>

            {categories.length === 0 && (
              <Text style={styles.warningText}>
                Chưa có danh mục. Vui lòng tạo danh mục trước.
              </Text>
            )}

            <View style={styles.modalActions}>
              <Pressable style={styles.cancelButton} onPress={onClose} disabled={saving}>
                <Text style={styles.cancelText}>Hủy</Text>
              </Pressable>

              <Pressable
                style={styles.saveButton}
                onPress={onSave}
                disabled={saving || categories.length === 0}
              >
                {saving ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text style={styles.saveText}>Lưu sản phẩm</Text>
                )}
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: "90%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    marginTop: 10,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: "#333333",
  },
  descriptionInput: {
    minHeight: 70,
    textAlignVertical: "top",
  },
  selectedImage: {
    width: "100%",
    height: 150,
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
    marginBottom: 10,
  },
  imagePickerPlaceholder: {
    height: 120,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  imagePlaceholderText: {
    fontSize: 12,
    color: "#888888",
    marginTop: 6,
  },
  imagePickerButton: {
    backgroundColor: "#EAF5F8",
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  imagePickerButtonText: {
    color: "#338DA3",
    fontWeight: "bold",
    fontSize: 13,
  },
  removeImageButton: {
    alignItems: "center",
    paddingVertical: 6,
    marginBottom: 8,
  },
  removeImageText: {
    color: "#E53935",
    fontSize: 12,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 4,
  },
  categoryOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FAFAFA",
  },
  categorySelected: {
    borderColor: "#338DA3",
    backgroundColor: "#EAF5F8",
  },
  categoryOptionText: {
    fontSize: 12,
    color: "#555555",
  },
  categorySelectedText: {
    color: "#338DA3",
    fontWeight: "bold",
  },
  warningText: {
    fontSize: 12,
    color: "#D97706",
    marginTop: 6,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
    marginBottom: 10,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
  },
  cancelText: {
    color: "#666666",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    flex: 2,
    backgroundColor: "#338DA3",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
});
