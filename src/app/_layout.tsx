import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
  Stack,
} from "expo-router";

import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { AuthProvider } from "../context/AuthContext";

import { AnimatedSplashOverlay } from "@/components/animated-icon";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <AuthProvider>
    <ThemeProvider
      value={
        colorScheme === "dark"
          ? DarkTheme
          : DefaultTheme
      }
    >
      <AnimatedSplashOverlay />

      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="products/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
          <Stack.Screen
          name="cart"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
          <Stack.Screen
          name="checkout"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="orders/index"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="orders/[id]"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />

        <Stack.Screen
          name="profile"
          options={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </Stack>
    </ThemeProvider>
    </AuthProvider>
  );
}
