import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState, useEffect } from "react";
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
  addProduct,
  deleteProduct,
  getManagedProducts,
  updateProduct,
} from "../../../services/productService";
import {
  getManagedCategories,
  type ManagedCategory,
} from "../../../services/categoryService";
import type { Product } from "../../../types/product";
import AdminProductCard from "../../../components/admin/AdminProductCard";
import ProductFormModal from "../../../components/admin/ProductFormModal";

export default function AdminProductsScreen() {
  const { categoryId: routeCategoryId, openAdd: routeOpenAdd } =
    useLocalSearchParams<{ categoryId?: string; openAdd?: string }>();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<ManagedCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Trạng thái modal và form
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [image, setImage] = useState("");
  const [brand, setBrand] = useState("");
  const [stock, setStock] = useState("0");
  const [rating, setRating] = useState("5");
  const [categoryId, setCategoryId] = useState("");

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
        error instanceof Error ? error.message : "Không thể tải dữ liệu.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  // Mở form thêm sản phẩm từ danh mục nếu có param
  useEffect(() => {
    if (routeOpenAdd === "true") {
      resetForm();
      if (routeCategoryId) setCategoryId(routeCategoryId);
      setModalVisible(true);
    }
  }, [routeOpenAdd, routeCategoryId]);

  const openAddModal = () => {
    resetForm();
    if (routeCategoryId) setCategoryId(routeCategoryId);
    setModalVisible(true);
  };

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

  const handleSaveProduct = async () => {
    const parsedPrice = Number(price);
    const parsedStock = Number(stock);
    const parsedRating = Number(rating);

    if (!name.trim()) return Alert.alert("Thông báo", "Vui lòng nhập tên sản phẩm.");
    if (!categoryId) return Alert.alert("Thông báo", "Vui lòng chọn danh mục.");
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return Alert.alert("Thông báo", "Giá bán phải lớn hơn 0.");
    }

    try {
      setSaving(true);
      const input = {
        name,
        description,
        price: parsedPrice,
        image,
        categoryId,
        brand,
        stock: parsedStock,
        rating: parsedRating,
      };

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
        editingProduct ? "Đã cập nhật sản phẩm." : "Đã thêm sản phẩm mới."
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể lưu sản phẩm.";
      Alert.alert("Lỗi", message);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = (product: Product) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa "${product.name}" không?`,
      [
        { text: "Hủy", style: "cancel" },
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
                error instanceof Error ? error.message : "Không thể xóa sản phẩm.";
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
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AdminProductCard
            product={item}
            onEdit={openEditModal}
            onDelete={handleDeleteProduct}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadData}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Quay lại Dashboard</Text>
            </Pressable>
            <Text style={styles.title}>Quản lý sản phẩm</Text>
            <Text style={styles.subtitle}>Tổng số sản phẩm: {products.length}</Text>
            <Pressable style={styles.addButton} onPress={openAddModal}>
              <Text style={styles.addButtonText}>+ Thêm sản phẩm mới</Text>
            </Pressable>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#338DA3" style={{ marginTop: 30 }} />
          ) : (
            <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
          )
        }
      />

      <ProductFormModal
        visible={modalVisible}
        editingProduct={editingProduct}
        name={name}
        setName={setName}
        description={description}
        setDescription={setDescription}
        price={price}
        setPrice={setPrice}
        image={image}
        setImage={setImage}
        brand={brand}
        setBrand={setBrand}
        stock={stock}
        setStock={setStock}
        rating={rating}
        setRating={setRating}
        categoryId={categoryId}
        setCategoryId={setCategoryId}
        categories={categories}
        saving={saving}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
        onSave={handleSaveProduct}
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
