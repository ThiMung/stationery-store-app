import { useEffect, useState } from "react";

import {
  View,
  Text,
  Image,
  Alert,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  Pressable,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import { router, useLocalSearchParams } from "expo-router";

import { getProductById } from "../../database/database";

import type { Product } from "../../types/product";

import { addToCart } from "../../services/cartService";

export default function ProductDetailScreen() {
  // Nhận ID sản phẩm từ URL
  const { id } = useLocalSearchParams<{ id: string }>();

  const [product, setProduct] = useState<Product | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  // Lấy chi tiết sản phẩm từ SQLite
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true);
        setError("");

        const result = await getProductById(id);

        if (!result) {
          setError("Không tìm thấy sản phẩm.");
          return;
        }

        setProduct(result);

      } catch (error) {
        console.error("Product detail error:", error);
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  // Thêm sản phẩm vào giỏ hàng
  const handleAddToCart = async () => {
  if (!product) return;

  try {
    await addToCart(product.id, 1);

    Alert.alert(
      "Thành công",
      "Đã thêm sản phẩm vào giỏ hàng.",
      [
        {
          text: "Tiếp tục mua",
          style: "cancel",
        },
        {
          text: "Xem giỏ hàng",
          onPress: () => router.push("/cart"),
        },
      ]
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Không thể thêm sản phẩm vào giỏ hàng.";

    if (message === "Bạn cần đăng nhập để sử dụng giỏ hàng.") {
      Alert.alert(
        "Bạn chưa đăng nhập",
        "Vui lòng đăng nhập trước khi thêm sản phẩm.",
        [
          { text: "Hủy", style: "cancel" },
          {
            text: "Đăng nhập",
            onPress: () => router.push("/(tabs)/login"),
          },
        ]
      );
    } else {
      Alert.alert("Không thể thêm sản phẩm", message);
    }
  }
};

  // Định dạng giá tiền
  const formatPrice = (price: number) => {
    return price.toLocaleString("vi-VN") + " đ";
  };

  // Loading
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />

        <Text style={styles.loadingText}>
          Đang tải sản phẩm...
        </Text>
      </View>
    );
  }

  // Error
  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || "Không tìm thấy sản phẩm."}
        </Text>

        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            Quay lại
          </Text>
        </Pressable>
      </View>
    );
  }

  // Hiển thị chi tiết sản phẩm
  return (
      <SafeAreaView
    style={{ flex: 1, backgroundColor: "#FFFFFF" }}
    edges={["top", "bottom"]}
  >
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{
        paddingBottom: 36,
      }}
      showsVerticalScrollIndicator={false}
    >

        {/* Nút quay lại */}
        <Pressable
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>
            ‹  Quay lại
          </Text>
        </Pressable>

        {/* Hình ảnh sản phẩm */}
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.placeholderText}>
              Chưa có hình ảnh sản phẩm
            </Text>
          </View>
        )}

        {/* Thông tin sản phẩm */}
        <View style={styles.content}>

          <Text style={styles.category}>
            {product.categoryName || "Chưa phân loại"}
          </Text>

          <Text style={styles.name}>
            {product.name}
          </Text>

          <Text style={styles.price}>
            {formatPrice(product.price)}
          </Text>

          <View style={styles.divider} />

          {/* Thông tin chi tiết */}
          <Text style={styles.sectionTitle}>
            Thông tin sản phẩm
          </Text>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Mã sản phẩm
            </Text>

            <Text style={styles.infoValue}>
              {product.id}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Thương hiệu
            </Text>

            <Text style={styles.infoValue}>
              {product.brand || "Chưa cập nhật"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Danh mục
            </Text>

            <Text style={styles.infoValue}>
              {product.categoryName || "Chưa phân loại"}
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Đánh giá
            </Text>

            <Text style={styles.infoValue}>
              {product.rating ?? 0} / 5
            </Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>
              Tồn kho
            </Text>

            <Text style={styles.infoValue}>
              {product.stock > 0
                ? `Còn ${product.stock} sản phẩm`
                : "Hết hàng"}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.sectionTitle}>
            Mô tả sản phẩm
          </Text>

          <Text style={styles.description}>
            {product.description || "Chưa có mô tả sản phẩm."}
          </Text>

          <Pressable
            onPress={handleAddToCart}
            disabled={product.stock <= 0}
            style={{
              backgroundColor: product.stock > 0 ? "#338DA3" : "#AAAAAA",
              padding: 14,
              borderRadius: 9,
              alignItems: "center",
              marginTop: 18,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "bold" }}>
              {product.stock > 0 ? "Thêm vào giỏ hàng" : "Hết hàng"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => router.push("/cart")}
            style={{
              padding: 13,
              borderRadius: 9,
              alignItems: "center",
              marginTop: 8,
              borderWidth: 1,
              borderColor: "#338DA3",
            }}
          >
            <Text style={{ color: "#338DA3", fontWeight: "bold" }}>
              Xem giỏ hàng
            </Text>
          </Pressable>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },

  loadingText: {
    marginTop: 12,
    color: "#777777",
  },

  error: {
    color: "#E74C3C",
    fontSize: 16,
    textAlign: "center",
  },

  backButton: {
    alignSelf: "flex-start",
    margin: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#E8F3F5",
    borderRadius: 20,
  },

  backButtonText: {
    color: "#338DA3",
    fontWeight: "600",
    fontSize: 15,
  },

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
});
