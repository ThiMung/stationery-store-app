
import { View, Text, StyleSheet } from "react-native";

export default function Banner() {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>
        CHÀO MỪNG BẠN ĐẾN VỚI
      </Text>

      <Text style={styles.title}>
        Stationery Store
      </Text>

      <Text style={styles.description}>
        Đầy đủ dụng cụ học tập và văn phòng,
        tiện lợi cho mọi ngày.
      </Text>

      <View style={styles.tag}>
        <Text style={styles.tagText}>
          Khám phá sản phẩm ngay!
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#338DA3",
    padding: 20,
    borderRadius: 16,
    marginTop: 18,
    marginBottom: 20,
  },

  label: {
    color: "#E5F4F7",
    fontSize: 12,
    fontWeight: "600",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 10,
  },

  description: {
    color: "#FFFFFF",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },

  tag: {
    backgroundColor: "#FFFFFF",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 16,
  },

  tagText: {
    color: "#338DA3",
    fontWeight: "600",
    fontSize: 12,
  },
});
