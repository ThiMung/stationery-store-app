
import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";

import { router } from "expo-router";

import {
  loginUser,
  logoutUser,
} from "../../services/authService";

import { useAuth } from "../../context/AuthContext";

export default function LoginScreen() {
  const { user: activeUser, refreshUser } = useAuth();
  // State lưu thông tin đăng nhập
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Trạng thái xử lý đăng nhập
  const [loading, setLoading] = useState(false);

  // Hàm xử lý đăng nhập
  const handleLogin = async () => {

    // 1. Kiểm tra dữ liệu nhập
    if (!email.trim() || !password) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập email và mật khẩu."
      );
      return;
    }

    try {
      setLoading(true);

      // 2. Gọi hàm đăng nhập
      const user = await loginUser(email, password);
      await refreshUser();
      console.log("Logged in user:", user);

      // 3. Điều hướng theo vai trò
      const destination =
        user.role === "ADMIN" ? "/admin" : "/(tabs)";

      Alert.alert(
        "Đăng nhập thành công",
        `Xin chào ${user.fullName}!`,
        [
          {
            text: "Tiếp tục",
            onPress: () => {
              router.replace(destination);
            },
          },
        ]
      );

    } catch (error) {

      // 4. Hiển thị lỗi
      const message =
        error instanceof Error
          ? error.message
          : "Đăng nhập thất bại.";

      Alert.alert(
        "Đăng nhập thất bại",
        message
      );

    } finally {
      setLoading(false);
    }
  };

  const handleLogoutFromLogin = () => {
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
            await logoutUser();

            // Cập nhật lại trạng thái đăng nhập
            await refreshUser();

            Alert.alert(
              "Thành công",
              "Bạn đã đăng xuất."
            );
          } catch (error) {
            Alert.alert(
              "Lỗi",
              "Không thể đăng xuất. Vui lòng thử lại."
            );
          }
        },
      },
    ]
  );
};


// Nếu đã đăng nhập thì không hiển thị form Login nữa
if (activeUser) {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F5F7FA",
        justifyContent: "center",
        padding: 20,
      }}
    >
      <View
        style={{
          backgroundColor: "#FFFFFF",
          padding: 24,
          borderRadius: 14,
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#E5E7EB",
        }}
      >
        <Text style={{ fontSize: 45 }}>
          👤
        </Text>

        <Text
          style={{
            fontSize: 21,
            fontWeight: "bold",
            color: "#333333",
            marginTop: 12,
          }}
        >
          Bạn đã đăng nhập
        </Text>

        <Text
          style={{
            fontSize: 14,
            color: "#777777",
            marginTop: 8,
            textAlign: "center",
          }}
        >
          Bạn đang sử dụng tài khoản:
        </Text>

        <View
          style={{
            width: "100%",
            backgroundColor: "#F5F7FA",
            padding: 15,
            borderRadius: 10,
            marginTop: 18,
          }}
        >
          <Text style={{ color: "#333333", fontWeight: "bold" }}>
            {activeUser.fullName}
          </Text>

          <Text style={{ color: "#777777", marginTop: 6 }}>
            {activeUser.email}
          </Text>

          <Text
            style={{
              color: "#338DA3",
              fontWeight: "bold",
              marginTop: 8,
            }}
          >
            {activeUser.role === "ADMIN"
              ? "Quản trị viên"
              : "Khách hàng"}
          </Text>
        </View>

        <Text
          style={{
            color: "#777777",
            fontSize: 13,
            textAlign: "center",
            marginTop: 18,
            lineHeight: 20,
          }}
        >
          Bạn đã có phiên đăng nhập hoạt động.
          Vui lòng đăng xuất trước khi sử dụng tài khoản khác.
        </Text>

        <Pressable
          onPress={handleLogoutFromLogin}
          style={{
            backgroundColor: "#DC5555",
            padding: 14,
            borderRadius: 9,
            width: "100%",
            alignItems: "center",
            marginTop: 20,
          }}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontWeight: "bold",
              fontSize: 14,
            }}
          >
            Đăng xuất
          </Text>
        </Pressable>
      </View>
    </View>
  );
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

        {/* Tiêu đề */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Chào mừng trở lại!
          </Text>

          <Text style={styles.subtitle}>
            Đăng nhập để tiếp tục mua sắm
            tại Stationery Store.
          </Text>
        </View>

        {/* Form đăng nhập */}
        <View style={styles.form}>

          {/* Email */}
          <Text style={styles.label}>
            Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Mật khẩu */}
          <Text style={styles.label}>
            Mật khẩu
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Nút đăng nhập */}
          <Pressable
            style={[
              styles.loginButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.loginButtonText}>
                ĐĂNG NHẬP
              </Text>
            )}
          </Pressable>

          <Text style={styles.note}>
            Vui lòng nhập đúng thông tin tài khoản.
          </Text>

          <View style={styles.authFooter}>
            <Text style={styles.authFooterText}>
              Chưa có tài khoản?
            </Text>

            <Pressable
              onPress={() => router.push("/(tabs)/signup")}
            >
              <Text style={styles.authLink}>
                Đăng ký
              </Text>
            </Pressable>
          </View>

        </View>

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

  form: {
    backgroundColor: "#FFFFFF",
    padding: 20,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    marginTop: 16,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333333",
    backgroundColor: "#FFFFFF",
  },

  loginButton: {
    height: 50,
    backgroundColor: "#338DA3",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
  },

  disabledButton: {
    opacity: 0.6,
  },

  loginButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 15,
  },

  note: {
    color: "#888888",
    fontSize: 12,
    textAlign: "center",
    marginTop: 15,
  },
  authFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 20,
  },

  authFooterText: {
    color: "#666666",
    fontSize: 14,
    marginRight: 5,
  },

  authLink: {
    color: "#338DA3",
    fontSize: 14,
    fontWeight: "bold",
  },
});
