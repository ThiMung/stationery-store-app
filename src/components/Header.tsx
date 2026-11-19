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

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      const loadUser = async () => {
        try {
          const currentUser = await getCurrentUser();
          if (isActive) setUser(currentUser);
        } catch {
          if (isActive) setUser(null);
        } finally {
          if (isActive) setLoading(false);
        }
      };
      setLoading(true);
      loadUser();
      return () => {
        isActive = false;
      };
    }, [])
  );

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logoutUser();
            await refreshUser();
            setUser(null);
            router.replace("/(tabs)/login");
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Không thể đăng xuất.";
            Alert.alert("Lỗi", message);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.brand}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>S</Text>
        </View>
        <View>
          <Text style={styles.appName}>Stationery Store</Text>
          <Text style={styles.subtitle}>Your stationery shopping place</Text>
        </View>
      </View>

      <View style={styles.userSection}>
        {loading ? (
          <ActivityIndicator color="#338DA3" />
        ) : user ? (
          <>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Xin chào, {user.fullName}!</Text>
              <Text style={styles.email}>{user.email}</Text>
              {user.phone ? (
                <Text style={styles.detail}>Số điện thoại: {user.phone}</Text>
              ) : null}
              <Text style={styles.role}>
                {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
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
          <Text style={styles.guestText}>Bạn chưa đăng nhập</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#338DA3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 18,
  },
  appName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  subtitle: {
    fontSize: 12,
    color: "#777777",
  },
  userSection: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F1F1",
  },
  userInfo: {
    marginBottom: 10,
  },
  greeting: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333333",
  },
  email: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  detail: {
    fontSize: 12,
    color: "#777777",
    marginTop: 2,
  },
  role: {
    fontSize: 12,
    color: "#338DA3",
    fontWeight: "bold",
    marginTop: 4,
  },
  logoutButton: {
    backgroundColor: "#DC5555",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 13,
  },
  guestText: {
    fontSize: 13,
    color: "#777777",
    textAlign: "center",
    paddingVertical: 4,
  },
});
