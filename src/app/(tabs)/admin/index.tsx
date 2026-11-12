
import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import Header from "../../../components/Header";
import { getCurrentUser } from "../../../services/authService";

export default function AdminHomeScreen() {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  // Kiểm tra quyền truy cập Admin
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

          if (isActive) {
            setAuthorized(true);
          }
        } catch (error) {
          console.log("Admin authorization error:", error);

          if (isActive) {
            Alert.alert("Lỗi", "Không thể xác thực tài khoản.");
            router.replace("/(tabs)/login");
          }
        } finally {
          if (isActive) {
            setChecking(false);
          }
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
        <Text style={styles.loadingText}>
          Đang kiểm tra quyền truy cập...
        </Text>
      </View>
    );
  }

  if (!authorized) {
    return null;
  }

  return (
    <ScrollView style={styles.container}>
      <Header />

      <View style={styles.heading}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <Text style={styles.subtitle}>
          Chào mừng bạn đến với trang quản trị hệ thống.
        </Text>
      </View>

      <Pressable
        style={styles.menuCard}
        onPress={() => router.push("/admin/users")}
      >
        <Text style={styles.icon}>👥</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>
            Quản lý người dùng
          </Text>
          <Text style={styles.menuDescription}>
            Xem, cập nhật vai trò và xóa tài khoản.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable
        style={styles.menuCard}
        onPress={() => router.push("/admin/categories")}
      >
        <Text style={styles.icon}>📂</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>
            Quản lý danh mục
          </Text>
          <Text style={styles.menuDescription}>
            Thêm, chỉnh sửa và xóa danh mục.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>

      <Pressable
        style={styles.menuCard}
        onPress={() => router.push("/admin/products")}
      >
        <Text style={styles.icon}>📦</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>
            Quản lý sản phẩm
          </Text>
          <Text style={styles.menuDescription}>
            Thêm, chỉnh sửa và xóa sản phẩm.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>
      
      {/* Quản lý đơn hàng */}
      <Pressable
        style={styles.menuCard}
        onPress={() => router.push("/admin/orders")}
      >
        <Text style={styles.icon}>🧾</Text>

        <View style={styles.menuContent}>
          <Text style={styles.menuTitle}>
            Quản lý đơn hàng
          </Text>

          <Text style={styles.menuDescription}>
            Xem đơn hàng của khách và cập nhật trạng thái.
          </Text>
        </View>

        <Text style={styles.arrow}>›</Text>
      </Pressable>
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
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  icon: {
    fontSize: 30,
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  menuDescription: {
    fontSize: 12,
    color: "#777777",
    marginTop: 5,
  },
  arrow: {
    fontSize: 26,
    color: "#338DA3",
    marginLeft: 8,
  },
});
