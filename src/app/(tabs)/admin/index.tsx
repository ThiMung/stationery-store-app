import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import Header from "../../../components/Header";
import { getCurrentUser } from "../../../services/authService";
import AdminMenuCard from "../../../components/admin/AdminMenuCard";

export default function AdminHomeScreen() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const verifyAdmin = async () => {
        setChecking(true);
        setAuthorized(false);

        try {
          const user = await getCurrentUser();
          if (!user) {
            router.replace("/(tabs)/login");
            return;
          }

          if (user.role !== "ADMIN") {
            Alert.alert(
              "Không có quyền truy cập",
              "Chỉ tài khoản Admin mới được sử dụng chức năng này."
            );
            router.replace("/(tabs)");
            return;
          }

          if (isActive) setAuthorized(true);
        } catch {
          if (isActive) {
            Alert.alert("Lỗi", "Không thể xác thực tài khoản.");
            router.replace("/(tabs)/login");
          }
        } finally {
          if (isActive) setChecking(false);
        }
      };

      verifyAdmin();
      return () => {
        isActive = false;
      };
    }, [])
  );

  if (checking) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang kiểm tra quyền truy cập...</Text>
      </View>
    );
  }

  if (!authorized) return null;

  return (
    <ScrollView style={styles.container}>
      <Header />

      <View style={styles.heading}>
        <Text style={styles.title}>Admin Dashboard</Text>
        <Text style={styles.subtitle}>
          Chào mừng bạn đến với trang quản trị hệ thống.
        </Text>
      </View>

      <AdminMenuCard
        icon="👥"
        title="Quản lý người dùng"
        description="Xem, cập nhật vai trò và xóa tài khoản."
        onPress={() => router.push("/admin/users")}
      />

      <AdminMenuCard
        icon="📂"
        title="Quản lý danh mục"
        description="Thêm, chỉnh sửa và xóa danh mục."
        onPress={() => router.push("/admin/categories")}
      />

      <AdminMenuCard
        icon="📦"
        title="Quản lý sản phẩm"
        description="Thêm, chỉnh sửa và xóa sản phẩm."
        onPress={() => router.push("/admin/products")}
      />

      <AdminMenuCard
        icon="🧾"
        title="Quản lý đơn hàng"
        description="Xem đơn hàng của khách và cập nhật trạng thái."
        onPress={() => router.push("/admin/orders")}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
  },
  loadingText: {
    color: "#777777",
    marginTop: 12,
  },
  heading: {
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
  },
  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 6,
  },
});
