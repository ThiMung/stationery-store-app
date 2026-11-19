import { useCallback, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

import { getCurrentUser, logoutUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import { updateMyProfile } from "../services/profileService";
import ProfileForm from "../components/profile/ProfileForm";

export default function ProfileScreen() {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [needLogin, setNeedLogin] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { refreshUser } = useAuth();

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
        error instanceof Error ? error.message : "Không thể tải thông tin tài khoản.";
      Alert.alert("Lỗi", message);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSave = async () => {
    try {
      setSaving(true);
      await updateMyProfile({ fullName, phone, address });
      Alert.alert("Thành công", "Thông tin tài khoản đã được cập nhật.", [
        { text: "OK", onPress: () => router.back() },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Không thể cập nhật thông tin.";
      Alert.alert("Không thể cập nhật", message);
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất không?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            setLoggingOut(true);
            await logoutUser();
            await refreshUser();
            Alert.alert("Thành công", "Đã đăng xuất khỏi tài khoản.");
            router.replace("/(tabs)/login");
          } catch (error) {
            const message =
              error instanceof Error ? error.message : "Không thể đăng xuất.";
            Alert.alert("Lỗi", message);
          } finally {
            setLoggingOut(false);
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#338DA3" />
        <Text style={styles.loadingText}>Đang tải thông tin tài khoản...</Text>
      </View>
    );
  }

  if (needLogin) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyTitle}>Bạn chưa đăng nhập</Text>
        <Text style={styles.emptyText}>Vui lòng đăng nhập để xem thông tin tài khoản.</Text>
        <Pressable
          style={styles.primaryButton}
          onPress={() => router.push("/(tabs)/login")}
        >
          <Text style={styles.primaryButtonText}>Đăng nhập</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F5F7FA" }} edges={["top", "bottom"]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backText}>‹ Quay lại</Text>
        </Pressable>

        <Text style={styles.title}>Thông tin tài khoản</Text>
        <Text style={styles.description}>Cập nhật thông tin cá nhân của bạn.</Text>

        <ProfileForm
          email={email}
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          address={address}
          setAddress={setAddress}
          saving={saving}
          loggingOut={loggingOut}
          onSave={handleSave}
          onLogout={handleLogout}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F7FA" },
  content: { padding: 16, paddingBottom: 35 },
  center: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: { color: "#777777", marginTop: 12 },
  backButton: { alignSelf: "flex-start", paddingVertical: 8 },
  backText: { color: "#338DA3", fontSize: 14, fontWeight: "bold" },
  title: { fontSize: 23, fontWeight: "bold", color: "#333333", marginTop: 12 },
  description: { color: "#777777", fontSize: 13, marginTop: 7, marginBottom: 18 },
  emptyTitle: { fontSize: 18, fontWeight: "bold", color: "#333333" },
  emptyText: { color: "#777777", textAlign: "center", marginTop: 8 },
  primaryButton: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 18,
  },
  primaryButtonText: { color: "#FFFFFF", fontWeight: "bold" },
});
