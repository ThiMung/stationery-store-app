
import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import Header from "../components/Header";
import {
  getCartItems,
  updateCartItemQuantity,
  removeCartItem,
  type CartItem,
} from "../services/cartService";
import { getCurrentUser } from "../services/authService";

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
        error instanceof Error
          ? error.message
          : "Không thể tải giỏ hàng.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại giỏ hàng khi mở màn hình
  useFocusEffect(
    useCallback(() => {
      loadCart();
    }, [loadCart])
  );

  // Tính tổng tiền
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Thay đổi số lượng sản phẩm
  const handleChangeQuantity = async (
    item: CartItem,
    newQuantity: number
  ) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      await updateCartItemQuantity(item.id, newQuantity);
      await loadCart();
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật số lượng.";

      Alert.alert("Lỗi", message);
    }
  };

  // Xác nhận xóa sản phẩm
  const handleRemoveItem = (item: CartItem) => {
    Alert.alert(
      "Xóa sản phẩm",
      `Bạn có muốn xóa "${item.name}" khỏi giỏ hàng không?`,
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
              await removeCartItem(item.id);
              await loadCart();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Không thể xóa sản phẩm.";

              Alert.alert("Lỗi", message);
            }
          },
        },
      ]
    );
  };

  // Hiển thị từng sản phẩm trong giỏ hàng
  const renderCartItem = ({ item }: { item: CartItem }) => {
    return (
      <View style={styles.cartCard}>
        <View style={styles.productRow}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Text style={styles.placeholderText}>Ảnh</Text>
            </View>
          )}

          <View style={styles.productInfo}>
            <Text style={styles.productName}>
              {item.name}
            </Text>

            <Text style={styles.category}>
              {item.categoryName ?? "Chưa phân loại"}
            </Text>

            <Text style={styles.price}>
              {item.price.toLocaleString("vi-VN")} đ
            </Text>

            <Text style={styles.stock}>
              Còn lại: {item.stock}
            </Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.quantityControl}>
            <Pressable
              style={styles.quantityButton}
              onPress={() =>
                handleChangeQuantity(item, item.quantity - 1)
              }
              disabled={item.quantity <= 1}
            >
              <Text style={styles.quantityButtonText}>−</Text>
            </Pressable>

            <Text style={styles.quantityText}>
              {item.quantity}
            </Text>

            <Pressable
              style={styles.quantityButton}
              onPress={() =>
                handleChangeQuantity(item, item.quantity + 1)
              }
              disabled={item.quantity >= item.stock}
            >
              <Text style={styles.quantityButtonText}>+</Text>
            </Pressable>
          </View>

          <Text style={styles.subtotal}>
            {(item.price * item.quantity).toLocaleString("vi-VN")} đ
          </Text>

          <Pressable
            onPress={() => handleRemoveItem(item)}
            style={styles.removeButton}
          >
            <Text style={styles.removeText}>Xóa</Text>
          </Pressable>
        </View>
      </View>
    );
  };

  return (
      <SafeAreaView
    style={styles.container}
    edges={["top", "bottom"]}
  >
      <FlatList
        data={cartItems}
        keyExtractor={(item) => item.id}
        renderItem={renderCartItem}
        contentContainerStyle={[
        styles.listContent,
        { paddingBottom: 36 },
      ]}
        refreshing={loading}
        onRefresh={loadCart}
        ListHeaderComponent={
          <View>
            <Header />

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>
                ‹ Quay lại mua sắm
              </Text>
            </Pressable>

            <Text style={styles.title}>Giỏ hàng của tôi</Text>

            {!needLogin && (
              <Text style={styles.subtitle}>
                {cartItems.length} sản phẩm trong giỏ hàng
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#338DA3"
              style={{ marginTop: 30 }}
            />
          ) : needLogin ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyTitle}>
                Bạn chưa đăng nhập
              </Text>

              <Text style={styles.emptyText}>
                Vui lòng đăng nhập để xem và quản lý giỏ hàng.
              </Text>

              <Pressable
                style={styles.shopButton}
                onPress={() => router.push("/(tabs)/login")}
              >
                <Text style={styles.shopButtonText}>
                  Đăng nhập
                </Text>
              </Pressable>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🛒</Text>

              <Text style={styles.emptyTitle}>
                Giỏ hàng đang trống
              </Text>

              <Text style={styles.emptyText}>
                Hãy khám phá và chọn những sản phẩm bạn yêu thích nhé!
              </Text>

              <Pressable
                style={styles.shopButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.shopButtonText}>
                  Tiếp tục mua sắm
                </Text>
              </Pressable>
            </View>
          )
        }
        ListFooterComponent={
          cartItems.length > 0 ? (
            <View style={styles.summary}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>
                  Tổng tiền
                </Text>

                <Text style={styles.totalPrice}>
                  {totalAmount.toLocaleString("vi-VN")} đ
                </Text>
              </View>

                <Pressable
                style={styles.checkoutButton}
                onPress={() => router.push("/checkout")}
                >
                <Text style={styles.checkoutText}>
                    Tiến hành thanh toán
                </Text>
                </Pressable>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
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
    flexGrow: 1,
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
    marginTop: 12,
  },
  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 5,
    marginBottom: 15,
  },
  cartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  productImage: {
    width: 80,
    aspectRatio: 1,
    borderRadius: 8,
    backgroundColor: "#F5F7FA",
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 80,
    height: 85,
    borderRadius: 8,
    backgroundColor: "#EAF2F4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  placeholderText: {
    color: "#338DA3",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  category: {
    fontSize: 12,
    color: "#888888",
    marginTop: 4,
  },
  price: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#E76F51",
    marginTop: 6,
  },
  stock: {
    fontSize: 11,
    color: "#777777",
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
  },
  quantityButton: {
    width: 30,
    height: 30,
    borderRadius: 7,
    backgroundColor: "#EAF2F4",
    justifyContent: "center",
    alignItems: "center",
  },
  quantityButtonText: {
    fontSize: 19,
    color: "#338DA3",
    fontWeight: "bold",
  },
  quantityText: {
    minWidth: 30,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  subtotal: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333333",
  },
  removeButton: {
    padding: 5,
  },
  removeText: {
    color: "#DC5555",
    fontSize: 12,
    fontWeight: "bold",
  },
  summary: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    color: "#555555",
    fontSize: 15,
    fontWeight: "bold",
  },
  totalPrice: {
    color: "#E76F51",
    fontSize: 19,
    fontWeight: "bold",
  },
  checkoutButton: {
    backgroundColor: "#338DA3",
    padding: 14,
    alignItems: "center",
    borderRadius: 9,
  },
  checkoutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 25,
    marginTop: 35,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  emptyText: {
    fontSize: 13,
    color: "#777777",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  shopButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  shopButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
