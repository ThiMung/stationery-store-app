
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { getCurrentUser } from "../../../services/authService";
import {
  deleteUser,
  getManagedUsers,
  updateUserRole,
  type ManagedUser,
} from "../../../services/userService";

export default function AdminUsersScreen() {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Tải danh sách người dùng từ SQLite
  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);

      const currentUser = await getCurrentUser();
      setCurrentAdminId(currentUser?.id ?? null);

      const data = await getManagedUsers();
      setUsers(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải danh sách người dùng.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại dữ liệu khi mở màn hình
  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  // Thay đổi vai trò người dùng
  const handleChangeRole = (user: ManagedUser) => {
    const newRole = user.role === "USER" ? "ADMIN" : "USER";

    Alert.alert(
      "Xác nhận thay đổi vai trò",
      `Bạn có muốn đổi ${user.fullName} thành ${newRole} không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              await updateUserRole(user.id, newRole);

              Alert.alert("Thành công", "Đã cập nhật vai trò.");
              await loadUsers();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Không thể cập nhật vai trò.";

              Alert.alert("Lỗi", message);
            }
          },
        },
      ]
    );
  };

  // Xóa người dùng
  const handleDeleteUser = (user: ManagedUser) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa tài khoản ${user.fullName} không?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteUser(user.id);

              Alert.alert("Thành công", "Đã xóa người dùng.");
              await loadUsers();
            } catch (error) {
              const message =
                error instanceof Error
                  ? error.message
                  : "Không thể xóa người dùng.";

              Alert.alert("Lỗi", message);
            }
          },
        },
      ]
    );
  };

  // Hiển thị từng người dùng
  const renderUser = ({ item }: { item: ManagedUser }) => {
    const isCurrentAdmin = item.id === currentAdminId;

    return (
      <View style={styles.userCard}>
        <View style={styles.userHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {item.fullName.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.userInfo}>
            <Text style={styles.userName}>
              {item.fullName}
            </Text>

            <Text style={styles.userEmail}>
              {item.email}
            </Text>
          </View>

          <View
            style={[
              styles.roleBadge,
              item.role === "ADMIN"
                ? styles.adminBadge
                : styles.userBadge,
            ]}
          >
            <Text
              style={[
                styles.roleText,
                item.role === "ADMIN"
                  ? styles.adminText
                  : styles.normalUserText,
              ]}
            >
              {item.role}
            </Text>
          </View>
        </View>

        <View style={styles.separator} />

        <Text style={styles.detailText}>
          ID: {item.id}
        </Text>

        <Text style={styles.detailText}>
          Số điện thoại: {item.phone || "Chưa cập nhật"}
        </Text>

        <Text style={styles.detailText}>
          Địa chỉ: {item.address || "Chưa cập nhật"}
        </Text>

        {isCurrentAdmin ? (
          <Text style={styles.currentAccount}>
            Đây là tài khoản Admin đang đăng nhập.
          </Text>
        ) : (
          <View style={styles.actionRow}>
            <Pressable
              style={styles.roleButton}
              onPress={() => handleChangeRole(item)}
            >
              <Text style={styles.buttonText}>
                Đổi thành {item.role === "USER" ? "ADMIN" : "USER"}
              </Text>
            </Pressable>

            <Pressable
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item)}
            >
              <Text style={styles.buttonText}>
                Xóa
              </Text>
            </Pressable>
          </View>
        )}
      </View>
    );
  };

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={styles.listContent}
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={renderUser}
      refreshing={loading}
      onRefresh={loadUsers}
      ListHeaderComponent={
        <View>
          <Pressable
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>
              ‹ Quay lại Dashboard
            </Text>
          </Pressable>

          <Text style={styles.title}>
            Quản lý người dùng
          </Text>

          <Text style={styles.subtitle}>
            Tổng số tài khoản: {users.length}
          </Text>
        </View>
      }
      ListEmptyComponent={
        loading ? (
          <ActivityIndicator
            size="large"
            color="#338DA3"
            style={{ marginTop: 30 }}
          />
        ) : (
          <Text style={styles.emptyText}>
            Chưa có người dùng nào.
          </Text>
        )
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 15,
  },
  subtitle: {
    fontSize: 13,
    color: "#777777",
    marginTop: 5,
    marginBottom: 15,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingVertical: 8,
  },
  backText: {
    color: "#338DA3",
    fontSize: 14,
    fontWeight: "bold",
  },
  userCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  userHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#338DA3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#333333",
  },
  userEmail: {
    fontSize: 12,
    color: "#777777",
    marginTop: 4,
  },
  roleBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 6,
  },
  adminBadge: {
    backgroundColor: "#FFF0D9",
  },
  userBadge: {
    backgroundColor: "#E0F2FE",
  },
  roleText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  adminText: {
    color: "#C47A13",
  },
  normalUserText: {
    color: "#338DA3",
  },
  separator: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12,
  },
  detailText: {
    fontSize: 12,
    color: "#666666",
    marginBottom: 6,
  },
  actionRow: {
    flexDirection: "row",
    marginTop: 12,
    gap: 10,
  },
  roleButton: {
    flex: 1,
    backgroundColor: "#338DA3",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteButton: {
    backgroundColor: "#DC5555",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  currentAccount: {
    color: "#338DA3",
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 12,
  },
  emptyText: {
    textAlign: "center",
    color: "#888888",
    marginTop: 30,
  },
});
