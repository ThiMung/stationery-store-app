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

import { getUserOrders } from "../../services/orderService";
import { getCurrentUser } from "../../services/authService";
import type { OrderSummary } from "../../types/order";
import UserOrderCard from "../../components/order/UserOrderCard";

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  // Tải lịch sử đơn hàng từ SQLite
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const user = await getCurrentUser();
      if (!user) {
        setNeedLogin(true);
        setOrders([]);
        return;
      }

      setNeedLogin(false);
      const data = await getUserOrders();
      setOrders(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải lịch sử đơn hàng.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang tải lịch sử đơn hàng...</Text>
      </View>
    );
  }

  if (needLogin) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.emptyText}>Vui lòng đăng nhập để xem đơn hàng đã mua.</Text>
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
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <UserOrderCard order={item} />}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadOrders}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Quay lại</Text>
            </Pressable>
            <Text style={styles.title}>Lịch sử đơn hàng</Text>
            <Text style={styles.subtitle}>
              Các đơn hàng bạn đã đặt tại Happy Store.
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Chưa có đơn hàng nào</Text>
            <Text style={styles.emptyText}>
              Hãy bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn!
            </Text>
            <Pressable
              style={styles.primaryButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.primaryButtonText}>Mua sắm ngay</Text>
            </Pressable>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  listContent: { padding: 16, paddingBottom: 30 },
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
  title: { fontSize: 24, fontWeight: "bold", color: "#333333", marginTop: 8 },
  subtitle: { color: "#777777", fontSize: 13, marginTop: 4, marginBottom: 16 },
  emptyContainer: { alignItems: "center", marginTop: 40, paddingHorizontal: 20 },
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
