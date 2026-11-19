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
import AdminUserCard from "../../../components/admin/AdminUserCard";

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
        error instanceof Error ? error.message : "Không thể tải danh sách người dùng.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUsers();
    }, [loadUsers])
  );

  // Thay đổi vai trò người dùng (USER <-> ADMIN)
  const handleChangeRole = (user: ManagedUser) => {
    const newRole = user.role === "USER" ? "ADMIN" : "USER";

    Alert.alert(
      "Xác nhận thay đổi vai trò",
      `Bạn có muốn đổi ${user.fullName} thành ${newRole} không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xác nhận",
          onPress: async () => {
            try {
              await updateUserRole(user.id, newRole);
              Alert.alert("Thành công", "Đã cập nhật vai trò.");
              await loadUsers();
            } catch (error) {
              const message =
                error instanceof Error ? error.message : "Không thể cập nhật vai trò.";
              Alert.alert("Lỗi", message);
            }
          },
        },
      ]
    );
  };

  // Xóa tài khoản người dùng
  const handleDeleteUser = (user: ManagedUser) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn có chắc chắn muốn xóa tài khoản ${user.fullName} không?`,
      [
        { text: "Hủy", style: "cancel" },
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
                error instanceof Error ? error.message : "Không thể xóa người dùng.";
              Alert.alert("Lỗi", message);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={users}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <AdminUserCard
            user={item}
            isCurrentAdmin={item.id === currentAdminId}
            onChangeRole={handleChangeRole}
            onDeleteUser={handleDeleteUser}
          />
        )}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={loadUsers}
        ListHeaderComponent={
          <View>
            <Pressable style={styles.backButton} onPress={() => router.back()}>
              <Text style={styles.backText}>‹ Quay lại Dashboard</Text>
            </Pressable>
            <Text style={styles.title}>Quản lý người dùng</Text>
            <Text style={styles.subtitle}>Tổng số tài khoản: {users.length}</Text>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#338DA3" style={{ marginTop: 30 }} />
          ) : (
            <Text style={styles.emptyText}>Chưa có người dùng nào.</Text>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  listContent: { padding: 16, paddingBottom: 30 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8 },
  backText: { color: "#338DA3", fontSize: 14, fontWeight: "bold" },
  title: { fontSize: 24, fontWeight: "bold", color: "#333333", marginTop: 8 },
  subtitle: { color: "#777777", fontSize: 13, marginTop: 4, marginBottom: 16 },
  emptyText: { textAlign: "center", color: "#777777", marginTop: 30 },
});
