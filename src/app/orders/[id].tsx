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

import {
  getOrderDetails,
  type OrderDetail,
} from "../../services/orderService";

function getStatusLabel(status: string) {
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

function formatDate(dateString: string) {
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) {
    return dateString;
  }

  return date.toLocaleString("vi-VN");
}

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const loadOrder = useCallback(async () => {
    try {
      setLoading(true);

      const data = await getOrderDetails(id);
      setOrder(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải chi tiết đơn hàng.";

      Alert.alert("Lỗi", message, [
        {
          text: "Quay lại",
          onPress: () => router.back(),
        },
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
        <Text style={styles.loadingText}>
          Đang tải thông tin đơn hàng...
        </Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>
          Không tìm thấy đơn hàng.
        </Text>

        <Pressable
          style={styles.button}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>
            Quay lại
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
  <ScrollView
    style={{ flex: 1 }}
    contentContainerStyle={{
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 36,
    }}
    showsVerticalScrollIndicator={false}
  >

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ‹ Quay lại lịch sử đơn hàng
        </Text>
      </Pressable>

      <Text style={styles.title}>
        Chi tiết đơn hàng
      </Text>

      {/* Thông tin đơn hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Thông tin đơn hàng
        </Text>

        <Text style={styles.label}>Mã đơn hàng</Text>
        <Text style={styles.value}>{order.id}</Text>

        <Text style={styles.label}>Ngày đặt</Text>
        <Text style={styles.value}>
          {formatDate(order.createdAt)}
        </Text>

        <Text style={styles.label}>Trạng thái</Text>
        <Text style={styles.status}>
          {getStatusLabel(order.status)}
        </Text>
      </View>

      {/* Thông tin nhận hàng */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Thông tin nhận hàng
        </Text>

        <Text style={styles.label}>Người nhận</Text>
        <Text style={styles.value}>
          {order.recipientName}
        </Text>

        <Text style={styles.label}>Số điện thoại</Text>
        <Text style={styles.value}>{order.phone}</Text>

        <Text style={styles.label}>Địa chỉ</Text>
        <Text style={styles.value}>{order.address}</Text>
      </View>

      {/* Danh sách sản phẩm */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          Sản phẩm đã đặt
        </Text>

        {order.items.map((item) => (
          <View key={item.id} style={styles.itemRow}>
            <View style={styles.itemInfo}>
              <Text style={styles.productName}>
                {item.productName}
              </Text>

              <Text style={styles.productQuantity}>
                {item.unitPrice.toLocaleString("vi-VN")} đ × {item.quantity}
              </Text>
            </View>

            <Text style={styles.subtotal}>
              {(item.unitPrice * item.quantity).toLocaleString("vi-VN")} đ
            </Text>
          </View>
        ))}
      </View>

      {/* Tổng tiền */}
      <View style={styles.totalSection}>
        <Text style={styles.totalLabel}>
          Tổng thanh toán
        </Text>

        <Text style={styles.totalPrice}>
          {order.totalAmount.toLocaleString("vi-VN")} đ
        </Text>
      </View>
    </ScrollView>
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
    paddingBottom: 30,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F7FA",
    padding: 20,
  },
  loadingText: {
    color: "#777777",
    marginTop: 10,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#333333",
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#338DA3",
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 12,
    marginBottom: 15,
  },
  section: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    color: "#333333",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: "#888888",
    marginTop: 10,
  },
  value: {
    fontSize: 14,
    color: "#333333",
    fontWeight: "600",
    marginTop: 4,
  },
  status: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF2F4",
    color: "#338DA3",
    fontSize: 13,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 7,
    marginTop: 5,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#EEEEEE",
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  productName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  productQuantity: {
    fontSize: 12,
    color: "#888888",
    marginTop: 5,
  },
  subtotal: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "bold",
  },
  totalSection: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    color: "#555555",
    fontWeight: "bold",
  },
  totalPrice: {
    color: "#E76F51",
    fontSize: 18,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});
