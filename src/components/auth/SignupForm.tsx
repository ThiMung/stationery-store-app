import React from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

interface SignupFormProps {
  fullName: string;
  setFullName: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  confirmPassword: string;
  setConfirmPassword: (val: string) => void;
  successMessage: string;
  loading: boolean;
  onSignup: () => void;
}

export default function SignupForm({
  fullName,
  setFullName,
  email,
  setEmail,
  phone,
  setPhone,
  address,
  setAddress,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  successMessage,
  loading,
  onSignup,
}: SignupFormProps) {
  return (
    <View style={styles.form}>
      <Text style={styles.label}>Họ và tên *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập họ và tên"
        value={fullName}
        onChangeText={setFullName}
        autoCapitalize="words"
      />

      <Text style={styles.label}>Email *</Text>
      <TextInput
        style={styles.input}
        placeholder="example@gmail.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Số điện thoại</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập số điện thoại"
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />

      <Text style={styles.label}>Địa chỉ</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập địa chỉ của bạn"
        value={address}
        onChangeText={setAddress}
      />

      <Text style={styles.label}>Mật khẩu *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu (ít nhất 6 ký tự)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <Text style={styles.label}>Xác nhận mật khẩu *</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập lại mật khẩu"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      {successMessage !== "" && (
        <View style={styles.successMessage}>
          <Text style={styles.successText}>{successMessage}</Text>
        </View>
      )}

      <Pressable
        style={[styles.signupButton, loading && styles.disabledButton]}
        onPress={onSignup}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.signupButtonText}>ĐĂNG KÝ</Text>
        )}
      </Pressable>

      <Text style={styles.note}>Các trường có dấu (*) là bắt buộc.</Text>

      <View style={styles.authFooter}>
        <Text style={styles.authFooterText}>Đã có tài khoản?</Text>
        <Pressable onPress={() => router.push("/(tabs)/login")}>
          <Text style={styles.authLink}>Đăng nhập</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: "#DDDDDD",
    borderRadius: 8,
    paddingHorizontal: 14,
    fontSize: 14,
    backgroundColor: "#FAFAFA",
    color: "#333333",
  },
  signupButton: {
    backgroundColor: "#338DA3",
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22,
  },
  disabledButton: {
    opacity: 0.7,
  },
  signupButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "bold",
  },
  note: {
    fontSize: 12,
    color: "#888888",
    textAlign: "center",
    marginTop: 12,
  },
  successMessage: {
    backgroundColor: "#E8F5E9",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  successText: {
    color: "#2E7D32",
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  authFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
    gap: 6,
  },
  authFooterText: {
    fontSize: 13,
    color: "#666666",
  },
  authLink: {
    fontSize: 13,
    color: "#338DA3",
    fontWeight: "bold",
  },
});
