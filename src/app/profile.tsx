
import { useCallback, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  getCurrentUser,
  logoutUser,
} from "../services/authService";

import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/profileService";

export default function ProfileScreen() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);

  const { refreshUser } = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);

  // Lấy thông tin tài khoản hiện tại
  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);

      const user = await getCurrentUser();

      if (!user) {
        setNeedLogin(true);
        return;
      }

      setNeedLogin(false);
      setEmail(user.email);
      setFullName(user.fullName);
      setPhone(user.phone ?? "");
      setAddress(user.address ?? "");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể tải thông tin tài khoản.";

      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Tải lại thông tin khi mở màn hình
  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  // Lưu thông tin mới
  const handleSave = async () => {
    try {
      setSaving(true);

      await updateMyProfile({
        fullName,
        phone,
        address,
      });

      Alert.alert(
        "Thành công",
        "Thông tin tài khoản đã được cập nhật.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Không thể cập nhật thông tin.";

      Alert.alert("Không thể cập nhật", message);
    } finally {
      setSaving(false);
    }
  };

  // Đăng xuất
  const handleLogout = () => {
  Alert.alert(
    "Đăng xuất",
    "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản này không?",
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
            setLoggingOut(true);

            await logoutUser();

            // Cập nhật trạng thái đăng nhập toàn ứng dụng
            await refreshUser();

            router.replace("/(tabs)/login");
          } catch (error) {
            Alert.alert(
              "Lỗi",
              "Không thể đăng xuất. Vui lòng thử lại."
            );
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]
  );
};

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>
          Đang tải thông tin...
        </Text>
      </View>
    );
  }

  if (needLogin) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Bạn chưa đăng nhập</Text>

        <Text style={styles.description}>
          Vui lòng đăng nhập để xem và cập nhật thông tin cá nhân.
        </Text>

        <Pressable
          style={styles.saveButton}
          onPress={() => router.push("/(tabs)/login")}
        >
          <Text style={styles.saveButtonText}>
            Đăng nhập
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
  <SafeAreaView
    style={{ flex: 1, backgroundColor: "#F5F7FA" }}
    edges={["top", "bottom"]}
  >
  <ScrollView
    style={styles.container}
    contentContainerStyle={{
      paddingHorizontal: 16,
      paddingTop: 16,
      paddingBottom: 35,
    }}
    keyboardShouldPersistTaps="handled"
    showsVerticalScrollIndicator={false}
  >

      <Pressable
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backText}>
          ‹ Quay lại
        </Text>
      </Pressable>

      <Text style={styles.title}>
        Thông tin tài khoản
      </Text>

      <Text style={styles.description}>
        Cập nhật thông tin cá nhân của bạn.
      </Text>

      <View style={styles.form}>
        {/* Email: chỉ xem, không chỉnh sửa */}
        <Text style={styles.label}>Email</Text>

        <TextInput
          style={[styles.input, styles.disabledInput]}
          value={email}
          editable={false}
        />

        <Text style={styles.note}>
          Email được sử dụng để đăng nhập và không thể thay đổi tại đây.
        </Text>

        {/* Họ tên */}
        <Text style={styles.label}>Họ và tên *</Text>

        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Nhập họ và tên"
          maxLength={100}
        />

        {/* Số điện thoại */}
        <Text style={styles.label}>Số điện thoại</Text>

        <TextInput
          style={styles.input}
          value={phone}
          onChangeText={setPhone}
          placeholder="Nhập số điện thoại"
          keyboardType="phone-pad"
        />

        {/* Địa chỉ */}
        <Text style={styles.label}>Địa chỉ</Text>

        <TextInput
          style={[styles.input, styles.addressInput]}
          value={address}
          onChangeText={setAddress}
          placeholder="Nhập địa chỉ của bạn"
          multiline
          maxLength={250}
        />

        <Pressable
          style={[
            styles.saveButton,
            saving && styles.disabledButton,
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.saveButtonText}>
              Lưu thay đổi
            </Text>
          )}
        </Pressable>

        <Pressable
          style={styles.logoutButton}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          {loggingOut ? (
            <ActivityIndicator color="#DC5555" />
          ) : (
            <Text style={styles.logoutButtonText}>
              Đăng xuất khỏi tài khoản
            </Text>
          )}
        </Pressable>

      </View>
    </ScrollView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
  },
  content: {
    padding: 16,
    paddingBottom: 35,
  },
  center: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    color: "#777777",
    marginTop: 12,
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
  title: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#333333",
    marginTop: 12,
  },
  description: {
    color: "#777777",
    fontSize: 13,
    marginTop: 7,
    marginBottom: 18,
  },
  form: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    color: "#444444",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 15,
    marginBottom: 7,
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#333333",
  },
  disabledInput: {
    backgroundColor: "#F1F3F5",
    color: "#888888",
  },
  note: {
    color: "#888888",
    fontSize: 11,
    marginTop: 6,
  },
  addressInput: {
    minHeight: 85,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  saveButton: {
    backgroundColor: "#338DA3",
    padding: 14,
    borderRadius: 9,
    alignItems: "center",
    marginTop: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 14,
  },
  logoutButton: {
  backgroundColor: "#FFF5F5",
  borderWidth: 1,
  borderColor: "#F2CCCC",
  padding: 13,
  borderRadius: 9,
  alignItems: "center",
  marginTop: 14,
},

logoutButtonText: {
  color: "#DC5555",
  fontWeight: "bold",
  fontSize: 14,
},
});
