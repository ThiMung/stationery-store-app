import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { router } from "expo-router";

import { loginUser, logoutUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import LoggedInView from "../../components/auth/LoggedInView";
import LoginForm from "../../components/auth/LoginForm";

export default function LoginScreen() {
  const { user: activeUser, refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      Alert.alert("Thông báo", "Vui lòng nhập email và mật khẩu.");
      return;
    }

    try {
      setLoading(true);
      const user = await loginUser(email, password);
      await refreshUser();

      const destination = user.role === "ADMIN" ? "/admin" : "/(tabs)";
      Alert.alert("Đăng nhập thành công", `Xin chào ${user.fullName}!`, [
        {
          text: "Tiếp tục",
          onPress: () => router.replace(destination),
        },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Đăng nhập thất bại.";
      Alert.alert("Đăng nhập thất bại", message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutFromLogin = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await logoutUser();
            await refreshUser();
            Alert.alert("Thành công", "Đã đăng xuất khỏi tài khoản.");
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Không thể đăng xuất.";
            Alert.alert("Lỗi", message);
          }
        },
      },
    ]);
  };

  if (activeUser) {
    return <LoggedInView user={activeUser} onLogout={handleLogoutFromLogin} />;
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Chào mừng trở lại!</Text>
          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục mua sắm tại Stationery Store.
          </Text>
        </View>

        <LoginForm
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          loading={loading}
          onLogin={handleLogin}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    marginBottom: 28,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333333",
  },
  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 8,
    lineHeight: 22,
  },
});
