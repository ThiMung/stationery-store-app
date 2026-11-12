
import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentUser } from "../services/authService";
import { getCartItems, type CartItem } from "../services/cartService";
import { createOrder } from "../services/orderService";

export default function CheckoutScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  // Tải thông tin tài khoản và giỏ hàng
  const loadCheckoutData = useCallback(async () => {
    try {
      setLoading(true);

      const user = await getCurrentUser();

      if (!user) {
        setNeedLogin(true);
        setCartItems([]);
        return;
      }

      setNeedLogin(false);

      setRecipientName(user.fullName);
      setPhone(user.phone ?? "");
      setAddress(user.address ?? "");

      const items = await getCartItems();
      setCartItems(items);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin thanh toán.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCheckoutData();
    }, [loadCheckoutData])
  );

  // Tính tổng tiền từ dữ liệu giỏ hàng đang hiển thị
  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Thực hiện tạo đơn hàng
  const submitOrder = async () => {
    try {
      setSubmitting(true);

      const result = await createOrder({
        recipientName,
        phone,
        address,
      });

      setCartItems([]);

    Alert.alert(
    "Đặt hàng thành công!",
    `Mã đơn hàng: ${result.orderId}\n` +
    `Số loại sản phẩm: ${result.itemCount}\n` +
    `Tổng tiền: ${result.totalAmount.toLocaleString("vi-VN")} đ`,
    [
        {
        text: "Về trang chủ",
        onPress: () => router.replace("/(tabs)"),
        },
        {
        text: "Xem đơn hàng",
        onPress: () =>
            router.replace({
            pathname: "/orders/[id]",
            params: { id: result.orderId },
            }),
        },
    ]
    );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tạo đơn hàng.";

      Alert.alert("Không thể đặt hàng", message);
    } finally {
      setSubmitting(false);
    }
  };

  // Xác nhận trước khi đặt hàng
  const handlePlaceOrder = () => {
    Alert.alert(
      "Xác nhận đặt hàng",
      `Bạn muốn đặt đơn hàng với tổng tiền ${totalAmount.toLocaleString("vi-VN")} đ?`,
      [
        {
          text: "Kiểm tra lại",
          style: "cancel",
        },
        {
          text: "Xác nhận đặt hàng",
          onPress: submitOrder,
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (needLogin) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          Bạn chưa đăng nhập
        </Text>

        <Text style={styles.emptyText}>
          Vui lòng đăng nhập trước khi đặt hàng.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(tabs)/login")}
        >
          <Text style={styles.primaryButtonText}>
            Đăng nhập
          </Text>
        </Pressable>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          Giỏ hàng đang trống
        </Text>

        <Text style={styles.emptyText}>
          Hãy thêm sản phẩm trước khi thanh toán.
        </Text>

        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/cart")}
        >
          <Text style={styles.primaryButtonText}>
            Quay lại giỏ hàng
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
  <SafeAreaView
    style={{ flex: 1, backgroundColor: "#F5F7FA" }}
    edges={["top", "bottom"]}
  >
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.content,
          { paddingBottom: 36 },
        ]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={
          Platform.OS === "ios" ? "interactive" : "on-drag"
        }
        showsVerticalScrollIndicator={false}
      >

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ‹ Quay lại giỏ hàng
        </Text>
      </Pressable>

      <Text style={styles.title}>Thanh toán</Text>

      <Text style={styles.subtitle}>
        Kiểm tra thông tin và xác nhận đơn hàng của bạn.
      </Text>

      {/* Thông tin người nhận */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          1. Thông tin nhận hàng
        </Text>

        <Text style={styles.inputLabel}>
          Họ và tên người nhận *
        </Text>

        <TextInput
          style={styles.input}
          value={recipientName}
          onChangeText={setRecipientName}
          placeholder="Nhập họ tên người nhận"
          maxLength={100}
        />

        <Text style={styles.inputLabel}>
          Số điện thoại *
        </Text>

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />

        <Text style={styles.inputLabel}>
          Địa chỉ nhận hàng *
        </Text>

        <TextInput
          style={[styles.input, styles.addressInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ nhận hàng"
          multiline
          maxLength={250}
        />
      </View>

      {/* Danh sách sản phẩm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          2. Đơn hàng của bạn
        </Text>

        {cartItems.map((item) => (
          <View key={item.id} style={styles.productRow}>
            <View style={styles.productInfo}>
              <Text style={styles.productName}>
                {item.name}
              </Text>

              <Text style={styles.productQuantity}>
                {item.price.toLocaleString("vi-VN")} đ × {item.quantity}
              </Text>
            </View>

            <Text style={styles.subtotal}>
              {(item.price * item.quantity).toLocaleString("vi-VN")} đ
            </Text>
          </View>
        ))}
      </View>

      {/* Phương thức thanh toán demo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          3. Phương thức thanh toán
        </Text>

        <View style={styles.paymentOption}>
          <Text style={styles.paymentIcon}>💵</Text>

          <View style={{ flex: 1 }}>
            <Text style={styles.paymentTitle}>
              Thanh toán khi nhận hàng (COD)
            </Text>

            <Text style={styles.paymentDescription}>
              Bạn thanh toán trực tiếp khi nhận được sản phẩm.
            </Text>
          </View>
        </View>
      </View>

      {/* Tổng tiền */}
      <View style={styles.section}>
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>
            Tổng tiền đơn hàng
          </Text>

          <Text style={styles.totalPrice}>
            {totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>
      </View>

      <Pressable
        style={[
          styles.orderButton,
          submitting && styles.disabledButton,
        ]}
        onPress={handlePlaceOrder}
        disabled={submitting || cartItems.length === 0}
      >
        {submitting ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.orderButtonText}>
            Xác nhận đặt hàng
          </Text>
        )}
      </Pressable>
    </ScrollView>
  </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  center: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 25,
  },
  loadingText: {
    color: "#777777",
    marginTop: 12,
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
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 12,
  },
  subtitle: {
    color: "#777777",
    fontSize: 13,
    marginTop: 6,
    marginBottom: 16,
  },
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 14,
  },
  inputLabel: {
    color: "#555555",
    fontSize: 13,
    fontWeight: "600",
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
  addressInput: {
    minHeight: 85,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "600",
  },
  productQuantity: {
    color: "#888888",
    fontSize: 12,
    marginTop: 5,
  },
  subtotal: {
    color: "#333333",
    fontWeight: "bold",
    fontSize: 13,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderWidth: 1,
    borderColor: "#338DA3",
    borderRadius: 9,
    backgroundColor: "#F0F8FA",
  },
  paymentIcon: {
    fontSize: 25,
    marginRight: 12,
  },
  paymentTitle: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#333333",
  },
  paymentDescription: {
    fontSize: 11,
    color: "#777777",
    marginTop: 4,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#555555",
    fontSize: 14,
    fontWeight: "bold",
  },
  totalPrice: {
    color: "#E76F51",
    fontSize: 19,
    fontWeight: "bold",
  },
  orderButton: {
    backgroundColor: "#338DA3",
    padding: 15,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 3,
  },
  disabledButton: {
    opacity: 0.6,
  },
  orderButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  emptyTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333333",
  },
  emptyText: {
    color: "#777777",
    textAlign: "center",
    marginTop: 8,
  },
  primaryButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
