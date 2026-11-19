import { useEffect, useState } from "react";
import {
  View,
  Text,
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
import ProductDetailBody from "../../components/product/ProductDetailBody";

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
      } catch (err) {
        setError("Không thể tải thông tin sản phẩm.");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadProduct();
    }
  }, [id]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart(product.id, 1);
      Alert.alert("Thành công", "Đã thêm sản phẩm vào giỏ hàng.", [
        { text: "Tiếp tục mua", style: "cancel" },
        { text: "Xem giỏ hàng", onPress: () => router.push("/cart") },
      ]);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Không thể thêm sản phẩm vào giỏ hàng.";

      if (message === "Bạn cần đăng nhập để sử dụng giỏ hàng.") {
        Alert.alert(
          "Bạn chưa đăng nhập",
          "Vui lòng đăng nhập trước khi thêm sản phẩm.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Đăng nhập", onPress: () => router.push("/(tabs)/login") },
          ]
        );
      } else {
        Alert.alert("Lỗi", message);
      }
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang tải chi tiết sản phẩm...</Text>
      </View>
    );
  }

  if (error || !product) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "Không tìm thấy sản phẩm."}</Text>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top", "bottom"]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>‹ Quay lại</Text>
        </Pressable>

        <ProductDetailBody product={product} onAddToCart={handleAddToCart} />
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
});
