
import { NativeTabs } from "expo-router/native-tabs";
import {
  useColorScheme,
  View,
  ActivityIndicator,
} from "react-native";

import { Colors } from "@/constants/theme";
import { useAuth } from "../context/AuthContext";

export default function AppTabs() {
  const scheme = useColorScheme();
  const colors = Colors[scheme === "dark" ? "dark" : "light"];

  // Lấy thông tin tài khoản đang đăng nhập
  const { user, loading } = useAuth();

  // Kiểm tra có phải Admin không
  const isAdmin = user?.role === "ADMIN";

  // Chờ kiểm tra session trước khi hiển thị Bottom Tab
  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color="#338DA3" size="large" />
      </View>
    );
  }

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{
        selected: { color: colors.text },
      }}
    >
      {/* Tab 1: Home của User */}
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          Home
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon md="home" />
      </NativeTabs.Trigger>

      {/* Tab 2: Chỉ Admin mới nhìn thấy */}
      <NativeTabs.Trigger
        name="admin"
        hidden={!isAdmin}
      >
        <NativeTabs.Trigger.Label>
          Admin
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon md="admin_panel_settings" />
      </NativeTabs.Trigger>

      {/* Tab 3: Sign up */}
      <NativeTabs.Trigger name="signup">
        <NativeTabs.Trigger.Label>
          Sign up
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon md="person_add" />
      </NativeTabs.Trigger>

      {/* Tab 4: Login */}
      <NativeTabs.Trigger name="login">
        <NativeTabs.Trigger.Label>
          Login
        </NativeTabs.Trigger.Label>

        <NativeTabs.Trigger.Icon md="login" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
