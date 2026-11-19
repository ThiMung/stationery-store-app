import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

interface AdminMenuCardProps {
  icon: string;
  title: string;
  description: string;
  onPress: () => void;
}

export default function AdminMenuCard({
  icon,
  title,
  description,
  onPress,
}: AdminMenuCardProps) {
  return (
    <Pressable style={styles.menuCard} onPress={onPress}>
      <Text style={styles.icon}>{icon}</Text>
      <View style={styles.menuContent}>
        <Text style={styles.menuTitle}>{title}</Text>
        <Text style={styles.menuDescription}>{description}</Text>
      </View>
      <Text style={styles.arrow}>›</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    marginBottom: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  icon: {
    fontSize: 30,
    marginRight: 14,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333333",
  },
  menuDescription: {
    fontSize: 12,
    color: "#777777",
    marginTop: 5,
  },
  arrow: {
    fontSize: 26,
    color: "#338DA3",
    marginLeft: 8,
  },
});
