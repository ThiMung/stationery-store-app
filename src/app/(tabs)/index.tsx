import { useCallback, useEffect, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import {
  View,
  Text,
  FlatList,
  Image,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";

// Database
import {
  initDatabase,
  getProducts,
  getCategories,
} from "../../database/database";

// Types
import type { Product } from "../../types/product";
import type { Category } from "../../types/category";

// Components
import Banner from "../../components/Banner";
import CategorySelector from "../../components/CategorySelector";
import ProductSearchFilter from "../../components/ProductSearchFilter";
import HomeTopBar from "../../components/HomeTopBar";
import { getCartItems } from "../../services/cartService";

export default function HomeScreen() {
  const [cartCount, setCartCount] = useState(0);

  // Danh sách sản phẩm
  const [products, setProducts] = useState<Product[]>([]);

  // Danh sách danh mục
  const [categories, setCategories] = useState<Category[]>([]);

  // Danh mục đang được chọn
  const [selectedCategoryId, setSelectedCategoryId] =
    useState<string | null>(null);

  // Trạng thái tìm kiếm và lọc giá
  const [searchQuery, setSearchQuery] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // Ẩn/hiện khu vực danh mục
  const [showCategories, setShowCategories] = useState(false);

  // Trạng thái tải dữ liệu
  const [loading, setLoading] = useState(true);

  // Thông báo lỗi
  const [error, setError] = useState("");

  // =====================================
  // 1. LẤY DỮ LIỆU TỪ SQLITE
  // =====================================

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      // Khởi tạo database
      await initDatabase();

      // Lấy danh sách sản phẩm
      const productData = await getProducts();

      setProducts(productData);

      // Lấy danh sách danh mục
      const categoryData = await getCategories();

      setCategories(categoryData);

      console.log("Products:", productData);
      console.log("Categories:", categoryData);
    } catch (error) {
      console.error("Load data error:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Không thể tải dữ liệu. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Cập nhật số lượng sản phẩm trong giỏ hàng
  const loadCartCount = useCallback(async () => {
  try {
    const items = await getCartItems();
  
    // Tính tổng số lượng sản phẩm trong giỏ
    const totalQuantity = items.reduce(
      (total, item) => total + item.quantity,
      0
    );
  
    setCartCount(totalQuantity);
  } catch {
    // Chưa đăng nhập hoặc chưa lấy được giỏ hàng
    setCartCount(0);
  }
  }, []);

  // Tự động lấy dữ liệu khi mở trang chủ
useFocusEffect(
  useCallback(() => {
    loadData();
    loadCartCount();
  }, [loadData, loadCartCount])
);


  // =====================================
  // 2. TÌM KIẾM VÀ LỌC SẢN PHẨM
  // =====================================

  const minPriceValue =
    minPrice.trim() === "" ? null : Number(minPrice);

  const maxPriceValue =
    maxPrice.trim() === "" ? null : Number(maxPrice);

  // Kiểm tra khoảng giá hợp lệ
  const isPriceRangeInvalid =
    minPriceValue !== null &&
    maxPriceValue !== null &&
    minPriceValue > maxPriceValue;

  // Tìm kiếm và lọc sản phẩm
  const filteredProducts = isPriceRangeInvalid
    ? []
    : products.filter((product) => {
        // Lọc theo danh mục
        const matchesCategory =
          selectedCategoryId === null ||
          product.categoryId === selectedCategoryId;

        // Tìm theo tên sản phẩm hoặc tên danh mục
        const keyword = searchQuery.trim().toLowerCase();

        const matchesSearch =
          keyword === "" ||
          product.name.toLowerCase().includes(keyword) ||
          (product.categoryName ?? "").toLowerCase().includes(keyword);

        // Lọc giá thấp nhất
        const matchesMinPrice =
          minPriceValue === null ||
          product.price >= minPriceValue;

        // Lọc giá cao nhất
        const matchesMaxPrice =
          maxPriceValue === null ||
          product.price <= maxPriceValue;

        return (
          matchesCategory &&
          matchesSearch &&
          matchesMinPrice &&
          matchesMaxPrice
        );
      });

  // Lấy tên danh mục đang chọn
  const selectedCategoryName = categories.find(
    (category) => category.id === selectedCategoryId
  )?.name;

  // Xử lý nhập giá
  const handleMinPriceChange = (value: string) => {
    setMinPrice(value.replace(/\D/g, ""));
  };

  const handleMaxPriceChange = (value: string) => {
    setMaxPrice(value.replace(/\D/g, ""));
  };

  // Xóa bộ lọc tìm kiếm và giá
  const handleClearFilters = () => {
    setSearchQuery("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedCategoryId(null);
  };

  // =====================================
  // 3. ĐỊNH DẠNG GIÁ TIỀN
  // =====================================

  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  // =====================================
  // 4. HIỂN THỊ TỪNG SẢN PHẨM
  // =====================================


  const renderProduct = ({ item }: { item: Product }) => {
    return (
      <Pressable
        style={styles.productCard}
        onPress={() => {
          router.push({
            pathname: "/products/[id]",
            params: { id: item.id },
          });
        }}
      >
{item.image ? (
  <Image
    source={{ uri: item.image }}
    style={styles.homeProductImage}
    resizeMode="contain"
  />
) : (
  <View style={[styles.homeProductImage, styles.homeImagePlaceholder]}>
    <Text style={styles.placeholderText}>
      Hình ảnh sản phẩm
    </Text>
  </View>
)}

        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.brand}>
          {item.brand || "Chưa có thương hiệu"}
        </Text>

        <Text style={styles.price}>
          {formatPrice(item.price)}
        </Text>

        <Text style={styles.stock}>
          Còn hàng: {item.stock}
        </Text>
      </Pressable>
    );
  };


  // =====================================
  // 5. TRẠNG THÁI LOADING
  // =====================================

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator
          size="large"
          color="#338DA3"
        />

        <Text style={styles.loadingText}>
          Đang tải dữ liệu...
        </Text>
      </View>
    );
  }

  // =====================================
  // 6. TRẠNG THÁI ERROR
  // =====================================

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error}
        </Text>

        <Pressable
          style={styles.retryButton}
          onPress={loadData}
        >
          <Text style={styles.retryText}>
            Thử lại
          </Text>
        </Pressable>
      </View>
    );
  }

  // =====================================
  // 7. GIAO DIỆN TRANG CHỦ
  // =====================================

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredProducts}
        keyExtractor={(item) => item.id}
        renderItem={renderProduct}
        numColumns={2}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}

        // Phần đầu danh sách
        ListHeaderComponent={
          <View>
            {/* Top Bar */}
            <HomeTopBar cartCount={cartCount} />

            {/* Banner */}
            <Banner />

            {/* Nút xem lịch sử đơn hàng */}
            <Pressable
              onPress={() => router.push("/orders")}
              style={{
                backgroundColor: "#FFFFFF",
                padding: 13,
                borderRadius: 9,
                alignItems: "center",
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#338DA3",
              }}
            >
              <Text style={{ color: "#338DA3", fontWeight: "bold", fontSize: 15 }}>
                📦 Lịch sử đơn hàng
              </Text>
            </Pressable>

            {/* Nút xem profile người dùng */}
            <Pressable
              onPress={() => router.push("/profile")}
              style={{
                backgroundColor: "#FFFFFF",
                padding: 13,
                borderRadius: 9,
                alignItems: "center",
                marginBottom: 10,
                borderWidth: 1,
                borderColor: "#338DA3",
              }}
            >
              <Text
                style={{
                  color: "#338DA3",
                  fontWeight: "bold",
                  fontSize: 15,
                }}
              >
                👤 Thông tin tài khoản
              </Text>
            </Pressable>

            {/* Bộ lọc tìm kiếm và giá */}
            <ProductSearchFilter
              searchQuery={searchQuery}
              minPrice={minPrice}
              maxPrice={maxPrice}
              priceRangeError={isPriceRangeInvalid}
              onSearchChange={setSearchQuery}
              onMinPriceChange={handleMinPriceChange}
              onMaxPriceChange={handleMaxPriceChange}
              onClear={handleClearFilters}
            />

            {/* Menu điều hướng */}
            <View style={styles.menu}>
              {/* Nút Home */}
              <Pressable
                style={[
                  styles.menuItem,
                  !showCategories && styles.activeMenu,
                ]}
                onPress={() => {
                  setShowCategories(false);
                  setSelectedCategoryId(null);
                }}
              >
                <Text
                  style={[
                    styles.menuText,
                    !showCategories && styles.activeMenuText,
                  ]}
                >
                  Home
                </Text>
              </Pressable>

              {/* Nút Danh mục sản phẩm */}
              <Pressable
                style={[
                  styles.menuItem,
                  showCategories && styles.activeMenu,
                ]}
                onPress={() => {
                  setShowCategories(true);
                  setSelectedCategoryId(null);
                }}
              >
                <Text
                  style={[
                    styles.menuText,
                    showCategories && styles.activeMenuText,
                  ]}
                >
                  Danh mục sản phẩm
                </Text>
              </Pressable>
            </View>

            {/* Khu vực danh mục */}
            {showCategories && (
              <View>
                <Text style={styles.sectionTitle}>
                  Chọn danh mục
                </Text>

                <CategorySelector
                  categories={categories}
                  selectedCategoryId={selectedCategoryId}
                  onSelect={setSelectedCategoryId}
                />
              </View>
            )}

            {/* Tiêu đề danh sách sản phẩm */}
            <Text style={styles.sectionTitle}>
              {selectedCategoryId
                ? selectedCategoryName || "Sản phẩm"
                : "Tất cả sản phẩm"}
              {" "}({filteredProducts.length})
            </Text>
          </View>
        }

        // Thông báo khi không có sản phẩm
        ListEmptyComponent={
          <Text style={styles.empty}>
            Không có sản phẩm trong danh mục này.
          </Text>
        }
      />
    </View>
  );
}

// =====================================
// 8. STYLESHEET
// =====================================

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

  // Tiêu đề
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#333333",
  },

  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 5,
  },

  // Menu điều hướng
  menu: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18,
    marginBottom: 18,
  },

  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#EEEEEE",
  },

  activeMenu: {
    backgroundColor: "#338DA3",
  },

  menuText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#555555",
  },

  activeMenuText: {
    color: "#FFFFFF",
  },

  // Tiêu đề danh sách
  sectionTitle: {
    fontSize: 19,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 14,
    color: "#333333",
  },

  // Danh sách sản phẩm
  listContent: {
    paddingBottom: 24,
  },

  row: {
    justifyContent: "space-between",
    gap: 12,
  },

  // Thẻ sản phẩm
  productCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  productImage: {
    width: "100%",
    height: 120,
  },

  imagePlaceholder: {
    height: 120,
    backgroundColor: "#EFF3F5",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },

  placeholderText: {
    color: "#888888",
    fontSize: 12,
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

  // Loading
  loadingText: {
    marginTop: 12,
    color: "#777777",
  },

  // Error
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

  // Danh sách rỗng
  empty: {
    textAlign: "center",
    color: "#888888",
    marginTop: 30,
    width: "100%",
  },
});
