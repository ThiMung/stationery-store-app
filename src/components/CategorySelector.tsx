
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
} from "react-native";

import type { Category } from "../types/category";

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId: string | null;
  onSelect: (categoryId: string | null) => void;
}

export default function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
}: CategorySelectorProps) {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
      >
        {/* Hiển thị tất cả sản phẩm */}
        <Pressable
          style={[
            styles.categoryButton,
            selectedCategoryId === null && styles.activeButton,
          ]}
          onPress={() => onSelect(null)}
        >
          <Text
            style={[
              styles.categoryText,
              selectedCategoryId === null && styles.activeText,
            ]}
          >
            Tất cả
          </Text>
        </Pressable>

        {/* Hiển thị từng danh mục */}
        {categories.map((category) => {
          const isSelected =
            selectedCategoryId === category.id;

          return (
            <Pressable
              key={category.id}
              style={[
                styles.categoryButton,
                isSelected && styles.activeButton,
              ]}
              onPress={() => onSelect(category.id)}
            >
              <Text
                style={[
                  styles.categoryText,
                  isSelected && styles.activeText,
                ]}
              >
                {category.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },

  list: {
    gap: 10,
  },

  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#EEEEEE",
  },

  activeButton: {
    backgroundColor: "#338DA3",
  },

  categoryText: {
    fontSize: 13,
    color: "#555555",
    fontWeight: "500",
  },

  activeText: {
    color: "#FFFFFF",
  },
});
