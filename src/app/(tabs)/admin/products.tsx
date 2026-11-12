import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
// import * as ImageManipulator from "expo-image-manipulator";
import { Directory, File, Paths } from "expo-file-system";

import {
  addProduct,
  deleteProduct,
  getManagedProducts,
  updateProduct,
  type ProductInput,
} from "../../../services/productService";

import {
  getManagedCategories,
  type ManagedCategory,
} from "../../../services/categoryService";

import type { Product } from "../../../types/product";

export default function AdminProductsScreen() {
  const {categoryId: routeCategoryId, openAdd: routeOpenAdd } = useLocalSearchParams<{
    categoryId?: string;
    openAdd?: string;
  }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ManagedCategory[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Trạng thái form
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  // Dữ liệu nhập từ form
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("0");
  const [rating, setRating] = useState("5");
  const [categoryId, setCategoryId] = useState("");
  
// Chọn ảnh từ Album điện thoại và lưu vào bộ nhớ ứng dụng
const handlePickImage = async () => {
  try {
    // 1. Mở Album/Gallery trên điện thoại
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 1,
    });

    // Người dùng không chọn ảnh
    if (result.canceled || !result.assets?.length) {
      return;
    }

    const selectedAsset = result.assets[0];

    // 2. Tạo thư mục lưu ảnh trong bộ nhớ ứng dụng
    const imageDirectory = new Directory(
      Paths.document,
      "product-images"
    );

    imageDirectory.create({
      idempotent: true,
      intermediates: true,
    });

    // 3. Xác định định dạng ảnh
    let extension =
      selectedAsset.fileName?.split(".").pop()?.toLowerCase();

    if (
      !extension ||
      extension === selectedAsset.fileName?.toLowerCase()
    ) {
      extension =
        selectedAsset.mimeType?.split("/")[1]?.toLowerCase() || "jpg";
    }

    if (extension === "jpeg") {
      extension = "jpg";
    }

    if (!/^[a-z0-9]+$/.test(extension)) {
      extension = "jpg";
    }

    // 4. Tạo tên file duy nhất
    const fileName = `product_${Date.now()}.${extension}`;

    const destinationFile = new File(
      imageDirectory,
      fileName
    );

    // 5. Sao chép ảnh vào bộ nhớ ứng dụng
    const sourceFile = new File(selectedAsset.uri);

    await sourceFile.copy(destinationFile);

    // 6. Cập nhật đường dẫn ảnh
    setImage(destinationFile.uri);

    Alert.alert(
      "Thành công",
      "Đã chọn và lưu hình ảnh sản phẩm."
    );

  } catch (error) {
    console.error("Image picker error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Không thể chọn hoặc lưu hình ảnh.";

    Alert.alert("Lỗi", message);
  }
};



  // Tải sản phẩm và danh mục
  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      const [productData, categoryData] = await Promise.all([
        getManagedProducts(),
        getManagedCategories(),
      ]);

      setProducts(productData);
      setCategories(categoryData);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại dữ liệu khi mở màn hình
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  
  // Tự động mở form và chọn danh mục khi được chuyển từ màn hình Categories
  useEffect(() => {
    // Chỉ xử lý khi dữ liệu đã tải xong
    if (
      loading ||
      routeOpenAdd !== "true" ||
      !routeCategoryId
    ) {
      return;
    }

    // Kiểm tra danh mục được truyền sang có tồn tại không
    const selectedCategory = categories.find(
      (category) => category.id === routeCategoryId
    );

    if (!selectedCategory) {
      Alert.alert(
        "Không thể thêm sản phẩm",
        "Danh mục không tồn tại hoặc đã bị xóa."
      );

      router.setParams({ openAdd: "false" });
      return;
    }

    // Đặt lại form ở chế độ thêm mới
    setEditingProduct(null);
    setName("");
    setDescription("");
    setPrice("");
    setImage("");
    setBrand("");
    setStock("0");
    setRating("5");

    // Tự động chọn đúng danh mục
    setCategoryId(selectedCategory.id);

    // Mở form thêm sản phẩm
    setModalVisible(true);

    // Đánh dấu đã xử lý yêu cầu mở form
    // để tránh mở form lại khi component cập nhật
    router.setParams({ openAdd: "false" });

  }, [
    loading,
    routeOpenAdd,
    routeCategoryId,
    categories,
  ]);

  // Đặt lại form
  const resetForm = () => {
    setName("");
    setDescription("");
    setPrice("");
    setImage("");
    setBrand("");
    setStock("0");
    setRating("5");
    setCategoryId("");
    setEditingProduct(null);
  };

  // Mở form thêm sản phẩm
  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  // Mở form chỉnh sửa sản phẩm
  const openEditModal = (product: Product) => {
    setEditingProduct(product);

    setName(product.name);
    setDescription(product.description ?? "");
    setPrice(String(product.price));
    setImage(product.image ?? "");
    setBrand(product.brand ?? "");
    setStock(String(product.stock));
    setRating(String(product.rating));
    setCategoryId(product.categoryId ?? "");

    setModalVisible(true);
  };

  // Lưu sản phẩm
  const handleSaveProduct = async () => {
    if (!name.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập tên sản phẩm.");
      return;
    }

    if (!categoryId) {
      Alert.alert("Thông báo", "Vui lòng chọn danh mục.");
      return;
    }

    if (
      price.trim() === "" ||
      stock.trim() === "" ||
      rating.trim() === ""
    ) {
      Alert.alert("Thông báo", "Vui lòng nhập đầy đủ giá, số lượng và đánh giá.");
      return;
    }

    const input: ProductInput = {
      name,
      description,
      price: Number(price),
      image,
      categoryId,
      brand,
      stock: Number(stock),
      rating: Number(rating),
    };

    try {
      setSaving(true);

      if (editingProduct) {
        await updateProduct(editingProduct.id, input);
      } else {
        await addProduct(input);
      }

      setModalVisible(false);
      resetForm();

      await loadData();

      Alert.alert(
        "Thành công",
        editingProduct
          ? "Đã cập nhật sản phẩm."
          : "Đã thêm sản phẩm mới."
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể lưu sản phẩm.";

      Alert.alert("Lỗi", message);
    } finally {
      setSaving(false);
    }
  };

  // Xác nhận xóa sản phẩm
  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa sản phẩm "${product.name}" không?`,
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
              await deleteProduct(product.id);
              await loadData();

              Alert.alert("Thành công", "Đã xóa sản phẩm.");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Không thể xóa sản phẩm.";

              Alert.alert("Không thể xóa", message);
            }
          },
        },
      ]
    );
  };

  // Hiển thị từng sản phẩm
  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <View style={styles.productCard}>
        <View style={styles.productHeader}>
{item.image ? (
  <Image
    source={{ uri: item.image }}
    style={styles.adminProductImage}
    resizeMode="contain"
  />
) : (
  <View style={[
    styles.adminProductImage,
    styles.adminImagePlaceholder,
  ]}>
    <Text style={styles.placeholderText}>
      Ảnh
    </Text>
  </View>
)}

          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {item.name}
            </Text>

            <Text style={styles.productPrice}>
              {item.price.toLocaleString("vi-VN")} đ
            </Text>

            <Text style={styles.productDetail}>
              Danh mục: {item.categoryName ?? "Chưa có"}
            </Text>

            <Text style={styles.productDetail}>
              Thương hiệu: {item.brand || "Chưa cập nhật"}
            </Text>

            <Text style={styles.productDetail}>
              Tồn kho: {item.stock}
            </Text>

            <Text style={styles.productDetail}>
              Đánh giá: {item.rating}/5
            </Text>

            <Text style={styles.productId}>
              Mã: {item.id}
            </Text>
          </View>
        </View>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.editButton}
            onPress={() => openEditModal(item)}
          >
            <Text style={styles.buttonText}>Chỉnh sửa</Text>
          </Pressable>

          <Pressable
            style={styles.deleteButton}
            onPress={() => handleDeleteProduct(item)}
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
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadData}
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
              Quản lý sản phẩm
            </Text>

            <Text style={styles.subtitle}>
              Tổng số sản phẩm: {products.length}
            </Text>

            <Pressable
              style={styles.addButton}
              onPress={openAddModal}
            >
              <Text style={styles.addButtonText}>
                + Thêm sản phẩm
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
              Chưa có sản phẩm nào.
            </Text>
          )
        }
      />

      {/* Form thêm và chỉnh sửa sản phẩm */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!saving) {
            setModalVisible(false);
            resetForm();
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingProduct
                ? "Chỉnh sửa sản phẩm"
                : "Thêm sản phẩm mới"}
            </Text>

            <ScrollView
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.inputLabel}>
                Tên sản phẩm *
              </Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập tên sản phẩm"
                maxLength={100}
              />

              <Text style={styles.inputLabel}>
                Mô tả
              </Text>
              <TextInput
                style={[styles.input, styles.descriptionInput]}
                value={description}
                onChangeText={setDescription}
                placeholder="Nhập mô tả sản phẩm"
                multiline
              />

              <Text style={styles.inputLabel}>
                Giá bán (VNĐ) *
              </Text>
              <TextInput
                style={styles.input}
                value={price}
                onChangeText={(value) =>
                  setPrice(value.replace(/\D/g, ""))
                }
                keyboardType="number-pad"
                placeholder="Ví dụ: 15000"
              />

              <Text style={styles.inputLabel}>
                Thương hiệu
              </Text>
              <TextInput
                style={styles.input}
                value={brand}
                onChangeText={setBrand}
                placeholder="Ví dụ: Thiên Long"
              />

              <Text style={styles.inputLabel}>
                Số lượng tồn kho *
              </Text>
              <TextInput
                style={styles.input}
                value={stock}
                onChangeText={(value) =>
                  setStock(value.replace(/\D/g, ""))
                }
                keyboardType="number-pad"
                placeholder="Ví dụ: 50"
              />

              <Text style={styles.inputLabel}>
                Đánh giá (0 - 5) *
              </Text>
              <TextInput
                style={styles.input}
                value={rating}
                onChangeText={(value) =>
                  setRating(value.replace(/[^0-9.]/g, ""))
                }
                keyboardType="decimal-pad"
                placeholder="Ví dụ: 4.8"
              />


<Text style={styles.inputLabel}>
  Hình ảnh sản phẩm
</Text>

{/* Hiển thị ảnh đã chọn hoặc ảnh mặc định */}
{image ? (
  <Image
    source={{ uri: image }}
    style={styles.selectedImage}
    resizeMode="contain"
  />
) : (
  <View style={styles.imagePickerPlaceholder}>
    <Text style={{ fontSize: 35 }}>📷</Text>

    <Text style={styles.imagePlaceholderText}>
      Chưa có hình ảnh sản phẩm
    </Text>
  </View>
)}

{/* Nút chọn ảnh */}
<Pressable
  style={styles.imagePickerButton}
  onPress={handlePickImage}
>
  <Text style={styles.imagePickerButtonText}>
    📁 Chọn ảnh từ điện thoại
  </Text>
</Pressable>

{/* Nút xóa ảnh đã chọn */}
{image !== "" && (
  <Pressable
    style={styles.removeImageButton}
    onPress={() => setImage("")}
  >
    <Text style={styles.removeImageText}>
      Xóa hình ảnh đã chọn
    </Text>
  </Pressable>
)}


              <Text style={styles.inputLabel}>
                Chọn danh mục *
              </Text>

              <View style={styles.categoryList}>
                {categories.map((category) => (
                  <Pressable
                    key={category.id}
                    style={[
                      styles.categoryOption,
                      categoryId === category.id &&
                      styles.categorySelected,
                    ]}
                    onPress={() => setCategoryId(category.id)}
                  >
                    <Text
                      style={[
                        styles.categoryOptionText,
                        categoryId === category.id &&
                        styles.categorySelectedText,
                      ]}
                    >
                      {category.name}
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
                <Pressable
                  style={styles.cancelButton}
                  onPress={() => {
                    setModalVisible(false);
                    resetForm();
                  }}
                  disabled={saving}
                >
                  <Text style={styles.cancelText}>Hủy</Text>
                </Pressable>

                <Pressable
                  style={styles.saveButton}
                  onPress={handleSaveProduct}
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
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    color: "#338DA3",
    fontSize: 14,
    fontWeight: "bold",
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
  productCard: {
    backgroundColor: "#FFFFFF",
    padding: 14,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  productImage: {
    width: 85,
    height: 95,
    borderRadius: 8,
    backgroundColor: "#F5F7FA",
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 85,
    height: 95,
    borderRadius: 8,
    backgroundColor: "#EAF2F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  adminProductImage: {
  width: 90,
  aspectRatio: 1,
  borderRadius: 9,
  backgroundColor: "#F5F7FA",
  marginRight: 12,
},

adminImagePlaceholder: {
  justifyContent: "center",
  alignItems: "center",
},
  placeholderText: {
    color: "#338DA3",
    fontSize: 13,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  productPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E76F51",
    marginTop: 5,
    marginBottom: 5,
  },
  productDetail: {
    fontSize: 12,
    color: "#666666",
    marginTop: 3,
  },
  productId: {
    fontSize: 11,
    color: "#999999",
    marginTop: 5,
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 14,
    gap: 10,
  },
  editButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 7,
  },
  deleteButton: {
    backgroundColor: "#DC5555",
    paddingHorizontal: 18,
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
    padding: 16,
  },
  modalContent: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 20,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
    marginBottom: 7,
    marginTop: 12,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333333",
  },
  descriptionInput: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  categoryList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryOption: {
    paddingHorizontal: 13,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    backgroundColor: "#FFFFFF",
  },
  categorySelected: {
    backgroundColor: "#338DA3",
    borderColor: "#338DA3",
  },
  categoryOptionText: {
    fontSize: 13,
    color: "#555555",
  },
  categorySelectedText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
  warningText: {
    color: "#DC5555",
    fontSize: 12,
    marginTop: 8,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 22,
    marginBottom: 10,
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
    minWidth: 120,
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 8,
    backgroundColor: "#338DA3",
  },
  saveText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
selectedImage: {
  width: "75%",
  aspectRatio: 1,
  alignSelf: "center",
  backgroundColor: "#F5F7FA",
  borderRadius: 10,
  marginBottom: 10,
},

imagePickerPlaceholder: {
  width: "75%",
  aspectRatio: 1,
  alignSelf: "center",
  backgroundColor: "#F5F7FA",
  borderRadius: 10,
  borderWidth: 1,
  borderStyle: "dashed",
  borderColor: "#BFCBD0",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: 10,
},

imagePlaceholderText: {
  color: "#888888",
  fontSize: 13,
  marginTop: 8,
},

imagePickerButton: {
  backgroundColor: "#338DA3",
  padding: 13,
  borderRadius: 8,
  alignItems: "center",
  marginBottom: 8,
},

imagePickerButtonText: {
  color: "#FFFFFF",
  fontSize: 13,
  fontWeight: "bold",
},

removeImageButton: {
  alignSelf: "flex-start",
  paddingVertical: 8,
},

removeImageText: {
  color: "#DC5555",
  fontSize: 12,
  fontWeight: "bold",
},
});
