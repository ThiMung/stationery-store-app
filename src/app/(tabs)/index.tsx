import { useCallback, useState } from "react";
import { useFocusEffect } from "expo-router";
import {
  View,
  Text,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";

import {
  initDatabase,
  getProducts,
  getCategories,
} from "../../database/database";
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";
import { getCartItems } from "../../services/cartService";
import HomeProductCard from "../../components/home/HomeProductCard";
import HomeHeader from "../../components/home/HomeHeader";

export default function HomeScreen() {
  const [cartCount, setCartCount] = useState(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showCategories, setShowCategories] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Tải dữ liệu ban đầu từ SQLite
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      await initDatabase();
      const productData = await getProducts();
      setProducts(productData);
      const categoryData = await getCategories();
      setCategories(categoryData);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Không thể tải dữ liệu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const loadCartCount = useCallback(async () => {
    try {
      const items = await getCartItems();
      const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(totalCount);
    } catch {
      setCartCount(0);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadCartCount();
    }, [loadData, loadCartCount])
  );

  // Xử lý bộ lọc tìm kiếm và giá
  const keyword = searchQuery.trim().toLowerCase();
  const minPriceValue = minPrice ? Number(minPrice) : null;
  const maxPriceValue = maxPrice ? Number(maxPrice) : null;
  const isPriceRangeInvalid =
    minPriceValue !== null && maxPriceValue !== null && minPriceValue > maxPriceValue;

  const filteredProducts = isPriceRangeInvalid
    ? []
    : products.filter((product) => {
        const matchesCategory =
          selectedCategoryId === null || product.categoryId === selectedCategoryId;
        const matchesSearch =
          keyword === "" ||
          product.name.toLowerCase().includes(keyword) ||
          (product.categoryName ?? "").toLowerCase().includes(keyword);
        const matchesMinPrice = minPriceValue === null || product.price >= minPriceValue;
        const matchesMaxPrice = maxPriceValue === null || product.price <= maxPriceValue;
        return matchesCategory && matchesSearch && matchesMinPrice && matchesMaxPrice;
      });

  const selectedCategoryName = categories.find(
    (c) => c.id === selectedCategoryId
  )?.name;

  const handleClearFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategoryId(null);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang tải dữ liệu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
        <Pressable style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryText}>Thử lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <HomeProductCard product={item} />}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <HomeHeader
            cartCount={cartCount}
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            selectedCategoryName={selectedCategoryName}
            showCategories={showCategories}
            searchQuery={searchQuery}
            minPrice={minPrice}
            maxPrice={maxPrice}
            isPriceRangeInvalid={isPriceRangeInvalid}
            resultCount={filteredProducts.length}
            onSearchChange={setSearchQuery}
            onMinPriceChange={(val) => setMinPrice(val.replace(/\D/g, ""))}
            onMaxPriceChange={(val) => setMaxPrice(val.replace(/\D/g, ""))}
            onClearFilters={handleClearFilters}
            onToggleCategories={setShowCategories}
            onSelectCategory={setSelectedCategoryId}
          />
        }
        ListEmptyComponent={
          <Text style={styles.empty}>Không có sản phẩm trong danh mục này.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
    backgroundColor: "#F8FAFC",
  },
  listContent: {
    paddingBottom: 24,
  },
  row: {
    justifyContent: "space-between",
    gap: 12,
  },
  loadingText: {
    marginTop: 12,
    color: "#777777",
  },
  error: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 16,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  empty: {
    textAlign: "center",
    color: "#888888",
    marginTop: 30,
    width: "100%",
  },
});
