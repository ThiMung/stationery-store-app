import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getOrderDetails } from "../../services/orderService";
import type { OrderDetail } from "../../types/order";
import OrderDetailInfo from "../../components/order/OrderDetailInfo";
import OrderDetailItems from "../../components/order/OrderDetailItems";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Tải chi tiết đơn hàng từ SQLite
  const loadOrder = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await getOrderDetails(id);
      setOrder(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải chi tiết đơn hàng.";
      Alert.alert("Lỗi", message, [
        { text: "Quay lại", onPress: () => router.back() },
      ]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      loadOrder();
    }, [loadOrder])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang tải thông tin đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Không tìm thấy đơn hàng.</Text>
        <Pressable style={styles.button} onPress={() => router.back()}>
          <Text style={styles.buttonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }} edges={["top", "bottom"]}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Quay lại lịch sử đơn hàng</Text>
        </Pressable>

        <Text style={styles.title}>Chi tiết đơn hàng</Text>

        <OrderDetailInfo order={order} />

        <OrderDetailItems items={order.items} totalAmount={order.totalAmount} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 36,
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 8,
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333333" },
  button: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  buttonText: { color: "#FFFFFF", fontWeight: "bold" },
});
