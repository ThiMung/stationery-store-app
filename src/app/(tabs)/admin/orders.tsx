
import { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import {
  getAdminOrders,
  getAdminOrderDetails,
  updateAdminOrderStatus,
  type AdminOrderSummary,
  type AdminOrderDetail,
  type OrderStatus,
} from "../../../services/adminOrderService";

// Chuyển mã trạng thái sang tiếng Việt
function getStatusLabel(status: OrderStatus) {
  switch (status) {
    case "PENDING":
      return "Chờ xử lý";
    case "CONFIRMED":
      return "Đã xác nhận";
    case "SHIPPING":
      return "Đang giao hàng";
    case "COMPLETED":
      return "Đã hoàn thành";
    case "CANCELLED":
      return "Đã hủy";
    default:
      return status;
  }
}

// Định dạng ngày giờ
function formatDate(dateString: string | null) {
  if (!dateString) {
    return "Chưa có thông tin";
  }

  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("vi-VN");
}

// Các trạng thái có thể chuyển tiếp
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

  const [selectedOrder, setSelectedOrder] =
    useState<AdminOrderDetail | null>(null);

  const [detailLoading, setDetailLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Tải toàn bộ đơn hàng
  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getAdminOrders();
      setOrders(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách đơn hàng.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại khi mở màn hình
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
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết đơn hàng.";

      Alert.alert("Lỗi", message);
    } finally {
      setDetailLoading(false);
    }
  };

  // Cập nhật trạng thái đơn hàng
  const handleUpdateStatus = (newStatus: OrderStatus) => {
    if (!selectedOrder) {
      return;
    }

    const orderId = selectedOrder.id;
    const statusLabel = getStatusLabel(newStatus);

    Alert.alert(
      "Xác nhận cập nhật",
      `Bạn có muốn chuyển đơn ${orderId} sang trạng thái "${statusLabel}" không?` +
        (newStatus === "CANCELLED"
          ? "\nSố lượng sản phẩm sẽ được hoàn lại kho."
          : ""),
      [
        {
          text: "Hủy",
          style: "cancel",
        },
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

              Alert.alert(
                "Thành công",
                `Đơn hàng đã được cập nhật thành "${statusLabel}".`
              );
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Không thể cập nhật đơn hàng.";

              Alert.alert("Lỗi", message);
            } finally {
              setUpdating(false);
            }
          },
        },
      ]
    );
  };

  // Hiển thị một đơn hàng trong danh sách
  const renderOrder = ({ item }: { item: AdminOrderSummary }) => {
    return (
      <Pressable
        style={styles.orderCard}
        onPress={() => openOrderDetails(item.id)}
      >
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderId}>
              {item.id}
            </Text>

            <Text style={styles.customerName}>
              Người nhận: {item.recipientName}
            </Text>

            <Text style={styles.email}>
              {item.email ?? "Tài khoản không còn tồn tại"}
            </Text>
          </View>

          <Text style={styles.statusBadge}>
            {getStatusLabel(item.status)}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.orderDate}>
              {formatDate(item.createdAt)}
            </Text>

            <Text style={styles.itemCount}>
              {item.itemCount} loại sản phẩm
            </Text>
          </View>

          <Text style={styles.totalPrice}>
            {item.totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <Text style={styles.detailLink}>
          Xem chi tiết và cập nhật trạng thái →
        </Text>
      </Pressable>
    );
  };

  const nextStatuses = selectedOrder
    ? getNextStatuses(selectedOrder.status)
    : [];

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadOrders}
        ListHeaderComponent={
          <View>
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>
                ‹ Quay lại Dashboard
              </Text>
            </Pressable>

            <Text style={styles.title}>
              Quản lý đơn hàng
            </Text>

            <Text style={styles.subtitle}>
              Tổng số đơn hàng: {orders.length}
            </Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator
              size="large"
              color="#338DA3"
              style={{ marginTop: 30 }}
            />
          ) : (
            <Text style={styles.emptyText}>
              Chưa có đơn hàng nào.
            </Text>
          )
        }
      />

      {/* Cửa sổ chi tiết đơn hàng */}
      <Modal
        visible={selectedOrder !== null || detailLoading}
        transparent
        animationType="slide"
        onRequestClose={() => {
          if (!updating) {
            setSelectedOrder(null);
          }
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {detailLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#338DA3" />
                <Text style={styles.emptyText}>
                  Đang tải chi tiết đơn hàng...
                </Text>
              </View>
            ) : selectedOrder ? (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Chi tiết đơn hàng
                  </Text>

                  <Pressable
                    onPress={() => setSelectedOrder(null)}
                    disabled={updating}
                  >
                    <Text style={styles.closeButton}>✕</Text>
                  </Pressable>
                </View>

                <ScrollView
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled"
                >
                  <Text style={styles.label}>Mã đơn hàng</Text>
                  <Text style={styles.value}>
                    {selectedOrder.id}
                  </Text>

                  <Text style={styles.label}>Ngày đặt</Text>
                  <Text style={styles.value}>
                    {formatDate(selectedOrder.createdAt)}
                  </Text>

                  <Text style={styles.label}>Trạng thái hiện tại</Text>
                  <Text style={styles.statusValue}>
                    {getStatusLabel(selectedOrder.status)}
                  </Text>

                  <View style={styles.separator} />

                  <Text style={styles.sectionTitle}>
                    Thông tin nhận hàng
                  </Text>

                  <Text style={styles.label}>Người nhận</Text>
                  <Text style={styles.value}>
                    {selectedOrder.recipientName}
                  </Text>

                  <Text style={styles.label}>Email tài khoản</Text>
                  <Text style={styles.value}>
                    {selectedOrder.email ?? "Không còn tài khoản"}
                  </Text>

                  <Text style={styles.label}>Số điện thoại</Text>
                  <Text style={styles.value}>
                    {selectedOrder.phone}
                  </Text>

                  <Text style={styles.label}>Địa chỉ</Text>
                  <Text style={styles.value}>
                    {selectedOrder.address}
                  </Text>

                  <View style={styles.separator} />

                  <Text style={styles.sectionTitle}>
                    Sản phẩm trong đơn
                  </Text>

                  {selectedOrder.items.map((item) => (
                    <View key={item.id} style={styles.itemRow}>
                      <View style={styles.itemInfo}>
                        <Text style={styles.productName}>
                          {item.productName}
                        </Text>

                        <Text style={styles.itemQuantity}>
                          {item.unitPrice.toLocaleString("vi-VN")} đ × {item.quantity}
                        </Text>
                      </View>

                      <Text style={styles.itemTotal}>
                        {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} đ
                      </Text>
                    </View>
                  ))}

                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>
                      Tổng tiền
                    </Text>

                    <Text style={styles.totalPrice}>
                      {selectedOrder.totalAmount.toLocaleString("vi-VN")} đ
                    </Text>
                  </View>

                  <View style={styles.separator} />

                  <Text style={styles.sectionTitle}>
                    Cập nhật trạng thái
                  </Text>

                  {updating ? (
                    <ActivityIndicator color="#338DA3" />
                  ) : nextStatuses.length > 0 ? (
                    <View style={styles.statusActions}>
                      {nextStatuses.map((status) => (
                        <Pressable
                          key={status}
                          style={[
                            styles.statusButton,
                            status === "CANCELLED"
                              ? styles.cancelButton
                              : styles.updateButton,
                          ]}
                          onPress={() => handleUpdateStatus(status)}
                        >
                          <Text style={styles.statusButtonText}>
                            {status === "CANCELLED"
                              ? "Hủy đơn hàng"
                              : `Chuyển sang ${getStatusLabel(status)}`}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  ) : (
                    <Text style={styles.terminalText}>
                      Đơn hàng đã kết thúc, không thể cập nhật thêm trạng thái.
                    </Text>
                  )}
                </ScrollView>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
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
    fontWeight: "bold",
    fontSize: 14,
  },
  title: {
    fontSize: 23,
    color: "#333333",
    fontWeight: "bold",
    marginTop: 12,
  },
  subtitle: {
    color: "#777777",
    fontSize: 13,
    marginTop: 5,
    marginBottom: 15,
  },
  orderCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 13,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  orderHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  orderInfo: {
    flex: 1,
    marginRight: 8,
  },
  orderId: {
    color: "#333333",
    fontSize: 14,
    fontWeight: "bold",
  },
  customerName: {
    color: "#555555",
    fontSize: 12,
    marginTop: 7,
  },
  email: {
    color: "#888888",
    fontSize: 11,
    marginTop: 4,
  },
  statusBadge: {
    color: "#338DA3",
    fontSize: 11,
    fontWeight: "bold",
    backgroundColor: "#EAF2F4",
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7,
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 13,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  orderDate: {
    fontSize: 11,
    color: "#888888",
  },
  itemCount: {
    fontSize: 12,
    color: "#666666",
    marginTop: 5,
  },
  totalPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E76F51",
  },
  detailLink: {
    textAlign: "right",
    color: "#338DA3",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#888888",
    marginTop: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 14,
  },
  modalContent: {
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 18,
  },
  loadingContainer: {
    padding: 35,
    alignItems: "center",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333333",
  },
  closeButton: {
    color: "#777777",
    fontSize: 21,
    paddingHorizontal: 5,
  },
  label: {
    fontSize: 12,
    color: "#888888",
    marginTop: 11,
  },
  value: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
    marginTop: 4,
  },
  statusValue: {
    fontSize: 14,
    color: "#338DA3",
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  itemInfo: {
    flex: 1,
    marginRight: 8,
  },
  productName: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "600",
  },
  itemQuantity: {
    color: "#888888",
    fontSize: 11,
    marginTop: 4,
  },
  itemTotal: {
    fontSize: 12,
    color: "#333333",
    fontWeight: "bold",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 15,
  },
  totalLabel: {
    color: "#555555",
    fontWeight: "bold",
  },
  statusActions: {
    gap: 9,
    marginTop: 10,
    marginBottom: 10,
  },
  statusButton: {
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButton: {
    backgroundColor: "#338DA3",
  },
  cancelButton: {
    backgroundColor: "#DC5555",
  },
  statusButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
  terminalText: {
    fontSize: 12,
    color: "#777777",
    marginTop: 8,
    marginBottom: 12,
  },
});
