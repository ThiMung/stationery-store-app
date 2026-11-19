import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { AuthenticatedUser } from "../../types/user";

interface LoggedInViewProps {
  user: AuthenticatedUser;
  onLogout: () => void;
}

export default function LoggedInView({ user, onLogout }: LoggedInViewProps) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>👤</Text>
        <Text style={styles.title}>Bạn đã đăng nhập</Text>
        <Text style={styles.subtitle}>Bạn đang sử dụng tài khoản:</Text>

        <View style={styles.infoBox}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
          <Text style={styles.role}>
            {user.role === "ADMIN" ? "Quản trị viên" : "Khách hàng"}
          </Text>
        </View>

        <Text style={styles.note}>
          Bạn đã có phiên đăng nhập hoạt động. Vui lòng đăng xuất trước khi sử dụng tài khoản khác.
        </Text>

        <Pressable onPress={onLogout} style={styles.logoutButton}>
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    padding: 24,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  icon: {
    fontSize: 45,
  },
  title: {
    fontSize: 21,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 12,
  },
  subtitle: {
    fontSize: 14,
    color: "#777777",
    marginTop: 8,
    textAlign: "center",
  },
  infoBox: {
    width: "100%",
    backgroundColor: "#F5F7FA",
    padding: 15,
    borderRadius: 10,
    marginTop: 18,
  },
  name: {
    color: "#333333",
    fontWeight: "bold",
  },
  email: {
    color: "#777777",
    marginTop: 6,
  },
  role: {
    color: "#338DA3",
    fontWeight: "bold",
    marginTop: 8,
  },
  note: {
    color: "#777777",
    fontSize: 13,
    textAlign: "center",
    marginTop: 18,
    lineHeight: 20,
  },
  logoutButton: {
    backgroundColor: "#DC5555",
    padding: 14,
    borderRadius: 9,
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  logoutText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
});
