
import { useCallback, useState } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router, useFocusEffect } from "expo-router";

import {
  getCurrentUser,
  logoutUser,
  type AuthenticatedUser,
} from "../services/authService";

import { useAuth } from "../context/AuthContext";

export default function Header() {
  const { refreshUser } = useAuth();
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  // Lấy thông tin người dùng hiện tại
  useFocusEffect(
    useCallback(() => {
      let isActive = true;

      const loadUser = async () => {
        try {
          const currentUser = await getCurrentUser();

          if (isActive) {
            setUser(currentUser);
          }
        } catch (error) {
          console.log("Cannot load current user:", error);

          if (isActive) {
            setUser(null);
          }
        } finally {
          if (isActive) {
            setLoading(false);
          }
        }
      };

      setLoading(true);
      loadUser();

      return () => {
        isActive = false;
      };
    }, [])
  );

  // Xác nhận và thực hiện đăng xuất
  const handleLogout = () => {
    Alert.alert(
      "Đăng xuất",
      "Bạn có chắc chắn muốn đăng xuất không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đăng xuất",
          style: "destructive",
          onPress: async () => {
            try {
              setLoggingOut(true);

              await logoutUser();

              // Đồng bộ trạng thái đăng nhập toàn ứng dụng
              await refreshUser();
              
              setUser(null);

              router.replace("/(tabs)/login");
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Không thể đăng xuất.";

              Alert.alert("Lỗi", message);
            } finally {
              setLoggingOut(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>S</Text>
        </View>

        <View>
          <Text style={styles.appName}>Stationery Store</Text>
          <Text style={styles.subtitle}>
            Your stationery shopping place
          </Text>
        </View>
      </View>

      <View style={styles.userSection}>
        {loading ? (
          <ActivityIndicator color="#338DA3" />
        ) : user ? (
          <>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>
                Xin chào, {user.fullName}!
              </Text>

              <Text style={styles.email}>{user.email}</Text>

              {user.phone ? (
                <Text style={styles.detail}>
                  Số điện thoại: {user.phone}
                </Text>
              ) : null}

              <Text style={styles.role}>
                {user.role === "ADMIN"
                  ? "Quản trị viên"
                  : "Khách hàng"}
              </Text>
            </View>

            <Pressable
              style={styles.logoutButton}
              onPress={handleLogout}
              disabled={loggingOut}
            >
              {loggingOut ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.logoutText}>Đăng xuất</Text>
              )}
            </Pressable>
          </>
        ) : (
          <Text style={styles.guestText}>
            Bạn chưa đăng nhập
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#338DA3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "bold",
  },
  appName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333333",
  },
  subtitle: {
    fontSize: 12,
    color: "#888888",
    marginTop: 3,
  },
  userSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
    paddingTop: 12,
  },
  userInfo: {
    flex: 1,
    marginRight: 10,
  },
  greeting: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  email: {
    fontSize: 13,
    color: "#666666",
    marginTop: 4,
  },
  detail: {
    fontSize: 12,
    color: "#666666",
    marginTop: 3,
  },
  role: {
    fontSize: 12,
    color: "#338DA3",
    fontWeight: "bold",
    marginTop: 5,
  },
  logoutButton: {
    backgroundColor: "#E76F51",
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 12,
  },
  guestText: {
    color: "#888888",
    fontSize: 13,
  },
});
