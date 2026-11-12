
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

import Header from "../../components/Header";
import {
  getUserOrders,
  type OrderSummary,
} from "../../services/orderService";

import { getCurrentUser } from "../../services/authService";

// Chuyển trạng thái đơn hàng thành tiếng Việt
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

export default function OrderHistoryScreen() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [needLogin, setNeedLogin] = useState(false);

  // Tải lịch sử đơn hàng
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
        error instanceof Error
          ? error.message
          : "Không thể tải lịch sử đơn hàng.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại khi người dùng mở màn hình
  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders])
  );

  const renderOrder = ({ item }: { item: OrderSummary }) => {
    return (
      <Pressable
        style={styles.orderCard}
        onPress={() =>
          router.push({
            pathname: "/orders/[id]",
            params: { id: item.id },
          })
        }
      >
        <View style={styles.orderHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.orderId}>
              {item.id}
            </Text>

            <Text style={styles.orderDate}>
              {formatDate(item.createdAt)}
            </Text>
          </View>

          <Text style={styles.status}>
            {getStatusLabel(item.status)}
          </Text>
        </View>

        <View style={styles.separator} />

        <View style={styles.orderFooter}>
          <View>
            <Text style={styles.itemCount}>
              {item.itemCount} loại sản phẩm
            </Text>

            <Text style={styles.totalLabel}>
              Tổng tiền
            </Text>
          </View>

          <Text style={styles.totalPrice}>
            {item.totalAmount.toLocaleString("vi-VN")} đ
          </Text>
        </View>

        <Text style={styles.detailLink}>
          Xem chi tiết đơn hàng →
        </Text>
      </Pressable>
    );
  };

  return (
      <SafeAreaView
    style={{ flex: 1, backgroundColor: "#F5F7FA" }}
    edges={["top", "bottom"]}
  >
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrder}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadOrders}
        ListHeaderComponent={
          <View>
            <Header />

            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Text style={styles.backText}>
                ‹ Quay lại
              </Text>
            </Pressable>

            <Text style={styles.title}>
              Lịch sử đơn hàng
            </Text>

            {!needLogin && (
              <Text style={styles.subtitle}>
                Tổng số đơn hàng: {orders.length}
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
                Vui lòng đăng nhập để xem lịch sử đơn hàng.
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
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📦</Text>

              <Text style={styles.emptyTitle}>
                Bạn chưa có đơn hàng nào
              </Text>

              <Text style={styles.emptyText}>
                Các đơn hàng của bạn sẽ xuất hiện ở đây sau khi đặt hàng thành công.
              </Text>

              <Pressable
                style={styles.primaryButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={styles.primaryButtonText}>
                  Tiếp tục mua sắm
                </Text>
              </Pressable>
            </View>
          )
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
    alignItems: "center",
  },
  orderId: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  orderDate: {
    fontSize: 12,
    color: "#888888",
    marginTop: 5,
  },
  status: {
    color: "#338DA3",
    fontSize: 12,
    fontWeight: "bold",
    backgroundColor: "#EAF2F4",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 7,
    marginLeft: 8,
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
  itemCount: {
    fontSize: 12,
    color: "#777777",
  },
  totalLabel: {
    fontSize: 12,
    color: "#777777",
    marginTop: 6,
  },
  totalPrice: {
    color: "#E76F51",
    fontSize: 16,
    fontWeight: "bold",
  },
  detailLink: {
    textAlign: "right",
    color: "#338DA3",
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 24,
    marginTop: 30,
  },
  emptyIcon: {
    fontSize: 45,
    marginBottom: 12,
  },
  emptyTitle: {
    color: "#333333",
    fontSize: 17,
    fontWeight: "bold",
    textAlign: "center",
  },
  emptyText: {
    color: "#777777",
    fontSize: 13,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
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
