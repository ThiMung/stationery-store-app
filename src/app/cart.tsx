import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  type CartItem,
} from "../services/cartService";
import { getCurrentUser } from "../services/authService";
import CartItemCard from "../components/cart/CartItemCard";
import CartSummary from "../components/cart/CartSummary";
import EmptyCart from "../components/cart/EmptyCart";

export default function CartScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  // Tải giỏ hàng của tài khoản đang đăng nhập
  const loadCart = useCallback(async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setNeedLogin(true);
        setCartItems([]);
        return;
      }

      setNeedLogin(false);
      const data = await getCartItems();
      setCartItems(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải giỏ hàng.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Thay đổi số lượng sản phẩm
  const handleChangeQuantity = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItemQuantity(item.id, newQuantity);
      await loadCart();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật số lượng.";
      Alert.alert("Lỗi", message);
    }
  };

  // Xác nhận xóa sản phẩm khỏi giỏ hàng
  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      "Xóa sản phẩm",
      `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await removeCartItem(item.id);
              await loadCart();
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Không thể xóa sản phẩm.";
              Alert.alert("Lỗi", message);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang tải giỏ hàng...</Text>
      </View>
    );
  }

  if (needLogin) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.emptyText}>Vui lòng đăng nhập để xem giỏ hàng.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(tabs)/login")}
        >
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }} edges={["top", "bottom"]}>
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CartItemCard
            item={item}
            onChangeQuantity={handleChangeQuantity}
            onRemoveItem={handleRemoveItem}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadCart}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Tiếp tục xem sản phẩm</Text>
            </Pressable>
            <Text style={styles.title}>Giỏ hàng của bạn</Text>
            <Text style={styles.subtitle}>
              {cartItems.length > 0
                ? `Bạn đang có ${cartItems.length} loại sản phẩm trong giỏ.`
                : "Giỏ hàng hiện tại chưa có sản phẩm nào."}
            </Text>
          </View>
        }
        ListEmptyComponent={<EmptyCart onContinueShopping={() => router.replace("/(tabs)")} />}
        ListFooterComponent={
          cartItems.length > 0 ? (
            <CartSummary
              totalAmount={totalAmount}
              onCheckout={() => router.push("/checkout")}
            />
          ) : undefined
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: 16,
    paddingBottom: 30,
    flexGrow: 1,
  },
  center: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  loadingText: { color: "#777777", marginTop: 12 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8 },
  backText: { color: "#338DA3", fontSize: 14, fontWeight: "bold" },
  title: { fontSize: 23, fontWeight: "bold", color: "#333333", marginTop: 12 },
  subtitle: { fontSize: 13, color: "#777777", marginTop: 5, marginBottom: 15 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333333" },
  emptyText: { color: "#777777", textAlign: "center", marginTop: 8 },
  primaryButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "bold" },
});
