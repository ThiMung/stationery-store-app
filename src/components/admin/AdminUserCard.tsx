import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import type { ManagedUser } from "../../types/user";

interface AdminUserCardProps {
  user: ManagedUser;
  isCurrentAdmin: boolean;
  onChangeRole: (user: ManagedUser) => void;
  onDeleteUser: (user: ManagedUser) => void;
}

export default function AdminUserCard({
  user,
  isCurrentAdmin,
  onChangeRole,
  onDeleteUser,
}: AdminUserCardProps) {
  const isTargetAdmin = user.role === "ADMIN";

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
        <Text
          style={[
            styles.roleBadge,
            isTargetAdmin ? styles.adminBadge : styles.userBadge,
          ]}
        >
          {user.role}
        </Text>
      </View>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          SĐT: {user.phone ?? "Chưa cập nhật"}
        </Text>
        <Text style={styles.detailText}>
          Địa chỉ: {user.address ?? "Chưa cập nhật"}
        </Text>
        <Text style={styles.dateText}>Mã: {user.id}</Text>
      </View>

      <View style={styles.actionRow}>
        <Pressable
          style={[styles.roleButton, isCurrentAdmin && styles.disabledButton]}
          onPress={() => onChangeRole(user)}
          disabled={isCurrentAdmin}
        >
          <Text style={styles.buttonText}>
            {isTargetAdmin ? "Hạ xuống USER" : "Nâng lên ADMIN"}
          </Text>
        </Pressable>

        <Pressable
          style={[styles.deleteButton, isCurrentAdmin && styles.disabledButton]}
          onPress={() => onDeleteUser(user)}
          disabled={isCurrentAdmin}
        >
          <Text style={styles.buttonText}>Xóa</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  email: {
    fontSize: 13,
    color: "#666666",
    marginTop: 2,
  },
  roleBadge: {
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    overflow: "hidden",
  },
  adminBadge: {
    backgroundColor: "#EAF5F8",
    color: "#338DA3",
  },
  userBadge: {
    backgroundColor: "#F3F4F6",
    color: "#4B5563",
  },
  details: {
    marginTop: 10,
    gap: 3,
  },
  detailText: {
    fontSize: 12,
    color: "#777777",
  },
  dateText: {
    fontSize: 11,
    color: "#999999",
    marginTop: 2,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#EEEEEE",
  },
  roleButton: {
    flex: 2,
    backgroundColor: "#338DA3",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  deleteButton: {
    flex: 1,
    backgroundColor: "#E53935",
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "bold",
  },
});
