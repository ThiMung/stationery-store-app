import {
  View,
  Text,
  Pressable,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";

interface Props {
  title: string;
  description: string;
}

export default function AdminManagementPlaceholder({
  title,
  description,
}: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>
        {description}
      </Text>

      <Pressable
        style={styles.button}
        onPress={() => router.back()}
      >
        <Text style={styles.buttonText}>
          Quay lại Dashboard
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333333",
    textAlign: "center",
  },
  description: {
    fontSize: 14,
    color: "#777777",
    textAlign: "center",
    marginTop: 10,
  },
  button: {
    backgroundColor: "#338DA3",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});