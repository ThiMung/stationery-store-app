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

import {
  getAdminOrders,
  getAdminOrderDetails,
  updateAdminOrderStatus,
  confirmAdminPayment,
} from "../../../services/adminOrderService";
import type {
  AdminOrderDetail,
  AdminOrderSummary,
  OrderStatus,
} from "../../../types/order";
import { getOrderStatusLabel } from "../../../types/order";
import AdminOrderCard from "../../../components/admin/AdminOrderCard";
import AdminOrderDetailModal from "../../../components/admin/AdminOrderDetailModal";

function getNextStatuses(status: OrderStatus): OrderStatus[] {
  switch (status) {
    case "PENDING":
      return ["CONFIRMED", "CANCELLED"];
    case "CONFIRMED":
      return ["SHIPPING", "CANCELLED"];
    case "SHIPPING":
      return ["COMPLETED"];
    default:
      return [];
  }
}

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrderDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Tải danh sách đơn hàng
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAdminOrders();
      setOrders(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải danh sách đơn hàng.";
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

  // Mở chi tiết đơn hàng
  const openOrderDetails = async (orderId: string) => {
    try {
      setDetailLoading(true);
      setSelectedOrder(null);
      const data = await getAdminOrderDetails(orderId);
      setSelectedOrder(data);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể tải chi tiết đơn hàng.";
      Alert.alert("Lỗi", message);
    } finally {
      setDetailLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = (newStatus: OrderStatus) => {
    if (!selectedOrder) return;
    const orderId = selectedOrder.id;
    const statusLabel = getOrderStatusLabel(newStatus);

    Alert.alert(
      "Xác nhận cập nhật",
      `Bạn có muốn chuyển đơn ${orderId} sang trạng thái "${statusLabel}" không?` +
        (newStatus === "CANCELLED" ? "\nSố lượng sản phẩm sẽ được hoàn lại kho." : ""),
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          style: newStatus === "CANCELLED" ? "destructive" : "default",
          onPress: async () => {
            try {
              setUpdating(true);
              await updateAdminOrderStatus(orderId, newStatus);
              const [updatedOrders, updatedDetail] = await Promise.all([
                getAdminOrders(),
                getAdminOrderDetails(orderId),
              ]);
              setOrders(updatedOrders);
              setSelectedOrder(updatedDetail);
              Alert.alert("Thành công", `Đơn hàng đã được cập nhật thành "${statusLabel}".`);
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Không thể cập nhật đơn hàng.";
              Alert.alert("Lỗi", message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  // Admin xác nhận đã nhận tiền chuyển khoản
  const handleConfirmPayment = () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder.id;

    Alert.alert(
      "Xác nhận thanh toán",
      `Xác nhận bạn đã nhận được tiền chuyển khoản cho đơn hàng ${orderId}?`,
      [
        { text: "Kiểm tra lại", style: "cancel" },
        {
          text: "Xác nhận đã nhận tiền",
          onPress: async () => {
            try {
              setUpdating(true);
              await confirmAdminPayment(orderId);
              const [updatedOrders, updatedDetail] = await Promise.all([
                getAdminOrders(),
                getAdminOrderDetails(orderId),
              ]);
              setOrders(updatedOrders);
              setSelectedOrder(updatedDetail);
              Alert.alert(
                "Thành công",
                "Đã cập nhật trạng thái thanh toán thành Đã thanh toán."
              );
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Không thể xác nhận thanh toán.";
              Alert.alert("Lỗi", message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  const nextStatuses = selectedOrder ? getNextStatuses(selectedOrder.status) : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AdminOrderCard order={item} onPress={openOrderDetails} />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadOrders}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Quay lại Dashboard</Text>
            </Pressable>
            <Text style={styles.title}>Quản lý đơn hàng</Text>
            <Text style={styles.subtitle}>Tổng số đơn hàng: {orders.length}</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#338DA3" style={{ marginTop: 30 }} />
          ) : (
            <Text style={styles.emptyText}>Chưa có đơn hàng nào.</Text>
          )
        }
      />

      <AdminOrderDetailModal
        order={selectedOrder}
        loading={detailLoading}
        updating={updating}
        nextStatuses={nextStatuses}
        onClose={() => setSelectedOrder(null)}
        onUpdateStatus={handleUpdateStatus}
        onConfirmPayment={handleConfirmPayment}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  listContent: { padding: 16, paddingBottom: 30 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8 },
  backText: { color: "#338DA3", fontSize: 14, fontWeight: "bold" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333333", marginTop: 8 },
  subtitle: { color: "#777777", fontSize: 13, marginTop: 4, marginBottom: 16 },
  emptyText: { textAlign: "center", color: "#777777", marginTop: 30 },
});
