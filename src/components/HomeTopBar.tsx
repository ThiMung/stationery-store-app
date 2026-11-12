
import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { router } from "expo-router";

interface HomeTopBarProps {
  cartCount: number;
}

export default function HomeTopBar({
  cartCount,
}: HomeTopBarProps) {
  return (
    <View style={styles.container}>
      {/* Logo và thương hiệu */}
      <View style={styles.brandSection}>
        <Image
  source={require("../assets/images/logo.png")}
  style={styles.logoImage}
  resizeMode="contain"
/>

        <View style={styles.brandInfo}>
          <Text style={styles.brandName}>Happy</Text>
          <Text style={styles.slogan}>
            Học tập vui hơn, mỗi ngày tiện hơn.
          </Text>
        </View>
      </View>

      {/* Giỏ hàng */}
      <Pressable
        style={styles.cartButton}
        onPress={() => router.push("/cart")}
        accessibilityRole="button"
        accessibilityLabel={`Giỏ hàng, ${cartCount} sản phẩm`}
        hitSlop={8}
      >
        <View style={styles.cartIconWrapper}>
          <Text style={styles.cartIcon}>🛒</Text>

          {cartCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {cartCount > 99 ? "99+" : cartCount}
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    marginBottom: 12,
  },
  brandSection: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
logoImage: {
  width: 48,
  height: 48,
  marginRight: 10,
},
  brandInfo: {
    flex: 1,
  },
  brandName: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#338DA3",
  },
  slogan: {
    fontSize: 10,
    color: "#777777",
    marginTop: 3,
  },

  // Nút giỏ hàng không có nền
  cartButton: {
    width: 48,
    height: 48,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "visible",
  },

  // Vị trí icon và badge
  cartIconWrapper: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "visible",
  },
  cartIcon: {
    fontSize: 29,
  },

  // Huy hiệu số lượng kiểu Shopee
  badge: {
    position: "absolute",
    top: 0,
    right: -2,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#EE4D2D",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
    elevation: 3,
  },
  badgeText: {
    color: "#EE4D2D",
    fontSize: 10,
    fontWeight: "bold",
  },
});
