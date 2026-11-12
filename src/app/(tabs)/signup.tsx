import { useState } from "react";

import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { router } from "expo-router";

import { registerUser } from "../../services/authService";

export default function SignupScreen() {
  // Các state lưu thông tin người dùng nhập
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Trạng thái xử lý đăng ký
  const [loading, setLoading] = useState(false);

  const [successMessage, setSuccessMessage] = useState("");

  // Hàm xử lý đăng ký
  const handleSignup = async () => {
    // 1. Kiểm tra các trường bắt buộc
    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      Alert.alert(
        "Thông báo",
        "Vui lòng nhập đầy đủ họ tên, email và mật khẩu."
      );
      return;
    }

    // 2. Kiểm tra xác nhận mật khẩu
    if (password !== confirmPassword) {
      Alert.alert(
        "Mật khẩu không khớp",
        "Vui lòng kiểm tra lại mật khẩu xác nhận."
      );
      return;
    }

    try {
      setLoading(true);

      // 3. Gọi hàm đăng ký và lưu vào SQLite
      const newUser = await registerUser({
        fullName,
        email,
        password,
        phone,
        address,
      });

      // Xóa dữ liệu form
      setFullName("");
      setEmail("");
      setPhone("");
      setAddress("");
      setPassword("");
      setConfirmPassword("");

      // Tự động chuyển sang Login sau 1,2 giây
      setTimeout(() => {
        router.replace("/(tabs)/login");
      }, 1200);

    } catch (error) {
      // 5. Hiển thị thông báo nếu đăng ký thất bại
      const message =
        error instanceof Error
          ? error.message
          : "Đã xảy ra lỗi khi đăng ký.";

      Alert.alert("Đăng ký thất bại", message);

    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Tiêu đề */}
        <View style={styles.header}>
          <Text style={styles.title}>
            Tạo tài khoản
          </Text>

          <Text style={styles.subtitle}>
            Đăng ký để trải nghiệm mua sắm tại
            Stationery Store.
          </Text>
        </View>

        {/* Form đăng ký */}
        <View style={styles.form}>

          {/* Họ và tên */}
          <Text style={styles.label}>
            Họ và tên *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập họ và tên"
            value={fullName}
            onChangeText={setFullName}
            autoCapitalize="words"
          />

          {/* Email */}
          <Text style={styles.label}>
            Email *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="example@gmail.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          {/* Số điện thoại */}
          <Text style={styles.label}>
            Số điện thoại
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập số điện thoại"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
          />

          {/* Địa chỉ */}
          <Text style={styles.label}>
            Địa chỉ
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập địa chỉ của bạn"
            value={address}
            onChangeText={setAddress}
          />

          {/* Mật khẩu */}
          <Text style={styles.label}>
            Mật khẩu *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Xác nhận mật khẩu */}
          <Text style={styles.label}>
            Xác nhận mật khẩu *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Nhập lại mật khẩu"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
          />

          {/* Thông báo thành công */}
          {successMessage !== "" && (
            <View style={styles.successMessage}>
              <Text style={styles.successText}>
                {successMessage}
              </Text>
            </View>
          )}

          {/* Nút đăng ký */}
          <Pressable
            style={[
              styles.signupButton,
              loading && styles.disabledButton,
            ]}
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.signupButtonText}>
                ĐĂNG KÝ
              </Text>
            )}
          </Pressable>

          <Text style={styles.note}>
            Các trường có dấu (*) là bắt buộc.
          </Text>

          <View style={styles.authFooter}>
            <Text style={styles.authFooterText}>
              Đã có tài khoản?
            </Text>

            <Pressable
              onPress={() => router.push("/(tabs)/login")}
            >
              <Text style={styles.authLink}>
                Đăng nhập
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
    padding: 20,
    paddingBottom: 35,
  },

  header: {
    marginTop: 20,
    marginBottom: 25,
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
    lineHeight: 21,
  },

  form: {
    backgroundColor: "#FFFFFF",
    padding: 18,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
    marginTop: 14,
  },

  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    backgroundColor: "#FFFFFF",
    color: "#333333",
  },

  signupButton: {
    height: 50,
    backgroundColor: "#338DA3",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 25,
  },

  disabledButton: {
    opacity: 0.6,
  },

  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },

  note: {
    color: "#888888",
    fontSize: 12,
    marginTop: 14,
    textAlign: "center",
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
  successMessage: {
  backgroundColor: "#E8F5E9",
  borderRadius: 8,
  padding: 12,
  marginTop: 15,
},

successText: {
  color: "#2E7D32",
  fontSize: 13,
  textAlign: "center",
  fontWeight: "600",
},
});
