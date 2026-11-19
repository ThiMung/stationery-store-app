import { useCallback, useState } from "react";
import {
  View,
  Text,
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
import type { PaymentMethod } from "../types/order";
import RecipientForm from "../components/checkout/RecipientForm";
import CheckoutItemList from "../components/checkout/CheckoutItemList";
import PaymentMethodSelector from "../components/checkout/PaymentMethodSelector";
import CheckoutSummary from "../components/checkout/CheckoutSummary";

export default function CheckoutScreen() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [recipientName, setRecipientName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("COD");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  // Tải thông tin tài khoản và giỏ hàng từ SQLite
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
        error instanceof Error ? error.message : "Không thể tải thông tin thanh toán.";
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

  const totalAmount = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // Gửi yêu cầu tạo đơn hàng
  const submitOrder = async () => {
    try {
      setSubmitting(true);
      const result = await createOrder({
        recipientName,
        phone,
        address,
        paymentMethod,
      });

      setCartItems([]);
      Alert.alert(
        "Đặt hàng thành công!",
        `Mã đơn hàng: ${result.orderId}\n` +
          `Số loại sản phẩm: ${result.itemCount}\n` +
          `Tổng tiền: ${result.totalAmount.toLocaleString("vi-VN")} đ\n` +
          `Phương thức: ${
            result.paymentMethod === "BANK_TRANSFER"
              ? "Chuyển khoản ngân hàng"
              : "Thanh toán khi nhận hàng (COD)"
          }`,
        [
          { text: "Về trang chủ", onPress: () => router.replace("/(tabs)") },
          {
            text: "Xem đơn hàng",
            onPress: () =>
              router.replace({ pathname: "/orders/[id]", params: { id: result.orderId } }),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tạo đơn hàng.";
      Alert.alert("Không thể đặt hàng", message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePlaceOrder = () => {
    Alert.alert(
      "Xác nhận đặt hàng",
      `Bạn muốn đặt đơn hàng với tổng tiền ${totalAmount.toLocaleString("vi-VN")} đ?`,
      [
        { text: "Kiểm tra lại", style: "cancel" },
        { text: "Xác nhận đặt hàng", onPress: submitOrder },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang tải thông tin...</Text>
      </View>
    );
  }

  if (needLogin) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.emptyText}>Vui lòng đăng nhập trước khi đặt hàng.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(tabs)/login")}
        >
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        </Pressable>
      </View>
    );
  }

  if (cartItems.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Giỏ hàng đang trống</Text>
        <Text style={styles.emptyText}>Hãy thêm sản phẩm trước khi thanh toán.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.replace("/cart")}
        >
          <Text style={styles.primaryButtonText}>Quay lại giỏ hàng</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }} edges={["top", "bottom"]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={[styles.content, { paddingBottom: 36 }]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
          showsVerticalScrollIndicator={false}
        >
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>‹ Quay lại giỏ hàng</Text>
          </Pressable>

          <Text style={styles.title}>Thanh toán</Text>
          <Text style={styles.subtitle}>
            Kiểm tra thông tin và xác nhận đơn hàng của bạn.
          </Text>

          <RecipientForm
            recipientName={recipientName}
            setRecipientName={setRecipientName}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
          />

          <CheckoutItemList items={cartItems} />

          <PaymentMethodSelector
            selectedMethod={paymentMethod}
            onSelectMethod={setPaymentMethod}
          />

          <CheckoutSummary
            totalAmount={totalAmount}
            submitting={submitting}
            disabled={submitting || cartItems.length === 0}
            onPlaceOrder={handlePlaceOrder}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 35 },
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
  title: { fontSize: 24, fontWeight: "bold", color: "#333333", marginTop: 12 },
  subtitle: { color: "#777777", fontSize: 13, marginTop: 6, marginBottom: 16 },
  emptyTitle: { fontSize: 19, fontWeight: "bold", color: "#333333" },
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
