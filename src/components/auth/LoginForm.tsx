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

interface LoginFormProps {
  email: string;
  setEmail: (val: string) => void;
  password: string;
  setPassword: (val: string) => void;
  loading: boolean;
  onLogin: () => void;
}

export default function LoginForm({
  email,
  setEmail,
  password,
  setPassword,
  loading,
  onLogin,
}: LoginFormProps) {
  return (
    <View style={styles.form}>
      <Text style={styles.label}>Email</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />

      <Text style={styles.label}>Mật khẩu</Text>
      <TextInput
        style={styles.input}
        placeholder="Nhập mật khẩu"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
      />

      <Pressable
        style={[styles.loginButton, loading && styles.disabledButton]}
        onPress={onLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.loginButtonText}>ĐĂNG NHẬP</Text>
        )}
      </Pressable>

      <Text style={styles.note}>Vui lòng nhập đúng thông tin tài khoản.</Text>

      <View style={styles.authFooter}>
        <Text style={styles.authFooterText}>Chưa có tài khoản?</Text>
        <Pressable onPress={() => router.push("/(tabs)/signup")}>
          <Text style={styles.authLink}>Đăng ký</Text>
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
  loginButton: {
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
  loginButtonText: {
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
